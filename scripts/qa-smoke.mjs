#!/usr/bin/env node
/**
 * GradePulse QA: authenticated page smoke test.
 * Signs up a throwaway account (Confirm email must be OFF), seeds a known
 * dataset, serializes session cookies exactly like @supabase/ssr, fetches
 * dashboard/semester/course/calendar/gpa pages and asserts the values the
 * calculation engine must have rendered — including empty states, countdown
 * badges and the event completion round-trip. Cleans up after itself.
 * Run: npm run qa:smoke   (app must be running on :3000)
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient as createRestClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE = process.env.QA_BASE_URL ?? "http://localhost:3000";
if (!url || !anon) {
  console.error("FAIL  .env.local missing Supabase credentials");
  process.exit(1);
}

let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
};

// --- Sign up + cookie jar via @supabase/ssr (identical to the app) --------
const jar = new Map();
const authed = createServerClient(url, anon, {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)),
  },
});

const email = `gradepulse.smoke.${Date.now()}@gmail.com`;
const password = `Qa!${randomUUID()}`;
const { data: signed, error: signUpError } = await authed.auth.signUp({
  email,
  password,
});
if (signUpError) {
  console.error(`FAIL  signup: ${signUpError.message}`);
  process.exit(1);
}
if (!signed.session) {
  console.log(
    "INFO  'Confirm email' is still ON — qa:smoke needs it OFF. Skipping."
  );
  process.exit(0);
}
check("signUp returned a session (confirmation off)", true);

// --- Authenticated page fetches (cookie jar filled by signUp) -------------
const cookieHeader = [...jar]
  .map(([name, value]) => `${name}=${value}`)
  .join("; ");

async function fetchPage(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { cookie: cookieHeader },
    redirect: "manual",
  });
  const html =
    res.status >= 200 && res.status < 300
      ? // React SSR inserts `<!-- -->` between adjacent text interpolations;
        // strip them so plain substring assertions work.
        (await res.text()).replaceAll("<!-- -->", "")
      : "";
  return { status: res.status, html };
}


// Calendar is empty before any courses/events exist (§20 empty state).
{
  const cal = await fetchPage("/calendar");
  check(
    "calendar empty state: no courses yet",
    cal.status === 200 && cal.html.includes("No courses yet")
  );
}

// Empty states before any data exists (§25) + auth-page redirect behaviour.
{
  const dash = await fetchPage("/dashboard");
  check(
    "dashboard shows onboarding when there are no semesters",
    dash.status === 200 && dash.html.includes("Start tracking your semester")
  );
  const gpa = await fetchPage("/gpa");
  check(
    "gpa page empty state before any semester exists",
    gpa.status === 200 && gpa.html.includes("GPA &amp; CGPA")
  );
  const auth = await fetch(`${BASE}/auth/login`, {
    headers: { cookie: cookieHeader },
    redirect: "manual",
  });
  check(
    "authenticated /auth/login redirects to /dashboard",
    auth.status >= 300 &&
      auth.status < 400 &&
      (auth.headers.get("location") ?? "").includes("/dashboard"),
    `got ${auth.status} → ${auth.headers.get("location")}`
  );
}

const userId = signed.session.user.id;
const rest = createRestClient(url, anon, {
  global: { headers: { Authorization: `Bearer ${signed.session.access_token}` } },
});

// --- Seed: Course A scored (expected secured 41/100), Course B empty ------
// Attendance10 (9/10), ClassTests20 (8/10 + pending 10), Assignments30
// (24/30), Final40 (undefined) → secured 9+8+24 = 41 → 41%, remaining 59,
// max possible 41 + (0+10+0+40) = 91. Category pcts: 90 / 80 / 80 / null.
const stamp = Date.now();
const { data: sem } = await rest
  .from("semesters")
  .insert({
    user_id: userId,
    name: `QA Smoke ${stamp}`,
    academic_year: "2099-2100",
    start_date: "2099-09-01",
    end_date: "2099-12-31",
    status: "active",
  })
  .select()
  .single();
check("seed: semester created", Boolean(sem));
if (!sem) process.exit(1);

const { data: courseA } = await rest
  .from("courses")
  .insert({
    user_id: userId,
    semester_id: sem.id,
    name: "QA Database Systems",
    code: "QA-341",
    credits: 3,
    total_marks: 100,
    passing_marks: 50,
    grading_scale: [
      { grade: "C", min_percentage: 40, grade_point: 2 },
      { grade: "B", min_percentage: 70, grade_point: 3 },
      { grade: "A", min_percentage: 85, grade_point: 4 },
    ],
  })
  .select()
  .single();
const { data: courseB } = await rest
  .from("courses")
  .insert({
    user_id: userId,
    semester_id: sem.id,
    name: "QA Empty Course",
    code: "QA-100",
    credits: 2,
    total_marks: 100,
    passing_marks: 50,
    grading_scale: [],
  })
  .select()
  .single();
check("seed: two courses created", Boolean(courseA) && Boolean(courseB));

const cats = {};
for (const [key, name, weight, sort] of [
  ["att", "Attendance", 10, 0],
  ["ct", "Class Tests", 20, 1],
  ["asg", "Assignments", 30, 2],
  ["fin", "Final", 40, 3],
]) {
  const { data } = await rest
    .from("assessment_categories")
    .insert({
      user_id: userId,
      course_id: courseA.id,
      name,
      weight,
      sort_order: sort,
    })
    .select()
    .single();
  cats[key] = data;
}
check(
  "seed: four categories created",
  Object.values(cats).every(Boolean)
);

const assessments = [
  { c: "att", title: "Attendance", obtained_marks: 9, maximum_marks: 10, status: "completed", date: "2026-09-01" },
  { c: "ct", title: "CT 1", obtained_marks: 8, maximum_marks: 10, status: "completed", date: "2026-09-10" },
  { c: "ct", title: "CT 2", obtained_marks: null, maximum_marks: 10, status: "pending", date: "2026-09-20" },
  { c: "asg", title: "Assignment 1", obtained_marks: 24, maximum_marks: 30, status: "completed", date: "2026-09-05" },
];
for (const a of assessments) {
  const { error } = await rest.from("assessments").insert({
    user_id: userId,
    category_id: cats[a.c].id,
    title: a.title,
    obtained_marks: a.obtained_marks,
    maximum_marks: a.maximum_marks,
    status: a.status,
    date: a.date,
  });
  if (error) check(`seed: assessment ${a.title}`, false, error.message);
}
check("seed: assessments created", true);

const { error: targetErr } = await rest.from("targets").insert({
  user_id: userId,
  course_id: courseA.id,
  label: "Custom",
  percentage: 80,
  kind: "custom",
});
check("seed: target 80% created", !targetErr, targetErr?.message);

// --- Completed semester for CGPA (§21): 85% → A (4.0) × 3 credits --------
const { data: semDone } = await rest
  .from("semesters")
  .insert({
    user_id: userId,
    name: `QA Completed ${stamp}`,
    academic_year: "2098-2099",
    start_date: "2098-09-01",
    end_date: "2098-12-31",
    status: "completed",
  })
  .select()
  .single();
check("seed: completed semester created", Boolean(semDone));

const { data: doneCourse } = await rest
  .from("courses")
  .insert({
    user_id: userId,
    semester_id: semDone?.id,
    name: "QA Done Course",
    code: "QA-200",
    credits: 3,
    total_marks: 100,
    passing_marks: 50,
    grading_scale: [{ grade: "A", min_percentage: 80, grade_point: 4 }],
  })
  .select()
  .single();
const { data: doneCat } = await rest
  .from("assessment_categories")
  .insert({
    user_id: userId,
    course_id: doneCourse?.id,
    name: "Exams",
    weight: 100,
    sort_order: 0,
  })
  .select()
  .single();
const { error: doneAsmErr } = await rest.from("assessments").insert({
  user_id: userId,
  category_id: doneCat?.id,
  title: "Final Exam",
  obtained_marks: 85,
  maximum_marks: 100,
  status: "completed",
  date: "2098-12-20",
});
check("seed: completed-semester course graded 85/100", !doneAsmErr);

// --- Academic events (§20): upcoming, overdue, completed ------------------
const localPlus = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const events = [
  { title: "QA Quiz", type: "Quiz", event_date: localPlus(3), is_completed: false },
  { title: "QA Overdue HW", type: "Assignment", event_date: localPlus(-2), is_completed: false },
  { title: "QA Done Event", type: "CT", event_date: localPlus(1), is_completed: true },
];
const seededEvents = [];
for (const ev of events) {
  const { data, error } = await rest
    .from("academic_events")
    .insert({
      user_id: userId,
      course_id: courseA.id,
      ...ev,
    })
    .select("id, title")
    .single();
  if (error) check(`seed: event ${ev.title}`, false, error.message);
  else seededEvents.push(data);
}
check("seed: academic events created", seededEvents.length === events.length);
const qaQuizId = seededEvents.find((e) => e.title === "QA Quiz")?.id;

// --- Authenticated page fetches: `fetchPage` is defined above (line ~77) ---

const has = (html, ...markers) => markers.every((m) => html.includes(m));

/** Fetch WITHOUT auth cookies — for public-route / redirect checks. */
async function fetchAnon(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return {
    status: res.status,
    location: res.headers.get("location") ?? "",
    html:
      res.status >= 200 && res.status < 300
        ? (await res.text()).replaceAll("<!-- -->", "")
        : "",
  };
}

