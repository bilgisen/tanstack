import type { ElementType } from "react";
import { 
  ChartNoAxesCombined, 
  Factory, 
  Building2, 
  Rss, 
  FileText 
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
    id: "haberler",
    label: "Haberler",
    icon: Rss,
    path: "/haberler",
    showAsIconOnMobile: true,
  },
  {
    id: "raporlar",
    label: "Raporlar",
    icon: FileText,
    path: "/raporlar",
    showAsIconOnMobile: true,
  },
];
