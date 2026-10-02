export interface PageNavigationContext {
  backLabel: string;
  sectionLabel: string;
  title: string;
  onBack: () => void;
}

export type PageNavigationChange = (context: PageNavigationContext | null) => void;
