import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "Tahimik Pero Wasak: Beshie, Quiet Cracking Na Yan!",
    href: "#",
    image: "https://strengthswriter.com/wp-content/uploads/2025/08/BA2A2C81-6F61-40A8-8AC3-B82D15C0B67C-1.png",
    author: "Ian",
    date: "August 13, 2025",
    tags: ["Latest", "Featured", "What's your worry?"],
    excerpt: "Beshie, napansin mo ba lately? Si officemate na dati’y laging naka-high heels at full glam, ngayon naka-crocs at hoodie na lang. Si Kuya na laging masayahin, bigla na lang naging parang background music—present pero hindi mo maramdaman. Grabe, baka hindi lang sila pagod… Quiet cracking na yan. Oo besh, hindi lang ito quiet quitting na petiks lang sa trabaho. Iba ito. Mas malala. Ito yung “I’m fine” pero sa totoo lang, “I’m barely holding it together”",
    comments: "No Comments",
  },
  {
    id: 2,
    title: "Career Search: A Guide for Graduates of the Class of 2023",
    href: "#",
    image: "https://strengthswriter.com/wp-content/uploads/2023/06/Blog_1.jpg",
    author: "Ian",
    date: "June 30, 2023",
    tags: ["Featured"],
    excerpt: "Congratulations to the Class of 2023 graduates! As you transition from the academic world to professional opportunities, it",
    comments: "No Comments",
  },
  {
    id: 3,
    title: "The A to Z of Positive Parenting",
    href: "#",
    image: "https://strengthswriter.com/wp-content/uploads/2021/02/Blog-Post-6a.jpg",
    author: "Ian",
    date: "May 1, 2021",
    tags: ["Featured"],
    excerpt: "The quarantine measures this pandemic is an opportunity for parents to relate with their children. Staying at home",
    comments: "No Comments",
  },
  {
    id: 4,
    title: "Positive psychology goals is to boost our strengths",
    href: "#",
    image: "https://strengthswriter.com/wp-content/uploads/2021/02/Positive-Strengths.jpg",
    author: "Ian",
    date: "February 10, 2021",
    tags: ["Personal blog", "Why positive psychology?"],
    excerpt: "In a world that often focuses on problems, challenges, and deficiencies positive psychology provides revitalizing perspective by emphasizing",
    comments: "31 Comments",
  },
  {
    id: 5,
    title: "Attack on Itan: How to increase one's self-confidence?",
    href: "#",
    image: "https://strengthswriter.com/wp-content/uploads/2021/01/144040220_1034879487001599_8417849835091764025_n.jpg",
    author: "Ian",
    date: "February 4, 2021",
    tags: ["Featured", "What's your worry?"],
    excerpt: "Bes, sa buhay minsan hindi maiwasan na nawawalan tayo ng tiwala sa atin sarili. Minsan o madalas ay",
    comments: "No Comments",
  },
  {
    id: 6,
    title: "Wearing is Caring",
    href: "#",
    image: "https://strengthswriter.com/wp-content/uploads/2021/01/Wearing-is-caring-blog-1.jpg",
    author: "Ian",
    date: "January 25, 2021",
    tags: ["Featured", "What's your worry?"],
    excerpt: "Halos sampung buwan na tayo nasa quarantine measures para mapigilan ang patuloy na paglaganap ng coronavirus. Habang ang",
    comments: "No Comments",
  },
];

