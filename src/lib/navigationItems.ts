import { 
  ChartNoAxesCombined, 
  Factory 
} from "lucide-react";
import type { ElementType } from "react";

export interface MenuItem {
  id: string;
  label: string;
  icon: ElementType;
  path: string;
  showAsIconOnMobile?: boolean;
}

export const navigationItems: Array<MenuItem> = [
  { id: 'endeksler', label: 'Endeksler', icon: ChartNoAxesCombined, path: '/endeksler', showAsIconOnMobile: true },
  { id: 'sektorler', label: 'Sektörler', icon: Factory, path: '/sektorler', showAsIconOnMobile: true },
];
