import StaticMdxEditor from "@/components/admin/static-mdx-editor";

export default function StaticEditorPage() {
  return (
    <div className="flex-1 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Prototype <span className="text-primary italic">Editor</span>
          </h1>
          <p className="text-foreground/40 text-sm font-medium uppercase tracking-widest">
            Static UI Showcase • No Backend Required
          </p>
        </div>
        
        <StaticMdxEditor />
      </div>
    </div>
  );
}
