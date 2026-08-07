import React from "react";

interface LogoProps {
  size?: number;
  variant?: "full" | "icon" | "text";
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  "aria-label"?: string;
  textClassName?: string;
  textStyle?: React.CSSProperties;
}

function JetIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1372 1400" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path d="M1372 0H686v349.912h343v424.685c-19.06 97.171-114.333 291.513-343 291.513S351.167 832.9 326.667 716.294H0c81.667 716.296 490 683.386 718.667 683.386 375.663 0 604.333-265.03 653.333-654.29z" fill="currentColor" />
      <rect x="334.576" y="366.57" width="332.534" height="348.19" fill="#34c759" />
    </svg>
  );
}

function JetIconBranded({ size, className, style }: { size: number; className?: string; style?: React.CSSProperties }) {
  // Round to avoid hydration mismatch from floating-point precision
  const iconSize = Math.round(size * 0.9 * 100) / 100;
  const iconWidth = Math.round(iconSize * (1372 / 1400) * 100) / 100;

  return (
    <JetIcon
      width={iconWidth}
      height={iconSize}
      className={className}
      style={{ color: "var(--primary)", flexShrink: 0, ...style }}
      suppressHydrationWarning
    />
  );
}

function BorsaText({ className, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={className} style={{ fontWeight: 700, letterSpacing: "0.04em", color: "var(--foreground)", ...style }} {...props}>
      JetBorsa
    </span>
  );
}

export function Logo({ size = 24, variant = "full", className, style, role, "aria-label": ariaLabel, textClassName, textStyle }: LogoProps) {
  if (variant === "icon") {
    return <JetIconBranded size={size} className={className} />;
  }

  if (variant === "text") {
    return <BorsaText style={{ fontSize: size, color: "currentColor", ...textStyle }} className={textClassName ?? className} />;
  }

  // full = icon + "jetborsa" text side by side
  const fontSize = size * 0.82;
  return (
    <div role={role} aria-label={ariaLabel} style={{ display: "flex", alignItems: "center", gap: "4px", ...style }} className={className}>
      <JetIconBranded size={size} />
      <BorsaText style={{ fontSize, color: "currentColor", lineHeight: 1, ...textStyle }} className={textClassName} />
    </div>
  );
}

export function SiteIcon({ size = 24, className }: LogoProps) {
  return <JetIconBranded size={size} className={className} />;
}
