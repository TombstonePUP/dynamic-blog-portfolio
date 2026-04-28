
/**
 * Compiles MDX string into a serializable object for client-side rendering.
 */
export async function compileMdxAction(content: string) {
  if (typeof window !== 'undefined') {
    // In a real prototype you'd use a client-side compiler
    // but for now we just return a simple object that MdxRemote can use
    // or just return success and let the preview handle it.
    return { success: true, source: null };
  }

  // This part only runs during static generation if called
  try {
    const { serialize } = await import("next-mdx-remote/serialize");
    const mdxSource = await serialize(content, {
      parseFrontmatter: true,
    });
    return { success: true, source: mdxSource };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to compile MDX.",
    };
  }
}
