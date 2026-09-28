import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why GradePulse exists — a personal academic performance command center built by Shazid.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4">
          About GradePulse
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for clarity, not grade anxiety
        </h1>
      </div>

      <Card className="glass mt-8 border-border/70">
        <CardHeader>
          <Compass className="mb-1 size-5 text-primary" aria-hidden="true" />
          <CardTitle className="text-base font-medium">
            Why GradePulse exists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            GradePulse is a personal academic performance command center. It
            exists because raw marks alone rarely tell students what to do
            next — a score in a gradebook is a number, not a plan.
          </p>
          <p>
            The goal is simple: every mark a student records becomes insight —
            where they stand, what remains, what they need, and whether the
            target is still within reach. The math is transparent, the data
            stays private to its owner, and nothing about a specific
            university&rsquo;s grading system is baked in.
          </p>
          <p>
            No predictions about effort or character — only the arithmetic of
            what has been recorded, presented honestly.
          </p>
        </CardContent>
      </Card>

      <Card className="glass mt-4 border-border/70">
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Creator photo placeholder — replace with an actual image. */}
            <div
              aria-label="Creator photo placeholder"
              className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted text-muted-foreground"
            >
              <User className="size-7" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                Created by Shazid
              </CardTitle>
              <CardDescription>
                Creator &amp; developer of GradePulse
              </CardDescription>
            </div>
          </div>
          <p className="text-sm text-muted-foreground sm:max-w-sm">
            [Photo placeholder — replace this avatar with your own picture.]
          </p>
        </CardHeader>
      </Card>

      <div className="mt-8 text-center">
        <Button size="lg" asChild>
          <Link href="/auth/signup">
            Get Started
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
