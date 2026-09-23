import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteCourse } from "@/features/courses/actions";
import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CourseItem {
  id: string;
  name: string;
  code: string;
  credits: number;
  total_marks: number;
  passing_marks: number;
  instructor: string | null;
}

/** Courses of one semester: header action, list rows, empty state. */
export function SemesterCourses({
  semesterId,
  courses,
}: {
  semesterId: string;
  courses: CourseItem[];
}) {
  return (
    <section aria-labelledby="courses-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="courses-heading" className="text-lg font-medium">
          Courses
        </h2>
        <CourseFormDialog
          semesterId={semesterId}
          trigger={
            <Button size="sm">
              <Plus aria-hidden="true" />
              New course
            </Button>
          }
        />
      </div>

      {courses.length === 0 ? (
        <Card className="glass border-border/70">
          <CardContent className="space-y-2 py-8 text-center">
            <h3 className="font-medium">No courses yet</h3>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Add the courses you are taking this semester — e.g. Database
              Management Systems, 3 credits, 100 marks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {courses.map((course) => (
            <li key={course.id}>
              <Card className="glass border-border/70">
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/courses/${course.id}`}
                        className="truncate font-medium underline-offset-4 hover:text-primary hover:underline"
                      >
                        {course.name}
                      </Link>
                      <Badge
                        variant="outline"
                        className="font-mono text-[11px]"
                      >
                        {course.code}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {course.credits} credits · {course.total_marks} marks ·
                      pass at {course.passing_marks}
                      {course.instructor ? ` · ${course.instructor}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <CourseFormDialog
                      semesterId={semesterId}
                      course={course}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${course.name}`}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      }
                    />
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${course.name}`}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      }
                      title="Delete course?"
                      description={`“${course.name}” and its assessment structure and assessments will be permanently deleted.`}
                      onConfirm={deleteCourse.bind(
                        null,
                        course.id,
                        `/semesters/${semesterId}`
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
