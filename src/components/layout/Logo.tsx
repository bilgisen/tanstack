import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 375 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="oklch(0.48 0.14 175.0)" />
        </linearGradient>
      </defs>
      <path
        d="M46 273c25.405 0 46-20.595 46-46s-20.595-46-46-46-46 20.595-46 46 20.595 46 46 46m169-148a45 45 0 1 0-90 0v150a45 45 0 1 0 90 0v-40a35 35 0 1 1 70 0v120a45 45 0 1 0 90 0V45a45 45 0 1 0-90 0v120a35.003 35.003 0 0 1-35 35 35 35 0 0 1-35-35z"
        fill="url(#logo-gradient)"
      />
    </svg>
  );
}
