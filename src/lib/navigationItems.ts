import { 
  Bell, 
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
  { id: 'endeksler', label: 'ENDEKSLER', icon: ChartNoAxesCombined, path: '/endeksler', showAsIconOnMobile: true },
  { id: 'sektorler', label: 'SEKTÖRLER', icon: Factory, path: '/sektorler', showAsIconOnMobile: true },
  { id: 'bildirimler', label: 'KAP BİLDİRİMLERİ', icon: Bell, path: '/bildirimler', showAsIconOnMobile: true },
];
