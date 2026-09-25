#!/usr/bin/env node
/**
 * GradePulse QA: live persistence + RLS verification against the real
 * Supabase project (reads .env.local). Run: npm run verify:rls
 *
 * Creates two throwaway auth accounts (gp-qa-*@example.com) and removes all
 * data rows it creates. Accounts themselves must be deleted from the
 * Supabase Auth dashboard (no service-role key is used on purpose).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

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
if (!url || !anon) {
  console.error("FAIL  .env.local missing Supabase credentials");
  process.exit(1);
}

let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const signUp = async (tag) => {
  const client = createClient(url, anon);
  const email = `gradepulse.qa.${tag}.${Date.now()}@gmail.com`;
  for (let attempt = 1; attempt <= 40; attempt++) {
    const { data, error } = await client.auth.signUp({
      email,
      password: `Qa!${randomUUID()}`,
    });
    if (!error) return { client, session: data.session };
    if (attempt === 40) throw new Error(`signUp(${tag}): ${error.message}`);
    console.log(`INFO  signUp throttled (${error.message}) — wait 90s, retry ${attempt}/40`);
    await sleep(90000);
  }
};

const stamp = Date.now();

// --- Anon isolation (always runs) -----------------------------------------
const anonClient = createClient(url, anon);
{
  const { data } = await anonClient.from("semesters").select("id");
  check("anon sees zero semesters", Array.isArray(data) && data.length === 0);
  const { error } = await anonClient.from("semesters").insert({
    user_id: "00000000-0000-0000-0000-000000000000",
    name: "Anon",
    academic_year: "1999",
    start_date: "1999-01-01",
    end_date: "1999-05-01",
    status: "upcoming",
  });
  check("anon insert blocked by RLS", error?.code === "42501", `code=${error?.code}`);
}

// --- Authenticated flow ----------------------------------------------------
const a = await signUp("a");
if (!a.session) {
  console.log(
    "INFO  Email confirmation is enabled — cross-user test skipped. " +
      "Disable 'Confirm email' in Supabase Auth, then re-run."
  );
  process.exit(failures === 0 ? 0 : 1);
}
const b = await signUp("b");
check("second user signed up", Boolean(b.session));

const semesterPayload = {
  user_id: a.session.user.id,
  name: `QA Semester ${stamp}`,
  academic_year: "2099-2100",
  start_date: "2099-09-01",
  end_date: "2099-12-31",
  status: "upcoming",
};
const { data: sem, error: semErr } = await a.client
  .from("semesters")
  .insert(semesterPayload)
  .select()
  .single();
check("A creates semester (persistence)", Boolean(sem) && !semErr);

let courseId = null;
let catId = null;
if (sem) {
  const { data: course } = await a.client
    .from("courses")
    .insert({
      user_id: a.session.user.id,
      semester_id: sem.id,
      name: "QA Course",
      code: "QA-101",
      credits: 3,
      total_marks: 100,
      passing_marks: 50,
      grading_scale: [],
    })
    .select()
    .single();
  check("A creates course", Boolean(course));
  check(
    "numeric columns arrive as numbers",
    typeof course?.total_marks === "number",
    typeof course?.total_marks
  );
  courseId = course?.id ?? null;

  const { data: cat } = await a.client
    .from("assessment_categories")
    .insert({
      user_id: a.session.user.id,
      course_id: courseId,
      name: "Class Tests",
      weight: 20,
      sort_order: 0,
    })
    .select()
    .single();
  check("A creates category", Boolean(cat));
  catId = cat?.id ?? null;

  const { data: asm } = await a.client.from("assessments").insert({
    user_id: a.session.user.id,
    category_id: catId,
    title: "CT 1",
    obtained_marks: 8,
    maximum_marks: 10,
    status: "completed",
  }).select().single();
  check(
    "A creates assessment and round-trips 8/10",
    Boolean(asm) && asm?.obtained_marks === 8 && asm?.maximum_marks === 10
  );

  const { error: badErr } = await a.client.from("assessments").insert({
    user_id: a.session.user.id,
    category_id: catId,
    title: "Invalid",
    obtained_marks: 12,
    maximum_marks: 10,
    status: "completed",
  });
  check("DB rejects obtained > maximum", badErr?.code === "23514", `code=${badErr?.code}`);

  const { error: dateErr } = await a.client.from("semesters").insert({
    ...semesterPayload,
    name: `QA Bad Dates ${stamp}`,
    start_date: "2099-12-31",
    end_date: "2099-01-01",
  });
  check("DB rejects end_date < start_date", dateErr?.code === "23514", `code=${dateErr?.code}`);

  const { error: dupErr } = await a.client
    .from("semesters")
    .insert(semesterPayload);
  check("DB rejects duplicate semester name/year", dupErr?.code === "23505", `code=${dupErr?.code}`);
}

// --- Cross-user isolation (user B vs user A's rows) -----------------------
if (sem) {
  const { data: bSees } = await b.client
    .from("semesters")
    .select("id")
    .eq("id", sem.id);
  check("B cannot select A's semester", (bSees ?? []).length === 0);

  const { data: bUpd } = await b.client
    .from("semesters")
    .update({ name: "Hijacked" })
    .eq("id", sem.id)
    .select("id");
  check("B cannot update A's semester", (bUpd ?? []).length === 0);

  const { data: bDel } = await b.client
    .from("semesters")
    .delete()
    .eq("id", sem.id)
    .select("id");
  check("B cannot delete A's semester", (bDel ?? []).length === 0);

  const { data: stillMine } = await a.client
    .from("semesters")
    .select("id, name")
    .eq("id", sem.id)
    .maybeSingle();
  check(
    "A's semester untouched after B's attempts",
    stillMine?.name === semesterPayload.name
  );

  // --- Cascade cleanup ----------------------------------------------------
  const { data: deleted } = await a.client
    .from("semesters")
    .delete()
    .eq("id", sem.id)
    .select("id");
  check("A deletes own semester", (deleted ?? []).length === 1);

  if (courseId) {
    const { data: courseGone } = await a.client
      .from("courses")
      .select("id")
      .eq("id", courseId);
    check("course cascaded away", (courseGone ?? []).length === 0);
  }
  if (catId) {
    const { data: catGone } = await a.client
      .from("assessment_categories")
      .select("id")
      .eq("id", catId);
    check("category cascaded away", (catGone ?? []).length === 0);
    const { data: asmGone } = await a.client
      .from("assessments")
      .select("id")
      .eq("category_id", catId);
    check("assessment cascaded away", (asmGone ?? []).length === 0);
  }
}

console.log(
  failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`
);
process.exit(failures === 0 ? 0 : 1);
