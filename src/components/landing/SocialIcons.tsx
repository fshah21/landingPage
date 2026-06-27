import type { SocialLink } from '../../lib/social'
import { SOCIAL_LABELS } from '../../lib/social'

interface SocialIconsProps {
  social: SocialLink[]
  className?: string
}

export function SocialIcons({ social, className = '' }: SocialIconsProps) {
  if (social.length === 0) return null
  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {social.map((link, i) => (
        <a
          key={i}
          href={link.href}
          aria-label={SOCIAL_LABELS[link.platform]}
          className="w-9 h-9 rounded-full border border-current flex items-center justify-center text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity"
        >
          {SOCIAL_LABELS[link.platform].slice(0, 2)}
        </a>
      ))}
    </div>
  )
}
