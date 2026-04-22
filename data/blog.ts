import type { Author, Blog, Tag } from "@/types/blog";
import { blogArticleBodies } from "@/data/blog-articles";

// ─── Authors ────────────────────────────────────────────────────────────────

export const AUTHORS: Record<string, Author> = {
  ian: {
    name: "Ian",
    slug: "ian",
  },
} as const;

// ─── Tags ────────────────────────────────────────────────────────────────────

export const ALL_TAGS: Tag[] = [
  "featured",
  "movie Review",
  "personal blog",
  "what's your worry?",
  "why positive psychology?",
  "advice",
];

// ─── Blogs ───────────────────────────────────────────────────────────────────

export const blogs: Blog[] = [
  {
    id: 1,
    slug: "tahimik-pero-wasak-quiet-cracking",
    title: "Tahimik Pero Wasak: Beshie, Quiet Cracking Na Yan!",
    href: "/blog/tahimik-pero-wasak-quiet-cracking",
    image:
      "https://strengthswriter.com/wp-content/uploads/2025/08/BA2A2C81-6F61-40A8-8AC3-B82D15C0B67C-1.png",
    thumbnail:
      "https://strengthswriter.com/wp-content/uploads/2025/08/BA2A2C81-6F61-40A8-8AC3-B82D15C0B67C-1-150x150.png",
    author: AUTHORS.ian,
    date: "2025-08-13",
    dateLabel: "August 13, 2025",
    tags: ["featured", "what's your worry?"],
    excerpt:
      "Beshie, napansin mo ba lately? Si officemate na dati'y laging naka-high heels at full glam, ngayon naka-crocs at hoodie na lang. Si Kuya na laging masayahin, bigla na lang naging parang background music—present pero hindi mo maramdaman. Grabe, baka hindi lang sila pagod… Quiet cracking na yan. Oo besh, hindi lang ito quiet quitting na petiks lang sa trabaho. Iba ito. Mas malala. Ito yung \"I'm fine\" pero sa totoo lang, \"I'm barely holding it together\"",
    content: blogArticleBodies["tahimik-pero-wasak-quiet-cracking"],
    commentCount: 0,
  },
  {
    id: 2,
    slug: "career-search-guide-graduates-2023",
    title: "Career Search: A Guide for Graduates of the Class of 2023",
    href: "/blog/career-search-guide-graduates-2023",
    image:
      "https://strengthswriter.com/wp-content/uploads/2023/06/Blog_1.jpg",
    thumbnail:
      "https://strengthswriter.com/wp-content/uploads/2023/06/Blog_1-150x150.jpg",
    author: AUTHORS.ian,
    date: "2023-06-30",
    dateLabel: "June 30, 2023",
    tags: ["featured", "advice"],
    excerpt:
      "Congratulations to the Class of 2023 graduates! As you transition from the academic world to professional opportunities, it's important to approach your career search with strategy and confidence.",
    content: blogArticleBodies["career-search-guide-graduates-2023"],
    commentCount: 0,
  },
  {
    id: 3,
    slug: "a-to-z-positive-parenting",
    title: "The A to Z of Positive Parenting",
    href: "/blog/a-to-z-positive-parenting",
    image:
      "https://strengthswriter.com/wp-content/uploads/2021/02/Blog-Post-6a.jpg",
    thumbnail:
      "https://strengthswriter.com/wp-content/uploads/2021/02/Blog-Post-6a-150x150.jpg",
    author: AUTHORS.ian,
    date: "2021-05-01",
    dateLabel: "May 1, 2021",
    tags: ["featured", "personal blog"],
    excerpt:
      "The quarantine measures this pandemic is an opportunity for parents to relate with their children. Staying at home can be the perfect setting to practice positive parenting.",
    content: blogArticleBodies["a-to-z-positive-parenting"],
    commentCount: 0,
  },
  {
    id: 4,
    slug: "positive-psychology-goals-boost-strengths",
    title: "Positive psychology goals is to boost our strengths",
    href: "/blog/positive-psychology-goals-boost-strengths",
    image:
      "https://strengthswriter.com/wp-content/uploads/2021/02/Positive-Strengths.jpg",
    thumbnail:
      "https://strengthswriter.com/wp-content/uploads/2021/02/Positive-Strengths-150x150.jpg",
    author: AUTHORS.ian,
    date: "2021-02-10",
    dateLabel: "February 10, 2021",
    tags: ["personal blog", "why positive psychology?"],
    excerpt:
      "In a world that often focuses on problems, challenges, and deficiencies positive psychology provides a revitalizing perspective by emphasizing strengths and what makes life worth living.",
    content: blogArticleBodies["positive-psychology-goals-boost-strengths"],
    commentCount: 31,
    comments: [
      {
        id: 1,
        author: "Maria Santos",
        date: "2021-02-11",
        dateLabel: "February 11, 2021",
        body: "This was such an eye-opener! I never thought about focusing on strengths rather than fixing weaknesses. Sobrang relate ko dito.",
      },
      {
        id: 2,
        author: "Jelo Reyes",
        date: "2021-02-12",
        dateLabel: "February 12, 2021",
        body: "Positive psychology talaga is underrated. Lagi kasi tayo trained to think about what's wrong rather than what's going right. Thank you for this!",
      },
      {
        id: 3,
        author: "Carla Mendoza",
        date: "2021-02-14",
        dateLabel: "February 14, 2021",
        body: "Shared this with my team at work. We've been struggling with morale and this perspective shift is exactly what we needed.",
      },
    ],
  },
  {
    id: 5,
    slug: "attack-on-itan-self-confidence",
    title: "Attack on Itan: How to increase one's self-confidence?",
    href: "/blog/attack-on-itan-self-confidence",
    image:
      "https://strengthswriter.com/wp-content/uploads/2021/01/144040220_1034879487001599_8417849835091764025_n.jpg",
    thumbnail:
      "https://strengthswriter.com/wp-content/uploads/2021/01/144040220_1034879487001599_8417849835091764025_n-150x150.jpg",
    author: AUTHORS.ian,
    date: "2021-02-04",
    dateLabel: "February 4, 2021",
    tags: ["featured", "what's your worry?"],
    excerpt:
      "Bes, sa buhay minsan hindi maiwasan na nawawalan tayo ng tiwala sa atin sarili. Minsan o madalas ay kailangan nating harapin ang mga sitwasyong sumusubok sa ating kumpiyansa.",
    content: blogArticleBodies["attack-on-itan-self-confidence"],
    commentCount: 0,
  },
  {
    id: 6,
    slug: "wearing-is-caring",
    title: "Wearing is Caring",
    href: "/blog/wearing-is-caring",
    image:
      "https://strengthswriter.com/wp-content/uploads/2021/01/Wearing-is-caring-blog-1.jpg",
    thumbnail:
      "https://strengthswriter.com/wp-content/uploads/2021/01/Wearing-is-caring-blog-1-150x150.jpg",
    author: AUTHORS.ian,
    date: "2021-01-25",
    dateLabel: "January 25, 2021",
    tags: ["featured", "what's your worry?"],
    excerpt:
      "Halos sampung buwan na tayo nasa quarantine measures para mapigilan ang patuloy na paglaganap ng coronavirus. Habang ang iba ay nag-iingat, mahalaga rin na ipaalala sa ating mga sarili ang kahalagahan ng pagmamalasakit.",
    content: blogArticleBodies["wearing-is-caring"],
    commentCount: 0,
  },
  {
    id: 7,
    slug: "my-crush-landing-on-you-handle-rejection",
    title: "My crush landing on You: How to handle romantic rejection?",
    href: "/blog/my-crush-landing-on-you-handle-rejection",
    image:
      "https://strengthswriter.com/wp-content/uploads/2021/01/My-crush-and-landing-blog.jpg",
    thumbnail:
      "https://strengthswriter.com/wp-content/uploads/2021/01/My-crush-and-landing-blog-300x157.jpg",
    author: AUTHORS.ian,
    date: "2021-01-28",
    dateLabel: "January 28, 2021",
    tags: ["featured", "what's your worry?"],
    excerpt:
      "Grabe Bes, di ako makapaniwala. Bakit nagawa mo sakin ito? Ako yung nagtanim pero ikaw yung umani.. Sheket!",
    content: blogArticleBodies["my-crush-landing-on-you-handle-rejection"],
    commentCount: 1,
    comments: [
      {
        id: 1,
        author: "Anonymous",
        date: "2021-01-30",
        dateLabel: "January 30, 2021",
        body: "Grabe, sobrang relate. Needed this today. Salamat Ian!",
      },
    ],
  },
  {
    id: 8,
    slug: "plants-vs-covid-19",
    title: "Green Resilience: The Therapeutic Power of Planting this COVID-19 Pandemic",
    href: "/blog/plants-vs-covid-19",
    image:
      "https://strengthswriter.com/wp-content/uploads/2021/01/plants-vs-covid-blog.jpg",
    thumbnail:
      "https://strengthswriter.com/wp-content/uploads/2021/01/plants-vs-covid-blog-300x157.jpg",
    author: AUTHORS.ian,
    date: "2021-01-24",
    dateLabel: "January 24, 2021",
    tags: ["featured", "what's your worry?"],
    excerpt:
      "The COVID-19 pandemic has brought unprecedented challenges, pressing us to adopt new ways of living and coping with stress. One surprisingly effective outlet has been gardening.",
    content: blogArticleBodies["plants-vs-covid-19"],
    commentCount: 0,
  },
];



export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((b) => b.slug === slug);
}

/** Other posts that share at least one non-featured tag, most recent first */
export function getRelatedBlogs(post: Blog, limit = 3): Blog[] {
  const postTags = new Set(post.tags.filter((t) => t !== "featured"));
  return [...blogs]
    .filter((b) => b.slug !== post.slug)
    .filter((b) => b.tags.some((t) => t !== "featured" && postTags.has(t)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function readingMinutesFromContent(paragraphs: string[]): number {
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}