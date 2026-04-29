/**
 * Strengths Writer Logo Component
 *
 * Custom logo for The Strengths Writer client
 */

import { LogoProps } from "./index";

export function StrengthsWriterLogo({
  className = "",
  width = 24,
  height = 24,
}: LogoProps) {
  return (
    <svg
      viewBox="0 0 49 48"
      className={`w-full h-full ${className}`}
      width={width}
      height={height}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.3924 13.1091L11.6605 2.89108L11.6605 0H16.2286V2.29649L19.4743 0.00600545L26.5668 0.847487L25.8455 4.21341L29.9327 0.847487L37.2656 2.29003L38.9486 4.69426L30.0529 7.81976L40.2709 6.73786L46.041 17.3165L33.7795 14.792L46.1613 19.6005L48.9261 23.5675L36.7847 28.6164L27.8891 19.1197L34.8614 29.6983L26.687 38.4737V34.5067L22.8402 23.6877L25.3646 40.2769L17.7913 47.4896L13.5839 34.5067L14.6658 25.8515L17.9115 23.4473L18.3924 13.1091Z"
        fill="#222831"
      />
      <path
        d="M15.8679 13.8303L10.0978 4.57405L14.185 14.0708L13.9445 22.4856L3.60634 25.3707L3.48613 26.0919L14.9062 22.9664L15.8679 13.8303Z"
        fill="#393E46"
      />
      <path
        d="M14.666 14.3114L14.3057 22.7264L3.60645 25.3709L4.92871 22.1248L9.49707 21.1629L8.53516 19.7205L3.24609 20.5623L0 12.9891L4.56836 11.3055L10.0977 4.57405L14.666 14.3114ZM7.33301 12.869L10.458 12.1473L8.1748 11.3055L7.33301 12.869Z"
        fill="#948979"
      />
    </svg>
  );
}

/**
 * Strengths Writer Logo Text Component
 * For use in headers alongside the icon
 */
export function StrengthsWriterLogoText({
  className = "",
}: LogoProps & { className?: string }) {
  return (
    <div className={`flex gap-1 leading-none ${className}`}>
      <span className="text-[#393E46]">the</span>
      <span>
        <span className="font-bold text-black">Strengths</span>
      </span>
      <span className="text-[#393E46]">Writer</span>
    </div>
  );
}
