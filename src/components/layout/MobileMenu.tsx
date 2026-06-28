import { Link } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/useIsMobile";

export interface MobileMenuProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
  }>;
}

export function MobileMenu({ items }: MobileMenuProps): React.JSX.Element {
  const isMobile = useIsMobile();

  return (
    <nav
      role="navigation"
      aria-label="Mobile menu navigation"
      className="flex items-center justify-around w-full h-12"
    >
      {items.map((item) => {
        const Icon = item.icon;

        if (isMobile) {
          // Icon-only rendering for mobile screens (< 768px)
          return (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title={item.label}
            >
              <Icon size={20} strokeWidth={2} />
            </Link>
          );
        }

        // Icon + text rendering for desktop screens (>= 768px)
        return (
          <Link
            key={item.id}
            to={item.path}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            title={item.label}
          >
            <Icon size={16} strokeWidth={2} className="shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileMenu;
