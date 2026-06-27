import type { LinkItem } from '../types'

export type SocialPlatform = 'twitter' | 'github' | 'linkedin' | 'instagram' | 'youtube' | 'discord' | 'facebook'

export interface SocialLink extends LinkItem {
  platform: SocialPlatform
}

const PATTERNS: { platform: SocialPlatform; test: RegExp }[] = [
  { platform: 'twitter', test: /(twitter\.com|x\.com)/i },
  { platform: 'github', test: /github\.com/i },
  { platform: 'linkedin', test: /linkedin\.com/i },
  { platform: 'instagram', test: /instagram\.com/i },
  { platform: 'youtube', test: /(youtube\.com|youtu\.be)/i },
  { platform: 'discord', test: /discord\.(gg|com)/i },
  { platform: 'facebook', test: /facebook\.com/i },
]

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  twitter: 'X',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  discord: 'Discord',
  facebook: 'Facebook',
}

export function splitSocialLinks(links: LinkItem[]): { social: SocialLink[]; other: LinkItem[] } {
  const social: SocialLink[] = []
  const other: LinkItem[] = []
  for (const link of links) {
    const match = PATTERNS.find((p) => p.test.test(link.href))
    if (match) {
      social.push({ ...link, platform: match.platform })
    } else {
      other.push(link)
    }
  }
  return { social, other }
}
