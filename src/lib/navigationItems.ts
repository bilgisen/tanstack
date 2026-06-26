import type { ElementType } from "react";
import { 
  ChartNoAxesCombined, 
  Factory, 
  Building2,
  Shield,
  CreditCard
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: ElementType;
  path: string;
  showAsIconOnMobile?: boolean;
}

export const navigationItems: MenuItem[] = [
  {
    id: "endeksler",
    label: "Endeksler",
    icon: ChartNoAxesCombined,
    path: "/endeksler",
    showAsIconOnMobile: true,
  },
  {
    id: "sektorler",
    label: "Sektörler",
    icon: Factory,
    path: "/sektorler",
    showAsIconOnMobile: true,
  },
  {
    id: "sirketler",
    label: "Şirketler",
    icon: Building2,
    path: "/sirketler",
    showAsIconOnMobile: true,
  },
  {
    id: "neden-jetborsa",
    label: "Neden Jetborsa",
    icon: Shield,
    path: "/neden-jetborsa",
  },
  {
    id: "kurumsal",
    label: "Kurumsal Abonelik",
    icon: CreditCard,
    path: "/kurumsal",
  },
];
