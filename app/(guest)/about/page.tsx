import { ArrowRight, Lightbulb, Target } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About The Strengths Writer",
  description: "Learn more about Ian I. Llenares and the mission behind The Strengths Writer.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen pb-24 font-sans bg-gradient-to-b from-transparent to-primary/30">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b " aria-hidden />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:pt-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
          
          {/* Text Content */}
          <div className="flex flex-col gap-6 lg:max-w-xl">
            <span className="inline-flex w-fit items-center bg-[#F0D8A1] px-3 py-1 text-sm font-semibold text-black">
              About The Strengths Writer
            </span>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
              Promoting <span className="text-[#72dbcc]">positive change</span> and the psychology of everyday life.
            </h1>
            <div className="mt-4 space-y-6 text-lg leading-relaxed text-foreground/80">
              <p>
                <strong>The strengths writer</strong> is a personal blog to promote <em>positive change, mental health</em> and the <em>psychology</em> of everyday life. This showcases blogs, movie reviews, and podcasts. This resource material is informative, fun, and inspirational for everyone.
              </p>
              <p>
                This site is created by <strong>Ian I. Llenares</strong>. IAN is a graduate of <strong>PhD Industrial Psychology</strong> and a <strong>registered Psychometrician</strong>. He is also a lecturer-reviewer in Psychology and a faculty researcher.
              </p>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/80"
              >
                Get in touch
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#72dbcc]/30 to-[#F0D8A1]/30 blur-2xl opacity-60" aria-hidden />
            <div className="group relative aspect-[4/5] w-full overflow-hidden shadow-2xl ring-1 ring-black/10 transition-all duration-500 hover:ring-[#72dbcc]/50 lg:aspect-[4/4.5]">
              <div className="absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-80" aria-hidden />
              <Image
                src="https://strengthswriter.com/wp-content/uploads/2023/07/Ian-L-1024x1024.jpg"
                alt="Ian I. Llenares"
                fill
                className="object-cover object-top transition duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute bottom-6 left-6 z-20">
                <p className="text-xl font-bold text-white">Ian I. Llenares</p>
                <p className="text-sm font-medium text-white/80">PhD Industrial Psychology</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative mx-auto mt-24 max-w-7xl px-5 sm:px-8 lg:mt-32">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          
          {/* Mission */}
          <div className="group flex flex-col gap-6 overflow-hidden bg-[#72dbcc]/5 p-10 shadow-sm ring-1 ring-black/[0.04] transition-all hover:shadow-md hover:ring-[#72dbcc]/40">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#72dbcc]/15 text-[#2b776a]">
              <Target className="size-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Mission</h3>
            <p className="text-base leading-[1.8] text-foreground/80">
              As challenges in life exist. I see a need to be an optimistic and find ways to overcome obstacles in life without ignoring the problem. It is in my mission to promote psychological strengths and psychology.
            </p>
          </div>

          {/* Vision */}
          <div className="group flex flex-col gap-6 overflow-hidden bg-[#72dbcc]/5 p-10 shadow-sm ring-1 ring-black/[0.04] transition-all hover:shadow-md hover:ring-[#F0D8A1]/50">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#F0D8A1]/30 text-[#D4A373]">
              <Lightbulb className="size-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Vision</h3>
            <p className="text-base leading-[1.8] text-foreground/80">
              To be an inspirational digital writer in the field of strengths and positive psychology in the Philippines.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}
