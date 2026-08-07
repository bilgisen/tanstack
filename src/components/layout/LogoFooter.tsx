import { Logo } from "./Logo";

interface LogoFooterProps {
  size?: number;
  className?: string;
}

export function LogoFooter({ size = 32, className }: LogoFooterProps) {
  return (
    <Logo
      size={size}
      className={className}
      role="img"
      aria-label="Jetborsa logo"
      textClassName="uppercase"
      textStyle={{ color: "#ffffff", fontWeight: 400 }}
      style={{ color: "#ffffff" }}
    />
  );
}