import type { ElementType } from "react";
import { 
  ChartNoAxesCombined, 
  Factory 
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: ElementType;
  path: string;
  showAsIconOnMobile?: boolean;
}

export const navigationItems: MenuItem[] = [];
