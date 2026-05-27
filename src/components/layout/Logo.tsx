import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 330 330"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M163.931 163.929c-16.729-360.33-360.333-16.727 0 0m0 1.384c-16.728 360.331-360.333 16.726 0 0m1.069-1.384c360.332-16.727 16.728-360.33 0 0m.312 1.384c360.332 16.726 16.728 360.331 0 0"
        fill="currentColor"
      />
    </svg>
  );
}
