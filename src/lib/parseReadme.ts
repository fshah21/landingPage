import { marked, type Tokens, type Token } from 'marked'
import type { BadgeItem, FeatureItem, InlineNode, LandingPageData, LinkItem, PricingTier, SectionItem } from '../types'
import { splitSocialLinks } from './social'

type InlineToken = Token

function inlineToText(tokens: InlineToken[] | undefined): string {
  if (!tokens) return ''
  return tokens
    .map((t) => {
      if (t.type === 'text' || t.type === 'codespan' || t.type === 'em' || t.type === 'strong') {
        const withChildren = t as { text?: string; tokens?: InlineToken[] }
        return withChildren.tokens ? inlineToText(withChildren.tokens) : withChildren.text ?? ''
      }
      if (t.type === 'link') {
        const link = t as Tokens.Link
        return inlineToText(link.tokens)
      }
      if (t.type === 'image') {
        return ''
      }
      if ('text' in t && typeof (t as { text?: string }).text === 'string') {
        return (t as { text: string }).text
      }
      return ''
    })
    .join('')
    .trim()
}

function extractImages(tokens: InlineToken[] | undefined): BadgeItem[] {
  if (!tokens) return []
  const images: BadgeItem[] = []
  for (const t of tokens) {
    if (t.type === 'image') {
      const img = t as Tokens.Image
      images.push({ alt: img.text || img.title || '', src: img.href })
    } else if (t.type === 'link') {
      const link = t as Tokens.Link
      images.push(...extractImages(link.tokens))
    }
  }
  return images
}

function extractLinks(tokens: InlineToken[] | undefined): LinkItem[] {
  if (!tokens) return []
  const links: LinkItem[] = []
  for (const t of tokens) {
    if (t.type === 'link') {
      const link = t as Tokens.Link
      const label = inlineToText(link.tokens)
      if (label) links.push({ label, href: link.href })
    } else if ('tokens' in t) {
      links.push(...extractLinks((t as { tokens?: InlineToken[] }).tokens))
    }
  }
  return links
}

function inlineToNodes(tokens: InlineToken[] | undefined): InlineNode[] {
  if (!tokens) return []
  const nodes: InlineNode[] = []
  for (const t of tokens) {
    if (t.type === 'link') {
      const link = t as Tokens.Link
      const text = inlineToText(link.tokens)
      if (text) nodes.push({ type: 'link', text, href: link.href })
    } else if (t.type === 'image') {
      continue
    } else {
      const text = inlineToText([t])
      if (text) nodes.push({ type: 'text', text })
    }
  }
  return nodes
}

function isImageOnlyParagraph(paragraph: Tokens.Paragraph): boolean {
  return paragraph.tokens.every(
    (t) => t.type === 'image' || (t.type === 'text' && !inlineToText([t])) || t.type === 'link',
  ) && extractImages(paragraph.tokens).length > 0
}

function listToFeatures(list: Tokens.List): FeatureItem[] {
  return list.items.map((item: Tokens.ListItem) => {
    const text = inlineToText(item.tokens as InlineToken[])
    const separatorMatch = text.match(/^(.*?)[\s]*[-–:][\s]+(.*)$/)
    if (separatorMatch && separatorMatch[1].length < 60) {
      return { title: separatorMatch[1].trim(), description: separatorMatch[2].trim() }
    }
    return { title: text }
  })
}

function splitNamePrice(text: string): { name: string; price?: string } {
  const separatorMatch = text.match(/^(.*?)[\s]*[-–:][\s]+(.*)$/)
  if (separatorMatch && separatorMatch[1].length < 60) {
    return { name: separatorMatch[1].trim(), price: separatorMatch[2].trim() }
  }
  return { name: text }
}

function collectLinksFromBody(bodyTokens: Token[]): LinkItem[] {
  const links: LinkItem[] = []
  for (const t of bodyTokens) {
    if (t.type === 'paragraph') {
      links.push(...extractLinks((t as Tokens.Paragraph).tokens))
    } else if (t.type === 'list') {
      for (const item of (t as Tokens.List).items) {
        links.push(...extractLinks(item.tokens as InlineToken[]))
      }
    }
  }
  return links
}

