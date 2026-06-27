import type { LinkItem } from '../../types'
import type { Theme } from '../../themes'
import { splitSocialLinks } from '../../lib/social'
import { SocialIcons } from './SocialIcons'

interface SocialProps {
  socialLinks: LinkItem[]
  theme: Theme
  background: string
}

export function Social({ socialLinks, theme, background }: SocialProps) {
  const { social } = splitSocialLinks(socialLinks)
  if (social.length === 0) return null
  return (
    <section className={`py-16 px-6 ${background}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-2xl font-bold ${theme.sectionHeading} mb-6`}>Follow us</h2>
        <SocialIcons social={social} className={theme.accentText} />
      </div>
    </section>
  )
}
