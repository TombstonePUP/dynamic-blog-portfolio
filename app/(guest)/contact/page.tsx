import { Mail, MapPin, Send } from "lucide-react";
import { Metadata } from "next";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Contact The Strengths Writer",
  description: "Get in touch with Ian I. Llenares.",
};

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ian-llenares-rpm-phd-06aa42103/",
    icon: <FaLinkedinIn />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/thestrengthswriter/",
    icon: <FaInstagram />,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/TheStrengthsWriter",
    icon: <FaFacebookF />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/strengthswriter",
    icon: <FaXTwitter />,
  },
  { label: "YouTube", href: "#", icon: <FaYoutube /> },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen pb-24 font-sans bg-gradient-to-b to-[#72dbcc]/10 from-transparent">
      {/* Decorative background elements */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 "
        aria-hidden
      />

      <section className="relative mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center bg-[#72dbcc]/30 px-3 py-1 text-sm font-semibold text-[#2b776a]">
            Get In Touch
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Let&apos;s start a conversation.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/80">
            Whether you have a question about positive psychology, want to
            collaborate, or just want to say hello, I&apos;d love to hear from
            you.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-12 lg:mt-24 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
          {/* Contact Info Sidebar */}
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Contact Information
              </h3>
              <p className="mt-2 text-sm text-foreground/70">
                Fill out the form and I will get back to you as soon as
                possible.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0D8A1]/30 text-[#D4A373]">
                  <Mail className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <a
                    href="mailto:hello@strengthswriter.com"
                    className="text-sm text-foreground/70 transition hover:text-[#72dbcc]"
                  >
                    hello@strengthswriter.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#72dbcc]/20 text-[#2b776a]">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Location</p>
                  <p className="text-sm text-foreground/70">Philippines</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/50">
                Follow me
              </h3>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-10 items-center justify-center rounded-full bg-foreground text-background transition hover:bg-[#72dbcc] hover:text-foreground"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form Mockup */}
          <div className="bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 sm:p-10">
            <form className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-foreground"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="border-b-2 border-foreground/10 bg-transparent px-0 py-2 text-foreground transition focus:border-[#72dbcc] focus:outline-none focus:ring-0"
                    placeholder="Jane"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-foreground"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="border-b-2 border-foreground/10 bg-transparent px-0 py-2 text-foreground transition focus:border-[#72dbcc] focus:outline-none focus:ring-0"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="border-b-2 border-foreground/10 bg-transparent px-0 py-2 text-foreground transition focus:border-[#72dbcc] focus:outline-none focus:ring-0"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="subject"
                  className="text-sm font-semibold text-foreground"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="border-b-2 border-foreground/10 bg-transparent px-0 py-2 text-foreground transition focus:border-[#72dbcc] focus:outline-none focus:ring-0"
                  placeholder="How can I help you?"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="message"
                  className="text-sm font-semibold text-foreground"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="resize-none border-b-2 border-foreground/10 bg-transparent px-0 py-2 text-foreground transition focus:border-[#72dbcc] focus:outline-none focus:ring-0"
                  placeholder="Write your message here..."
                />
              </div>

              <button
                type="button"
                className="group mt-4 inline-flex w-fit items-center gap-2 bg-[#F0D8A1] px-8 py-3.5 text-sm font-bold text-black transition hover:bg-[#e8cc8a]"
              >
                Send Message
                <Send className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
