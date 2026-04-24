/**
 * Simple client-side markdown-to-HTML renderer.
 * Handles frontmatter, headings, bold, italic, blockquotes, lists, images, links, code blocks, and paragraphs.
 */
export function renderMarkdownToHtml(md: string): string {
  // Strip frontmatter
  let content = md.replace(/^---[\s\S]*?---\s*/m, "");

  // Escape HTML entities (except in code blocks)
  const codeBlocks: string[] = [];
  content = content.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Process inline code first (preserve it)
  const inlineCodes: string[] = [];
  content = content.replace(/`([^`]+)`/g, (_, code) => {
    inlineCodes.push(code);
    return `__INLINE_CODE_${inlineCodes.length - 1}__`;
  });

  // Headings
  content = content.replace(/^### (.+)$/gm, '<h3 class="mt-6 mb-3 text-lg font-bold">$1</h3>');
  content = content.replace(/^## (.+)$/gm, '<h2 class="mt-8 mb-4 text-2xl font-bold">$1</h2>');
  content = content.replace(/^# (.+)$/gm, '<h1 class="mt-8 mb-4 text-3xl font-bold">$1</h1>');

  // Blockquotes
  content = content.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-admin-primary/30 pl-4 italic text-admin-text/60 my-4">$1</blockquote>');

  // Images
  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-8 overflow-hidden rounded-xl bg-admin-contrast/5 p-4 text-center"><p class="text-[10px]  italic mb-2 uppercase tracking-widest">Asset: $2</p><img src="$2" alt="$1" class="mx-auto max-h-96 rounded-lg object-contain shadow-sm" /></div>');

  // Links
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-admin-primary underline hover:text-admin-primary/80">$1</a>');

  // Bold and italic
  content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  content = content.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Ordered lists
  content = content.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-6 list-decimal mb-1">$1</li>');

  // Unordered lists
  content = content.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-6 list-disc mb-1">$1</li>');

  // Horizontal rules
  content = content.replace(/^---$/gm, '<hr class="border-admin-contrast/10 my-8" />');

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    const code = block.replace(/```\w*\n?/, "").replace(/```$/, "");
    content = content.replace(`__CODE_BLOCK_${i}__`, `<pre class="bg-admin-contrast/5 p-4 rounded-xl font-mono text-xs overflow-x-auto my-4"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`);
  });

  // Restore inline code
  inlineCodes.forEach((code, i) => {
    content = content.replace(`__INLINE_CODE_${i}__`, `<code class="bg-admin-contrast/5 px-1.5 py-0.5 rounded text-xs font-mono">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`);
  });

  // Wrap remaining bare lines in paragraphs
  const lines = content.split("\n");
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("<")) {
      result.push(trimmed);
    } else {
      result.push(`<p class="mb-4 leading-relaxed">${trimmed}</p>`);
    }
  }
  return result.join("\n");
}
