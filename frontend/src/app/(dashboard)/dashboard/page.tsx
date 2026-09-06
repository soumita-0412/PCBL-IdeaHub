import { Header } from "@/components/layout/Header";

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-foreground">Welcome to IdeaPortal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit and track ideas through the two-stage review process.
          </p>
        </div>
      </main>
    </>
  );
}
