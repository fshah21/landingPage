import type { Theme } from '../../themes'
import { splitSocialLinks } from '../../lib/social'
import { SocialIcons } from './SocialIcons'

interface FooterProps {
  title: string
  links: { label: string; href: string }[]
  theme: Theme
}

export function Footer({ title, links, theme }: FooterProps) {
  const { social, other } = splitSocialLinks(links)

  return (
    <footer className={`py-10 px-6 ${theme.footerBg} ${theme.footerText} text-center text-sm`}>
      <p>
        © {new Date().getFullYear()} {title}
      </p>
      {social.length > 0 && <SocialIcons social={social} className="mt-4" />}
      {other.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-3">
          {other.map((link, i) => (
            <a key={i} href={link.href} className={`${theme.footerLinkHover} transition-colors`}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </footer>
  )
}