const recentPosts = [
  {
    title: "Career Search: A Guide for Graduates of the Class of 2023",
    date: "June 30, 2023",
    comments: "0 Comments",
    image: "https://strengthswriter.com/wp-content/uploads/2023/06/Blog_1-150x150.jpg",
    href: "#",
  },
  {
    title: "Positive psychology goals is to boost our strengths",
    date: "February 10, 2021",
    comments: "31 Comments",
    image: "https://strengthswriter.com/wp-content/uploads/2021/02/Positive-Strengths-150x150.jpg",
    href: "#",
  },
  {
    title: "Attack on Itan: How to increase one's self-confidence?",
    date: "February 4, 2021",
    comments: "0 Comments",
    image: "https://strengthswriter.com/wp-content/uploads/2021/01/144040220_1034879487001599_8417849835091764025_n-150x150.jpg",
    href: "#",
  },
  {
    title: "Tahimik Pero Wasak: Beshie, Quiet Cracking Na Yan!",
    date: "August 13, 2025",
    comments: "0 Comments",
    image: "https://strengthswriter.com/wp-content/uploads/2025/08/BA2A2C81-6F61-40A8-8AC3-B82D15C0B67C-1-150x150.png",
    href: "#",
  },
  {
    title: "The A to Z of Positive Parenting",
    date: "May 1, 2021",
    comments: "0 Comments",
    image: "https://strengthswriter.com/wp-content/uploads/2021/02/Blog-Post-6a-150x150.jpg",
    href: "#",
  },
];

const categories = [
  "Featured",
  "Movie Review",
  "Personal blog",
  "What's your worry?",
  "Why positive psychology?",
];

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ian-llenares-rpm-phd-06aa42103/", color: "bg-blue-700", icon: "in" },
  { label: "Instagram", href: "https://www.instagram.com/thestrengthswriter/", color: "bg-pink-500", icon: "ig" },
  { label: "Facebook", href: "https://www.facebook.com/TheStrengthsWriter", color: "bg-blue-600", icon: "fb" },
  { label: "Twitter", href: "https://twitter.com/strengthswriter", color: "bg-sky-500", icon: "tw" },
  { label: "YouTube", href: "#", color: "bg-red-600", icon: "yt" },
];

type IconKey = "in" | "ig" | "fb" | "tw" | "yt";

