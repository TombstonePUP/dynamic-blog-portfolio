"use server";

import { serialize } from "next-mdx-remote/serialize";

/**
 * Compiles MDX string into a serializable object for client-side rendering.
 */
export async function compileMdxAction(content: string) {
  try {
    const mdxSource = await serialize(content, {
      parseFrontmatter: true,
    });
    return { success: true, source: mdxSource };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
