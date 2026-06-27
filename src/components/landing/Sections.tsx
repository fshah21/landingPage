import type { SectionItem } from '../../types'
import type { Theme } from '../../themes'
import { splitSocialLinks } from '../../lib/social'
import { SocialIcons } from './SocialIcons'

interface SectionsProps {
  sections: SectionItem[]
  theme: Theme
  background: string
}

export function Sections({ sections, theme, background }: SectionsProps) {
  if (sections.length === 0) return null
  return (
    <section className={`py-16 px-6 ${background}`}>
      <div className="max-w-3xl mx-auto space-y-12 text-center">
        {sections.map((section, i) => {
          const linksInSection = section.paragraphs.flatMap((nodes) =>
            nodes.filter((node) => node.type === 'link'),
          )
          const { social } = splitSocialLinks(linksInSection.map((node) => ({ label: node.text, href: node.href })))

          return (
            <div key={i}>
              <h2 className={`text-2xl font-bold ${theme.sectionHeading} mb-4`}>{section.heading}</h2>
              {section.paragraphs.map((nodes, j) => (
                <p key={j} className={`${theme.bodyText} leading-relaxed mb-3`}>
                  {nodes.map((node, k) =>
                    node.type === 'link' ? (
                      <a
                        key={k}
                        href={node.href}
                        className={`${theme.accentText} underline hover:no-underline mx-1`}
                      >
                        {node.text}
                      </a>
                    ) : (
                      <span key={k}>{node.text}</span>
                    ),
                  )}
                </p>
              ))}
              {social.length > 0 && <SocialIcons social={social} className={`${theme.accentText} mt-4`} />}
            </div>
          )
        })}
      </div>
    </section>
  )
}