function SocialIcon({ social }: { social: typeof socials[0] }) {
  const icons: Record<IconKey, React.ReactNode> = {
    in: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    ig: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    fb: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    tw: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    yt: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${social.color} text-white rounded-full size-10 flex items-center justify-center hover:opacity-80 transition`}
      aria-label={social.label}
    >
      {icons[social.icon as IconKey]}
    </a>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans bg-[#FAF9F6] space-y-6">
      <section className="max-w-5xl mx-auto pt-4">
        <Link key={blogPosts[0].id} href={blogPosts[0].href} className="group flex flex-col bg-white overflow-hidden transition justify-between">
          <div className="overflow-hidden relative">
            <img
              src={blogPosts[0].image}
              alt={blogPosts[0].title}
              className="w-full h-130 object-cover group-hover:scale-101 transition duration-300"
            />
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="flex items-center text-xs bg-green-700/80 p-2 text-white  mb-2">
                Latest
              </span>
              <span className="flex items-center text-xs bg-blue-700/80 p-2 text-white  mb-2">
                {blogPosts[0].tags[1]}
              </span>
            </div>
          </div>

          <span className="p-6 pb-2 space-y-2">
            <h4 className="text-2xl font-bold tracking-wide text-neutral-800 leading-snug">
              {blogPosts[0].title}
            </h4>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-1">{blogPosts[0].excerpt}</p>
          </span>

        </Link>
      </section>

      <section className="max-w-5xl mx-auto pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            href={post.href}
            className="group flex flex-col gap-4 bg-white overflow-hidden transition p-8"
          >
            <div className="overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-34 object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            <div>
              <h4
                className="font-bold text-base uppercase tracking-wide text-neutral-900 leading-snug mb-2 group-hover:text-blue-700 transition"
              >
                {post.title}
              </h4>

              <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}

        {/* PAGINATION */}
        <div className="md:col-span-2 flex items-center gap-2 mt-4">
          <span className="px-3 py-1 bg-blue-700 text-white text-sm rounded">1</span>
          <Link href="#" className="px-3 py-1 border border-neutral-300 text-sm rounded hover:bg-neutral-100 transition">2</Link>
          <Link href="#" className="px-3 py-1 border border-neutral-300 text-sm rounded hover:bg-neutral-100 transition">Next »</Link>
        </div>
      </section>


      {/* BLOG + SIDEBAR */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* BLOG POSTS */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white border border-neutral-200 rounded overflow-hidden shadow-sm">
                <div className="overflow-hidden">
                  <Link href={post.href}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-44 object-cover hover:scale-105 transition duration-300"
                    />
                  </Link>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-base uppercase tracking-wide text-neutral-900 leading-snug mb-2"
                    style={{ fontFamily: "Merriweather, serif" }}>
                    <Link href={post.href} className="hover:text-blue-700 transition">
                      {post.title}
                    </Link>
                  </h4>
                  <div className="flex flex-wrap gap-x-3 text-xs text-neutral-500 mb-3">
                    <span>👤 {post.author}</span>
                    <span>📅 {post.date}</span>
                    <span>🏷 {post.tags.join(", ")}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">{post.excerpt}</p>
                  <Link
                    href={post.href}
                    className="inline-block bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}

            {/* PAGINATION */}
            <div className="md:col-span-2 flex items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-blue-700 text-white text-sm rounded">1</span>
              <Link href="#" className="px-3 py-1 border border-neutral-300 text-sm rounded hover:bg-neutral-100 transition">2</Link>
              <Link href="#" className="px-3 py-1 border border-neutral-300 text-sm rounded hover:bg-neutral-100 transition">Next »</Link>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="w-full lg:w-72 flex flex-col gap-8">

            {/* Search */}
            <div>
              <input
                type="search"
                placeholder="Search"
                className="w-full border border-neutral-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-700"
              />
            </div>

            {/* About */}
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-800 border-l-4 border-blue-700 pl-3 mb-4">About</h3>
              <div className="flex flex-col items-center text-center gap-3">
                <img
                  src="https://strengthswriter.com/wp-content/uploads/2023/07/Ian-L2.jpg"
                  alt="Ian I. Llenares"
                  className="w-32 h-32 rounded-full object-cover"
                />
                <p className="font-bold text-sm text-neutral-800">IAN I. LLENARES, PhD</p>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  PhD Industrial Psychology | Registered Psychometrician | Author | Lecturer | Reviewer | Researcher
                </p>
              </div>
            </div>

            {/* Follow */}
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-800 border-l-4 border-blue-700 pl-3 mb-4">Follow Us</h3>
              <div className="flex gap-2 flex-wrap">
                {socials.map((s) => (
                  <SocialIcon key={s.label} social={s} />
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-800 border-l-4 border-blue-700 pl-3 mb-4">Recent Posts</h3>
              <ul className="flex flex-col gap-4">
                {recentPosts.map((p, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <Link href={p.href}>
                      <img src={p.image} alt={p.title} className="w-14 h-14 object-cover rounded flex-shrink-0" />
                    </Link>
                    <div>
                      <Link href={p.href} className="text-xs font-semibold text-neutral-800 hover:text-blue-700 transition leading-snug block">
                        {p.title}
                      </Link>
                      <p className="text-xs text-neutral-500 mt-1">{p.date} / {p.comments}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-800 border-l-4 border-blue-700 pl-3 mb-4">Categories</h3>
              <ul className="flex flex-col gap-2">
                {categories.map((c) => (
                  <li key={c}>
                    <Link href="#" className="text-sm text-neutral-700 hover:text-blue-700 transition">
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </aside>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-800 pt-10 pb-0">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4 pb-8">
          <img
            src="https://strengthswriter.com/wp-content/uploads/2021/01/strengthswriter-w.png"
            alt="The Strengths Writer"
            className="h-16 object-contain"
          />
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-blue-400 transition text-lg"
                aria-label={s.label}
              >
                <SocialIcon social={s} />
              </a>
            ))}
          </div>
        </div>
        <div className="bg-neutral-900 py-4 text-center">
          <p className="text-xs text-neutral-500 tracking-wider uppercase">
            ©2020 THESTRENGTHSWRITER inc. All Right Reserved. Designed by Adrian Llenares
          </p>
        </div>
      </footer >

    </div >
  );
}