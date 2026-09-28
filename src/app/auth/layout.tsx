import { Brand } from "@/components/layout/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <Brand />
        <p className="text-sm text-muted-foreground">
          Track every mark. Understand your progress. Know what comes next.
        </p>
      </div>
      {children}
    </div>
  );
}
