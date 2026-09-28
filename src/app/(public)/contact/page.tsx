import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the creator of GradePulse.",
};

/** Contact placeholders — replace each token with your real details. */
const CONTACTS = [
  { label: "Email", value: "[your.email@example.com]" },
  { label: "Facebook", value: "[facebook.com/your-profile]" },
  { label: "Instagram", value: "[instagram.com/your-profile]" },
  { label: "LinkedIn", value: "[linkedin.com/in/your-profile]" },
  { label: "GitHub", value: "[github.com/your-username]" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Contact
        </h1>
        <p className="mt-3 text-muted-foreground">
          Questions, feedback or collaboration — reach out directly.
        </p>
      </div>

      {/* Prominent placeholders for the creator's real details. */}
      <Card className="glass mt-8 border-primary/30">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <div
            aria-label="Creator photo placeholder"
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted text-muted-foreground"
          >
            <User className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-base font-medium">
              Shazid — creator of GradePulse
            </CardTitle>
            <CardDescription>
              Replace the placeholders below with your real contact details.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CONTACTS.map((contact) => (
              <li
                key={contact.label}
                className="rounded-lg border border-border/60 bg-background/40 p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {contact.label}
                </p>
                <p className="mt-0.5 break-words font-mono text-sm">
                  {contact.value}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="glass mt-4 border-border/70">
        <CardHeader>
          <Mail className="mb-1 size-5 text-primary" aria-hidden="true" />
          <CardTitle className="text-base font-medium">Why contact?</CardTitle>
          <CardDescription>
            Found a calculation that looks wrong, or need a feature for your
            program&rsquo;s grading system? Messages go straight to the
            creator.
          </CardDescription>
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
