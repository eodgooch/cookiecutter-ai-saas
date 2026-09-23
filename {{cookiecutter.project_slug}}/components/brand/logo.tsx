interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Hexagon outline */}
      <path
        d="M64 8L112 36V92L64 120L16 92V36L64 8Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner sparkle / AI symbol */}
      <path
        d="M64 36L70 54L88 60L70 66L64 84L58 66L40 60L58 54L64 36Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Small dots for decoration */}
      <circle cx="64" cy="28" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="64" cy="100" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="30" cy="50" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="98" cy="50" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
