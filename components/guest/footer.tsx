import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LogoIcon, LogoText } from "../app-logo";

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
  { label: "YouTube", href: "#", color: "bg-red-600", icon: <FaYoutube /> },
];

function SocialIcon({ social }: { social: (typeof socials)[0] }) {
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className="text-white text-2xl hover:text-white/80 transition"
    >
      {social.icon}
    </a>
  );
}

export default function GuestFooter() {
  return (
    <footer className="relative h-110 bg-foreground overflow-hidden flex flex-col justify-center items-center p-20">
      <LogoIcon className="absolute -bottom-20 -right-10 size-100 invert" />
      <LogoText className="text-5xl leading-none invert" />
      <div className="flex gap-3 mt-10">
        {socials.map((s) => (
          <SocialIcon key={s.label} social={s} />
        ))}
      </div>
      <p className="absolute bottom-6 text-sm text-white/40 tracking-widest">
        © 2026 TombstonePUP. All rights reserved.
      </p>
    </footer>
  );
}
