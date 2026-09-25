#!/usr/bin/env node
/**
 * GradePulse QA: authenticated page smoke test.
 * Signs up a throwaway account (Confirm email must be OFF), seeds a known
 * dataset, serializes session cookies exactly like @supabase/ssr, fetches
 * dashboard/semester/course pages and asserts the values the calculation
 * engine must have rendered — including empty states. Cleans up after itself.
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
    grading_scale: [],
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

// --- Authenticated page fetches -------------------------------------------
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

const has = (html, ...markers) => markers.every((m) => html.includes(m));

// Dashboard (§22): overall %, counts, strongest/attention, course cards.
{
  const { status, html } = await fetchPage("/");
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
}

// --- Cleanup (cascade proof) ----------------------------------------------
await rest.from("semesters").delete().eq("id", sem.id);
const { data: leftover } = await rest
  .from("courses")
  .select("id")
  .eq("id", courseA.id);
check("cleanup: semester cascade removed courses", (leftover ?? []).length === 0);

console.log(
  failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`
);
console.log(`QA account (delete in Auth dashboard): ${email}`);
process.exit(failures === 0 ? 0 : 1);
