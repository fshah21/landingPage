export interface LinkItem {
  label: string
  href: string
}

export interface FeatureItem {
  title: string
  description?: string
}

export type InlineNode = { type: 'text'; text: string } | { type: 'link'; text: string; href: string }

export interface SectionItem {
  heading: string
  paragraphs: InlineNode[][]
}

export interface PricingTier {
  name: string
  price?: string
  features: string[]
}

export interface BadgeItem {
  alt: string
  src: string
}

export interface UploadedImage {
  id: string
  name: string
  dataUrl: string
}

export const SECTION_KEYS = ['features', 'pricing', 'gallery', 'sections', 'social'] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const SECTION_LABELS: Record<SectionKey, string> = {
  features: 'Features',
  pricing: 'Pricing',
  gallery: 'Gallery',
  sections: 'Other sections (e.g. Why Acme)',
  social: 'Social links',
}

export const DEFAULT_SECTION_ORDER: SectionKey[] = ['features', 'pricing', 'gallery', 'sections', 'social']

export interface LandingPageData {
  title: string
  tagline?: string
  description?: string
  badges: BadgeItem[]
  features: FeatureItem[]
  sections: SectionItem[]
  links: LinkItem[]
  pricingTiers: PricingTier[]
  socialLinks: LinkItem[]
}
