import StaticMdxEditor from "@/components/admin/static-mdx-editor";

export default function StaticEditorPage() {
  return (
    <div className="flex flex-1 flex-col p-6 lg:p-12">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-8">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-muted">
            Dashboard / Editor
          </p>
          <h1 className="text-4xl font-black tracking-tight text-admin-heading">
            Prototype <span className="text-admin-accent">Editor</span>
          </h1>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-muted">
            Static UI Showcase - No Backend Required
          </p>
        </div>

        <StaticMdxEditor />
      </div>
    </div>
  );
}
