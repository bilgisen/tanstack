import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "full" | "icon" | "text";
}

function JetIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1163 1520" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path d="M108.347 1520c-57.631 0-86.447-26.54-86.447-79.61v-426.7q0-79.612 86.447-79.611h242.052q100.278 0 100.278-79.61v-89.162H86.447Q0 765.307 0 685.699l6.916-606.09Q6.916.001 93.363 0h983.187c57.63 0 86.45 26.537 86.45 79.61v765.306q.001 340.73-172.894 506.314C872.538 1463.74 715.781 1520 519.835 1520z" fill="currentColor" />
    </svg>
  );
}

function BorsaText({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1200 452" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <text x="0" y="380" fontFamily="Inter, system-ui, sans-serif" fontSize="420" fontWeight="600" fill="currentColor">borsa</text>
    </svg>
  );
}

export function Logo({ size = 24, variant = "full", className, ...props }: LogoProps) {
  if (variant === "icon") {
    const height = size;
    const width = size * (1163 / 1520);
    return <JetIcon width={width} height={height} className={className} {...props} />;
  }

  if (variant === "text") {
    const height = size;
    const width = size * (1200 / 452);
    return <BorsaText width={width} height={height} className={className} {...props} />;
  }

  // full = icon + "borsa" text side by side
  const iconHeight = size;
  const iconWidth = iconHeight * (1163 / 1520);
  const textHeight = size * 0.75;
  const textWidth = textHeight * (1200 / 452);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.1 }} className={className} {...props}>
      <JetIcon width={iconWidth} height={iconHeight} style={{ color: "var(--primary)" }} />
      <BorsaText width={textWidth} height={textHeight} style={{ color: "currentColor" }} />
    </div>
  );
}

export function SiteIcon({ size = 24, className, ...props }: LogoProps) {
  const height = size;
  const width = height * (1163 / 1520);
  return <JetIcon width={width} height={height} className={className} {...props} />;
}
