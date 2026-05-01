"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { resolveAssetPath } from "@/lib/post-assets";

type HeadingProps = ComponentPropsWithoutRef<"h1">;
type SubheadingProps = ComponentPropsWithoutRef<"h2">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type LinkProps = ComponentPropsWithoutRef<typeof Link>;
type MdxImageProps = ComponentPropsWithoutRef<"img"> & {
  src?: string;
};

const createComponents = (assetFolder?: string) => ({
  h1: (props: HeadingProps) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold" {...props} />
  ),
  h2: (props: SubheadingProps) => (
    <h2 className="mt-8 mb-4 text-2xl font-bold" {...props} />
  ),
  p: (props: ParagraphProps) => <p className="mb-6" {...props} />,
  a: (props: LinkProps) => (
    <Link className="text-admin-primary underline hover:text-admin-primary/80" {...props} />
  ),
  img: (props: MdxImageProps) => {
    const src =
      typeof props.src === "string" && assetFolder
        ? resolveAssetPath(assetFolder, props.src) || props.src
        : props.src;

    if (!src) {
      return null;
    }

    return (
      <div className="my-8 overflow-hidden rounded-xl">
        {/* Using standard img to avoid next/image hostname issues in preview */}
        <img
          src={src}
          className="w-full object-cover max-h-96 shadow-sm"
          alt={props.alt || ""}
        />
      </div>
    );
  },
});

export function ClientMDXRemote({
  source,
  assetFolder,
}: {
  source: MDXRemoteSerializeResult;
  assetFolder?: string;
}) {
  const components = createComponents(assetFolder);

  return <MDXRemote {...source} components={components} />;
}
