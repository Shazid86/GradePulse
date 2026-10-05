import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import { DemoDataNotice } from "@/components/marketing/visuals/demo-data-notice";
import { DEMO_GPA } from "@/components/marketing/visuals/demo-data";

/**
 * GPA/CGPA cards over the locked fixture (equal credits: the CGPA is
 * checkable by hand — 3.52 + 3.68 + 3.74 over 3 = 3.65).
 */
export function GpaSection() {
  const [first, second, third] = DEMO_GPA.semesters;

  return (
    <Section
      eyebrow="GPA / CGPA"
      title="Every semester, in one number."
      lead="Semester GPA covers the courses you have graded. CGPA rolls completed semesters up so past and present stay comparable."
      width="wide"
    >
      <Reveal variant="scale">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[first, second, third].map((semester) => (
            <li
              key={semester.name}
              className="gp-glass rounded-2xl p-5 text-center"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {semester.name}
              </p>
              <p className="gp-figure mt-3 text-3xl font-medium sm:text-4xl">
                {semester.gpa}
              </p>
            </li>
          ))}
          <li className="rounded-2xl border border-primary/40 bg-primary/5 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">
              CGPA
            </p>
            <p className="gp-figure mt-3 text-3xl font-semibold text-primary sm:text-4xl">
              {DEMO_GPA.cgpa}
            </p>
          </li>
        </ul>
      </Reveal>
      <DemoDataNotice className="mt-4" />
    </Section>
  );
}