function extractPricingTiers(bodyTokens: Token[]): PricingTier[] {
  const tiers: PricingTier[] = []
  let i = 0
  while (i < bodyTokens.length) {
    const t = bodyTokens[i]
    if (t.type === 'heading' && (t as Tokens.Heading).depth === 3) {
      const headingText = inlineToText((t as Tokens.Heading).tokens)
      let j = i + 1
      const tierBody: Token[] = []
      while (
        j < bodyTokens.length &&
        !(bodyTokens[j].type === 'heading' && (bodyTokens[j] as Tokens.Heading).depth <= 3)
      ) {
        tierBody.push(bodyTokens[j])
        j++
      }

      const lists = tierBody.filter((bt) => bt.type === 'list') as Tokens.List[]
      const features = lists.flatMap((list) =>
        list.items.map((item: Tokens.ListItem) => inlineToText(item.tokens as InlineToken[])),
      )

      const { name, price } = splitNamePrice(headingText)
      tiers.push({ name, price, features })
      i = j
    } else {
      i++
    }
  }
  return tiers
}

export function parseReadme(markdown: string): LandingPageData {
  const tokens = marked.lexer(markdown)

  let title = 'Untitled Project'
  let tagline: string | undefined
  let description: string | undefined
  const badges: BadgeItem[] = []
  const features: FeatureItem[] = []
  const sections: SectionItem[] = []
  const links: LinkItem[] = []
  const pricingTiers: PricingTier[] = []
  const socialLinks: LinkItem[] = []

  let titleIndex = -1
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'heading' && (t as Tokens.Heading).depth === 1) {
      title = inlineToText((t as Tokens.Heading).tokens)
      titleIndex = i
      break
    }
  }

  let firstSectionIndex = tokens.length
  for (let i = titleIndex + 1; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'heading' && (t as Tokens.Heading).depth <= 2) {
      firstSectionIndex = i
      break
    }
    if (t.type === 'paragraph') {
      const p = t as Tokens.Paragraph
      if (isImageOnlyParagraph(p)) {
        badges.push(...extractImages(p.tokens))
        continue
      }
      const text = inlineToText(p.tokens)
      if (!text) continue
      if (!tagline) {
        tagline = text
      } else if (!description) {
        description = text
      }
    }
  }

  let i = firstSectionIndex
  while (i < tokens.length) {
    const t = tokens[i]
    if (t.type === 'heading' && (t as Tokens.Heading).depth <= 2) {
      const heading = inlineToText((t as Tokens.Heading).tokens)
      let j = i + 1
      const bodyTokens: Token[] = []
      while (j < tokens.length && !(tokens[j].type === 'heading' && (tokens[j] as Tokens.Heading).depth <= 2)) {
        bodyTokens.push(tokens[j])
        j++
      }

      const isPricingHeading = /pricing/i.test(heading)
      const tiers = isPricingHeading ? extractPricingTiers(bodyTokens) : []

      if (tiers.length > 0) {
        pricingTiers.push(...tiers)
        i = j
        continue
      }

      const isSocialHeading = /social|connect|follow/i.test(heading)
      const { social } = isSocialHeading
        ? splitSocialLinks(collectLinksFromBody(bodyTokens))
        : { social: [] }

      if (social.length > 0) {
        socialLinks.push(...social)
        links.push(...social)
        i = j
        continue
      }

      const lists = bodyTokens.filter((bt) => bt.type === 'list') as Tokens.List[]
      const paragraphs = bodyTokens.filter((bt) => bt.type === 'paragraph') as Tokens.Paragraph[]

      for (const list of lists) {
        features.push(...listToFeatures(list))
      }
      for (const p of paragraphs) {
        links.push(...extractLinks(p.tokens))
      }

      const paragraphNodes = paragraphs.map((p) => inlineToNodes(p.tokens)).filter((nodes) => nodes.length > 0)
      if (paragraphNodes.length > 0) {
        sections.push({ heading, paragraphs: paragraphNodes })
      }

      i = j
    } else {
      i++
    }
  }

  return { title, tagline, description, badges, features, sections, links, pricingTiers, socialLinks }
}
