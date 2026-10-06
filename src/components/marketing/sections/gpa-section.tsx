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
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-5">
        {[first, second, third].map((semester, index) => (
          <li key={semester.name}>
            <Reveal delay={index * 70} variant="card" className="h-full">
              <div className="gp-card group h-full rounded-2xl p-5 text-center">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {semester.name}
                </p>
                <p className="gp-figure mt-3 text-3xl font-medium sm:text-4xl">
                  {semester.gpa}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
        <li>
          <Reveal delay={3 * 70} variant="card" className="h-full">
            <div className="gp-card gp-card-accent h-full rounded-2xl p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">
                CGPA
              </p>
              <p className="gp-figure mt-3 text-3xl font-semibold text-primary sm:text-4xl">
                {DEMO_GPA.cgpa}
              </p>
            </div>
          </Reveal>
        </li>
      </ul>
      <DemoDataNotice className="mt-4" />
    </Section>
  );
}
