import { Fragment, type ReactNode } from 'react'
import type { LandingPageData, SectionKey, UploadedImage } from '../../types'
import { getTheme } from '../../themes'
import { Hero } from './Hero'
import { Features } from './Features'
import { Pricing } from './Pricing'
import { Gallery } from './Gallery'
import { Sections } from './Sections'
import { Social } from './Social'
import { Footer } from './Footer'

interface LandingPageProps {
  data: LandingPageData
  images: UploadedImage[]
  themeId: string
  sectionOrder: SectionKey[]
}

export function LandingPage({ data, images, themeId, sectionOrder }: LandingPageProps) {
  const theme = getTheme(themeId)

  const hasContent: Record<SectionKey, boolean> = {
    features: data.features.length > 0,
    pricing: data.pricingTiers.length > 0,
    gallery: images.length > 0,
    sections: data.sections.length > 0,
    social: data.socialLinks.length > 0,
  }

  const visibleOrder = sectionOrder.filter((key) => hasContent[key])
  const backgroundByKey = new Map<SectionKey, string>(
    visibleOrder.map((key, index) => [key, index % 2 === 0 ? theme.sectionBg : theme.altSectionBg]),
  )

  const sectionsByKey: Record<SectionKey, ReactNode> = {
    features: (
      <Features features={data.features} theme={theme} background={backgroundByKey.get('features') ?? theme.sectionBg} />
    ),
    pricing: (
      <Pricing tiers={data.pricingTiers} theme={theme} background={backgroundByKey.get('pricing') ?? theme.sectionBg} />
    ),
    gallery: (
      <Gallery images={images} theme={theme} background={backgroundByKey.get('gallery') ?? theme.sectionBg} />
    ),
    sections: (
      <Sections sections={data.sections} theme={theme} background={backgroundByKey.get('sections') ?? theme.sectionBg} />
    ),
    social: (
      <Social socialLinks={data.socialLinks} theme={theme} background={backgroundByKey.get('social') ?? theme.sectionBg} />
    ),
  }

  return (
    <div className="font-sans">
      <Hero
        title={data.title}
        tagline={data.tagline}
        description={data.description}
        badges={data.badges}
        links={data.links}
        theme={theme}
      />
      {sectionOrder.map((key) => (
        <Fragment key={key}>{sectionsByKey[key]}</Fragment>
      ))}
      <Footer title={data.title} links={data.links} theme={theme} />
    </div>
  )
}
