import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const createComponents = (slug?: string) => ({
  h1: (props: any) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="mt-8 mb-4 text-2xl font-bold" {...props} />
  ),
  p: (props: any) => <p className="mb-6" {...props} />,
  a: (props: any) => (
    <Link className="text-primary hover:underline" {...props} />
  ),
  img: (props: any) => {
    let src = props.src;
    if (slug && src.startsWith("./")) {
      src = `/images/posts/${slug}/${src.slice(2)}`;
    }
    return (
      <div className="my-8 overflow-hidden rounded-xl">
        <Image 
          src={src}
          width={1200} 
          height={675} 
          className="w-full object-cover" 
          alt={props.alt || ""}
        />
      </div>
    );
  },
  // Keep Image component for compatibility if used as a component
  Image: (props: any) => {
    let src = props.src;
    if (slug && src.startsWith("./")) {
      src = `/images/posts/${slug}/${src.slice(2)}`;
    }
    return (
      <div className="my-8 overflow-hidden rounded-xl">
        <Image 
          src={src}
          width={1200} 
          height={675} 
          className="w-full object-cover" 
          {...props} 
          alt={props.alt || ""}
        />
      </div>
    );
  },
});

export function CustomMDX({ source, slug, components: manualComponents }: { source: string, slug?: string, components?: any }) {
  const components = createComponents(slug);
  return (
    <MDXRemote
      source={source}
      components={{ ...components, ...(manualComponents || {}) }}
    />
  );
}

