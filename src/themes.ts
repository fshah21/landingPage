export interface Theme {
  id: string
  name: string
  heroBg: string
  heroText: string
  heroSubtext: string
  heroMutedText: string
  primaryButton: string
  secondaryButton: string
  sectionBg: string
  altSectionBg: string
  sectionHeading: string
  accentText: string
  cardBorder: string
  cardHoverBorder: string
  bodyText: string
  footerBg: string
  footerText: string
  footerLinkHover: string
}

export const THEMES: Theme[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    heroBg: 'bg-gradient-to-b from-slate-900 to-slate-800',
    heroText: 'text-white',
    heroSubtext: 'text-slate-300',
    heroMutedText: 'text-slate-400',
    primaryButton: 'bg-indigo-500 hover:bg-indigo-400 text-white',
    secondaryButton: 'border border-slate-600 hover:border-slate-400 text-white',
    sectionBg: 'bg-white',
    altSectionBg: 'bg-indigo-50',
    sectionHeading: 'text-slate-900',
    accentText: 'text-indigo-600',
    cardBorder: 'border-slate-200',
    cardHoverBorder: 'hover:border-indigo-300',
    bodyText: 'text-slate-600',
    footerBg: 'bg-slate-900',
    footerText: 'text-slate-400',
    footerLinkHover: 'hover:text-white',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    heroBg: 'bg-gradient-to-b from-emerald-900 to-emerald-800',
    heroText: 'text-white',
    heroSubtext: 'text-emerald-100',
    heroMutedText: 'text-emerald-200/80',
    primaryButton: 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950',
    secondaryButton: 'border border-emerald-600 hover:border-emerald-400 text-white',
    sectionBg: 'bg-stone-50',
    altSectionBg: 'bg-emerald-50',
    sectionHeading: 'text-stone-900',
    accentText: 'text-emerald-600',
    cardBorder: 'border-stone-200',
    cardHoverBorder: 'hover:border-emerald-300',
    bodyText: 'text-stone-600',
    footerBg: 'bg-emerald-950',
    footerText: 'text-emerald-200/70',
    footerLinkHover: 'hover:text-white',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    heroBg: 'bg-gradient-to-b from-rose-900 to-zinc-900',
    heroText: 'text-white',
    heroSubtext: 'text-rose-100',
    heroMutedText: 'text-rose-200/70',
    primaryButton: 'bg-rose-400 hover:bg-rose-300 text-rose-950',
    secondaryButton: 'border border-zinc-600 hover:border-zinc-400 text-white',
    sectionBg: 'bg-zinc-50',
    altSectionBg: 'bg-rose-50',
    sectionHeading: 'text-zinc-900',
    accentText: 'text-rose-600',
    cardBorder: 'border-zinc-200',
    cardHoverBorder: 'hover:border-rose-300',
    bodyText: 'text-zinc-600',
    footerBg: 'bg-zinc-950',
    footerText: 'text-zinc-400',
    footerLinkHover: 'hover:text-white',
  },
]

export const DEFAULT_THEME_ID = THEMES[0].id

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
