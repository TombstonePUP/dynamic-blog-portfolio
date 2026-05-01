import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { resolvePostAssetUrl } from "@/lib/post-assets";

type HeadingProps = ComponentPropsWithoutRef<"h1">;
type SubheadingProps = ComponentPropsWithoutRef<"h2">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type LinkProps = ComponentPropsWithoutRef<typeof Link>;
type MdxImageProps = ComponentPropsWithoutRef<"img"> & {
  src?: string;
};

const createComponents = (assetFolder?: string): MDXComponents => ({
  h1: (props: HeadingProps) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold" {...props} />
  ),
  h2: (props: SubheadingProps) => (
    <h2 className="mt-8 mb-4 text-2xl font-bold" {...props} />
  ),
  p: (props: ParagraphProps) => <p className="mb-6" {...props} />,
  a: (props: LinkProps) => (
    <Link className="text-primary hover:underline" {...props} />
  ),
  img: (props: MdxImageProps) => {
    const src =
      typeof props.src === "string" && assetFolder
        ? resolvePostAssetUrl(assetFolder, props.src) || props.src
        : props.src;

    if (!src) {
      return null;
    }

    return (
      <span className="my-8 block overflow-hidden rounded-xl">
        <Image
          src={src}
          width={1200}
          height={675}
          className="w-full object-cover"
          alt={props.alt || ""}
        />
      </span>
    );
  },
  // Keep Image component for compatibility if used as a component
  Image: (props: MdxImageProps) => {
    const src =
      typeof props.src === "string" && assetFolder
        ? resolvePostAssetUrl(assetFolder, props.src) || props.src
        : props.src;
    const restProps = { ...props };
    delete restProps.src;

    if (!src) {
      return null;
    }

    return (
      <span className="my-8 block overflow-hidden rounded-xl">
        <Image
          {...restProps}
          src={src}
          width={1200}
          height={675}
          className="w-full object-cover"
          alt={props.alt || ""}
        />
      </span>
    );
  },
});

export function CustomMDX({
  source,
  assetFolder,
  components: manualComponents,
}: {
  source: string;
  assetFolder?: string;
  components?: MDXComponents;
}) {
  const components = createComponents(assetFolder);

  return (
    <MDXRemote
      source={source}
      components={{ ...components, ...(manualComponents || {}) }}
      options={{ parseFrontmatter: true }}
    />
  );
}

