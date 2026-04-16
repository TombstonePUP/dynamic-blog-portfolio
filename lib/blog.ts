import type { Author, Blog, Tag } from "@/types/blog";

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
  "latest",
  "movie Review",
  "personal blog",
  "what's your worry?",
  "why positive psychology?",
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
    tags: ["latest", "featured", "what's your worry?"],
    excerpt:
      "Beshie, napansin mo ba lately? Si officemate na dati'y laging naka-high heels at full glam, ngayon naka-crocs at hoodie na lang. Si Kuya na laging masayahin, bigla na lang naging parang background music—present pero hindi mo maramdaman. Grabe, baka hindi lang sila pagod… Quiet cracking na yan. Oo besh, hindi lang ito quiet quitting na petiks lang sa trabaho. Iba ito. Mas malala. Ito yung \"I'm fine\" pero sa totoo lang, \"I'm barely holding it together\"",
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
    tags: ["featured"],
    excerpt:
      "Congratulations to the Class of 2023 graduates! As you transition from the academic world to professional opportunities, it's important to approach your career search with strategy and confidence.",
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
    tags: ["featured"],
    excerpt:
      "The quarantine measures this pandemic is an opportunity for parents to relate with their children. Staying at home can be the perfect setting to practice positive parenting.",
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
    commentCount: 31,
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
    commentCount: 0,
  },
];