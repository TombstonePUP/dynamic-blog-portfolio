import { Loader2 } from "lucide-react";

export default function TopicsLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-24 font-sans">
      <div className="flex items-center gap-3 text-sm font-semibold text-foreground/55">
        <Loader2 className="size-4 animate-spin" />
        Loading topics...
      </div>
    </main>
  );
}