// --- Public / private boundary (Phase 6.5) --------------------------------
{
  for (const path of [
    "/",
    "/features",
    "/how-it-works",
    "/about",
    "/contact",
  ]) {
    const r = await fetchAnon(path);
    check(`public route ${path} loads without auth`, r.status === 200, `got ${r.status}`);
  }
  const login = await fetchAnon("/auth/login");
  check("auth page /auth/login loads without auth", login.status === 200, `got ${login.status}`);

  for (const path of ["/dashboard", "/semesters", "/gpa", "/calendar", "/courses/xyz"]) {
    const r = await fetchAnon(path);
    check(
      `protected route ${path} redirects unauthenticated`,
      r.status >= 300 && r.status < 400 && r.location.includes("/auth/login"),
      `got ${r.status} → ${r.location}`
    );
  }
  const legacy = await fetchAnon("/login");
  check(
    "legacy /login redirects to /auth/login",
    legacy.status >= 300 && legacy.status < 400 && legacy.location.includes("/auth/login"),
    `got ${legacy.status} → ${legacy.location}`
  );
  const unknown = await fetchAnon("/definitely-not-a-route");
  check(
    "unknown paths stay private (default-deny)",
    unknown.status >= 300 &&
      unknown.status < 400 &&
      unknown.location.includes("/auth/login"),
    `got ${unknown.status} → ${unknown.location}`
  );
  const home = await fetchAnon("/");
  check(
    "public home renders marketing chrome",
    home.html.includes("GradePulse") &&
      home.html.includes("Get Started") &&
      home.html.includes('aria-label="Open navigation"')
  );
}

