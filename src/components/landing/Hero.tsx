import type { BadgeItem, LinkItem } from '../../types'
import type { Theme } from '../../themes'

interface HeroProps {
  title: string
  tagline?: string
  description?: string
  badges: BadgeItem[]
  links: LinkItem[]
  theme: Theme
}

export function Hero({ title, tagline, description, badges, links, theme }: HeroProps) {
  return (
    <section className={`${theme.heroBg} ${theme.heroText} py-20 px-6 text-center`}>
      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {badges.map((badge, i) => (
            <img key={i} src={badge.src} alt={badge.alt} className="h-5" />
          ))}
        </div>
      )}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{title}</h1>
      {tagline && <p className={`text-xl ${theme.heroSubtext} max-w-2xl mx-auto mb-3`}>{tagline}</p>}
      {description && <p className={`text-base ${theme.heroMutedText} max-w-2xl mx-auto mb-8`}>{description}</p>}
      {links.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                i === 0 ? theme.primaryButton : theme.secondaryButton
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
