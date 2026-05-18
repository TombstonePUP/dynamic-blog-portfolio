"use client";

import { AlertTriangle } from "lucide-react";

export default function TopicsError() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-24 font-sans">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto size-10 text-admin-danger" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
          Topics could not load
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/65">
          Refresh the page or try again after Supabase is reachable.
        </p>
      </div>
    </main>
  );
}