// Dashboard (§22): overall %, counts, strongest/attention, course cards.
{
  const { status, html } = await fetchPage("/dashboard");
  check("dashboard responds 200 when authenticated", status === 200, `got ${status}`);
  check("dashboard shows the active semester", has(html, `QA Smoke ${stamp}`));
  check(
    "dashboard overall = 41/200 → 20.5%",
    has(html, "20.5%", "41 / 200 marks"),
    "semester aggregate is Σsecured/Σtotal"
  );
  check(
    "dashboard strongest/needs-attention cards",
    has(html, "Strongest course", "Course needing attention")
  );
  check(
    "dashboard course card values (remaining/max)",
    has(html, "QA Database Systems", "Remaining 59 · Max possible 91")
  );
  check("dashboard shows course health status (§18)", has(html, "At Risk"));
  check(
    "dashboard semester GPA (§21: C 2.0×3 credits, ungraded excluded)",
    has(html, "Semester GPA", "2.00", "over 3 graded credits")
  );
  check("dashboard course card shows grade (§21)", has(html, "C · 2.00"));
  check(
    "app navigation: sidebar → /dashboard + mobile menu present",
    has(html, 'href="/dashboard"', 'aria-label="Open navigation"')
  );
  check(
    "dashboard upcoming-events section (§22)",
    has(html, "Upcoming assessments", "QA Quiz", "In 3 days", 'href="/calendar"')
  );
  check(
    "dashboard excludes completed events from upcoming",
    !html.includes("QA Done Event")
  );
  check("dashboard lists the empty course too", has(html, "QA Empty Course"));
  check(
    "dashboard is mobile-first responsive",
    has(html, "grid-cols-1", "md:grid-cols-2")
  );
}

