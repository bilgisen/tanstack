import React from "react";

interface LogoProps {
  size?: number;
  variant?: "full" | "icon" | "text";
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  "aria-label"?: string;
}

function JetIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1163 1520" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path d="M108.347 1520c-57.631 0-86.447-26.54-86.447-79.61v-426.7q0-79.612 86.447-79.611h242.052q100.278 0 100.278-79.61v-89.162H86.447Q0 765.307 0 685.699l6.916-606.09Q6.916.001 93.363 0h983.187c57.63 0 86.45 26.537 86.45 79.61v765.306q.001 340.73-172.894 506.314C872.538 1463.74 715.781 1520 519.835 1520z" fill="currentColor" />
    </svg>
  );
}

function JetIconBranded({ size, className }: { size: number; className?: string }) {
  const iconSize = size * 0.55;
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: "var(--primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <JetIcon width={iconSize * (1163 / 1520)} height={iconSize} style={{ color: "#fff" }} />
    </div>
  );
}

function BorsaText({ className, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={className} style={{ fontWeight: 600, ...style }} {...props}>
      jetborsa
    </span>
  );
}

export function Logo({ size = 24, variant = "full", className, style }: LogoProps) {
  if (variant === "icon") {
    return <JetIconBranded size={size} className={className} />;
  }

  if (variant === "text") {
    return <BorsaText style={{ fontSize: size, color: "currentColor", ...style }} className={className} />;
  }

  // full = icon + "jetborsa" text side by side
  const fontSize = size * 0.7;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", ...style }} className={className}>
      <JetIconBranded size={size} />
      <BorsaText style={{ fontSize, color: "currentColor", lineHeight: 1 }} />
    </div>
  );
}

export function SiteIcon({ size = 24, className }: LogoProps) {
  return <JetIconBranded size={size} className={className} />;
}
