import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "full" | "icon";
}

function HisseproFull({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 2439 451" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path d="m2120.36 444 110.4-438h96.6l111 438h-76.8l-24-106.2h-116.4l-24 106.2zm114.6-167.4h88.8l-26.4-117.6q-6.6-29.4-11.4-52.8-4.8-24-6.6-34.8-1.8 10.8-6.6 34.8-4.2 23.4-11.4 52.2zM1966.79 450q-45 0-78-15t-51-42.6q-17.4-28.2-18-66h75q0 27 19.2 42.6 19.8 15 53.4 15 32.4 0 50.4-15 18.6-15 18.6-41.4 0-22.2-13.2-38.4-12.6-16.8-36.6-22.8l-50.4-13.8q-51.6-13.2-79.8-47.4-27.6-34.2-27.6-82.8 0-37.2 16.8-64.8t47.4-42.6q31.2-15 73.2-15 63.6 0 100.8 33 37.2 32.4 37.8 87.6h-75q0-25.8-16.8-40.2-16.8-15-47.4-15-29.4 0-45.6 13.8t-16.2 39q0 22.8 12 39 12.6 15.6 36 22.2l52.2 14.4q52.2 13.2 79.8 47.4 27.6 33.6 27.6 83.4 0 37.2-18 66-18 28.2-50.4 43.8t-76.2 15.6m-452.36-6V6h138.6q43.8 0 75.6 16.2 32.4 16.2 50.4 45.6 18 28.8 18 68.4 0 43.2-22.2 76.2-21.6 33-58.8 46.8l87 184.8h-84l-76.2-174h-53.4v174zm75-240h63.6q31.8 0 49.8-17.4t18-48q0-31.2-18-48.6-18-18-49.8-18h-63.6zm-246.37 246q-42 0-73.2-15.6-30.6-16.2-47.4-45-16.2-29.4-16.2-69V129.6q0-39.6 16.2-68.4 16.8-29.4 47.4-45 31.2-16.2 73.2-16.2 42.6 0 73.2 16.2 30.6 15.6 46.8 45 16.8 28.8 16.8 67.8v191.4q0 39.6-16.8 69-16.2 28.8-46.8 45-30.6 15.6-73.2 15.6m0-66q30.6 0 46.2-16.2 15.6-16.8 15.6-47.4V129.6q0-31.2-15.6-47.4t-46.2-16.2-46.2 16.2-15.6 47.4v190.8q0 30.6 15.6 47.4 16.2 16.2 46.2 16.2m-471.563 60V6H1005.9q63.6 0 100.8 30.6 37.2 30 37.2 82.2 0 29.4-13.2 51t-36 33.6q-22.2 12-51.6 12V213q31.8-.6 56.4 12 25.2 12 39.6 36 15 24 15 58.2 0 37.8-17.4 66t-49.2 43.8q-31.2 15-75 15zm73.2-62.4h63.003q33 0 51.6-17.4 19.2-18 19.2-48.6t-19.2-49.2q-18.6-19.2-51.6-19.2h-63.003zm0-195h60.003q30 0 46.8-15.6 17.4-16.2 17.4-43.8T1051.5 84q-16.8-15.6-46.8-15.6h-60.003zM681.096 444V75.6H588V6h250.8v69.6h-83.096V444zm-316.531 0V6h182.8v65.4h-109v114h108v64.8h-108v128.4h189V444zM144 450.6q-66.6 0-105.6-36.6Q0 376.8 0 314.4h75q0 33 18.6 51.6t50.4 18.6 50.4-18Q213 348 213 315V75.6H111V6h177v309q0 63-39 99.6-38.4 36-105 36" fill="currentColor" />
    </svg>
  );
}

function HisseproIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 212 315" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path d="M106 315q-48.76 0-77.592-26.356Q0 261.862 0 216.802h63.6q0 19.554 11.448 31.457Q86.497 259.737 106 259.737q19.504 0 30.952-11.053 11.448-11.478 11.448-31.032V59.514H78.44V0H212v217.652q0 45.06-28.408 71.417Q155.184 314.999 106 315" fill="currentColor" />
    </svg>
  );
}

export function Logo({ size = 24, variant = "full", className, ...props }: LogoProps) {
  if (variant === "icon") {
    const height = size;
    const width = size * (212 / 315);
    return <HisseproIcon width={width} height={height} className={className} {...props} />;
  }

  const height = size;
  const width = size * (2439 / 451);
  return <HisseproFull width={width} height={height} className={className} {...props} />;
}

export function SiteIcon({ size = 24, className, ...props }: LogoProps) {
  const height = size;
  const width = size * (212 / 315);
  return <HisseproIcon width={width} height={height} className={className} {...props} />;
}