// Semester overview (§22).
{
  const { status, html } = await fetchPage(`/semesters/${sem.id}`);
  check("semester page responds 200", status === 200, `got ${status}`);
  check("semester summary shows overall 41%", has(html, "Overall", "41%"));
  check("semester page lists both courses", has(html, "QA Database Systems", "QA Empty Course"));
}

// Course detail dashboard (§23 + §19 + breakdown).
{
  const { status, html } = await fetchPage(`/courses/${courseA.id}`);
  check("course page responds 200", status === 200, `got ${status}`);
  check(
    "course current score / percentage / remaining / max",
    has(html, "Current score", "41 / 100", "41%", "Remaining", "59", "Maximum possible", "91")
  );
  check(
    "strongest/weakest basic summary (§19)",
    has(html, "Strongest:", "Attendance 90%", "Weakest:", "Class Tests 80%")
  );
  check(
    "category breakdown bars + statuses",
    has(html, "Category breakdown", "Not graded", "1 of 2 completed")
  );
  check(
    "weight structure configured 100/100",
    has(html, "100 of 100 marks configured")
  );
  check(
    "assessment list shows marks + pending",
    has(html, "9 / 10", "8 / 10", "24 / 30", "Pending / 10")
  );
  check(
    "course health status badge (§18: 41% < 50 → At Risk)",
    has(html, "At Risk")
  );
  check(
    "analytics cards render (§16)",
    has(html, "Performance over time", "Category comparison", "Assessment progression")
  );
  check(
    "category comparison chart container present",
    has(html, "Category comparison chart")
  );
  check(
    "trend chip renders from dated data (§17: 90, 80, 80 → declining)",
    has(html, "Trend: Declining")
  );
  check(
    "chart containers render with data (§16)",
    has(
      html,
      "Assessment performance over time chart",
      "Assessment progression chart",
      "Category comparison chart"
    )
  );
  check(
    "target analysis hero (§14: 41 secured, 80 target → need 39/59)",
    has(
      html,
      "Target achievable",
      "You need 39 / 59 remaining marks",
      "66.1%",
      "Target: 80%",
      "(80 marks)"
    )
  );
  check(
    "what-if simulator with pending + unassessed inputs (§15)",
    has(html, "What-if simulator", "CT 2", "no assessments yet")
  );
  check(
    "simulator readout present",
    has(html, "Current", "Projected %", "Change")
  );
  check(
    "course grade badge from configured scale (§21)",
    has(html, "Grade C · 2.00 GP")
  );
  check("grading scale editor entry point", has(html, "Grading scale"));
}

// Academic calendar (§20).
{
  const { status, html } = await fetchPage("/calendar");
  check("calendar page responds 200", status === 200, `got ${status}`);
  check(
    "calendar shows upcoming with countdown (§20)",
    has(html, "Upcoming", "QA Quiz", "In 3 days", "Quiz")
  );
  const expectedQuizDate = new Date(`${localPlus(3)}T00:00:00Z`).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }
  );
  check(
    "event date renders its exact calendar date (no TZ drift)",
    has(html, expectedQuizDate),
    `expected "${expectedQuizDate}"`
  );
  check(
    "calendar shows overdue countdown in earlier section",
    has(html, "Earlier", "QA Overdue HW", "2 days ago")
  );
  check(
    "calendar shows completion state",
    has(html, "QA Done Event", "Completed")
  );
  check(
    "calendar nav entry exists",
    has(html, 'href="/calendar"')
  );

  // The toggle is a Server Action form: the action id and the id/completed
  // payload the action reads are rendered straight into the markup.
  const at = html.indexOf('aria-label="Mark QA Quiz as completed"');
  const formHtml =
    at === -1
      ? ""
      : html.slice(html.lastIndexOf("<form", at), html.indexOf("</form>", at));
  check(
    "event toggle is wired to a Server Action form",
    formHtml.includes("$ACTION_ID_") &&
      formHtml.includes(`value="${qaQuizId}"`) &&
      formHtml.includes('name="completed"')
  );

  // Completion round-trip: flip the row, then assert both rendered states.
  const { error: toggleError } = await rest
    .from("academic_events")
    .update({ is_completed: true })
    .eq("id", qaQuizId);
  check("completion toggle persists (§20)", !toggleError, toggleError?.message);

  const after = await fetchPage("/calendar");
  check(
    "completed event shows Completed badge and leaves Upcoming",
    has(after.html, "QA Quiz", "Completed", "Nothing scheduled right now.")
  );

  const dashAfter = await fetchPage("/dashboard");
  check(
    "dashboard drops the just-completed event",
    !dashAfter.html.includes("QA Quiz")
  );
}

// GPA & CGPA page (§21).
{
  const { status, html } = await fetchPage("/gpa");
  check("gpa page responds 200", status === 200, `got ${status}`);
  check(
    "CGPA across completed semesters only (§21)",
    has(
      html,
      "Cumulative GPA",
      "4.00",
      "Across 1 completed semester · 3 graded credits"
    )
  );
  check(
    "semester history rows (§21 historical performance)",
    has(
      html,
      "Semester history",
      `QA Completed ${stamp}`,
      "85%",
      "QA Smoke"
    )
  );
}

// --- Broken links + unknown entities ---------------------------------------
{
  const pages = [
    "/",
    "/features",
    "/how-it-works",
    "/about",
    "/contact",
    "/dashboard",
    `/semesters/${sem.id}`,
    `/courses/${courseA.id}`,
    "/gpa",
    "/calendar",
  ];
  const hrefs = new Set();
  for (const path of pages) {
    const { html } = await fetchPage(path);
    for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
      const href = m[1].split("#")[0];
      if (!href || href.startsWith("/_next") || href.includes("?_rsc")) continue;
      hrefs.add(href);
    }
  }
  const broken = [];
  for (const href of hrefs) {
    const res = await fetch(`${BASE}${href}`, {
      headers: { cookie: cookieHeader },
      redirect: "manual",
    });
    await res.text().catch(() => {});
    if (res.status >= 400) broken.push(`${href} → ${res.status}`);
  }
  check(
    `no broken links across ${pages.length} pages (${hrefs.size} unique)`,
    broken.length === 0,
    broken.join(", ")
  );

  const missingSem = await fetchPage(
    "/semesters/11111111-2222-4333-8444-555555555555"
  );
  // NOTE: (app)/loading.tsx streams the shell first, so Next commits 200
  // before notFound() fires — content correctness is what matters here.
  check(
    "unknown semester id renders the not-found page",
    missingSem.html.includes("Page not found") &&
      !missingSem.html.includes("Start tracking your semester"),
    `status ${missingSem.status}`
  );
}

// Empty state: course with no categories.
{
  const { status, html } = await fetchPage(`/courses/${courseB.id}`);
  check("empty course page responds 200", status === 200, `got ${status}`);
  check(
    "empty structure state shown",
    has(html, "Define how this course is assessed")
  );
  check(
    "empty assessments state shown",
    has(html, "Add an assessment category before recording assessments")
  );
  check(
    "empty course: trend chart empty state (§17)",
    has(html, "Record at least two dated assessments")
  );
  check(
    "empty course: category comparison empty state",
    has(html, "Grade assessments to compare your categories")
  );
  check(
    "empty course: progression empty state",
    has(html, "Dated, graded assessments will build your progression curve")
  );
  check(
    "empty course: no-target state (§14 empty)",
    has(html, "Set a target to see exactly what you need")
  );
  check(
    "empty course: simulator closed state (§15)",
    has(html, "All marks are final")
  );
}

// --- Cleanup (cascade proof) ----------------------------------------------
await rest.from("semesters").delete().eq("id", semDone.id);
const { data: doneLeft } = await rest
  .from("courses")
  .select("id")
  .eq("id", doneCourse.id);
check(
  "cleanup: completed semester cascade removed its course",
  (doneLeft ?? []).length === 0
);
await rest.from("semesters").delete().eq("id", sem.id);
const { data: leftover } = await rest
  .from("courses")
  .select("id")
  .eq("id", courseA.id);
check("cleanup: semester cascade removed courses", (leftover ?? []).length === 0);
const { data: eventsLeft } = await rest
  .from("academic_events")
  .select("id")
  .eq("course_id", courseA.id);
check(
  "cleanup: events cascaded with their course",
  (eventsLeft ?? []).length === 0
);

console.log(
  failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`
);
console.log(`QA account (delete in Auth dashboard): ${email}`);
process.exit(failures === 0 ? 0 : 1);
