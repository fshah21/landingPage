import type { FeatureItem } from '../../types'
import type { Theme } from '../../themes'

interface FeaturesProps {
  features: FeatureItem[]
  theme: Theme
  background: string
}

export function Features({ features, theme, background }: FeaturesProps) {
  if (features.length === 0) return null
  return (
    <section className={`py-16 px-6 ${background}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className={`text-2xl font-bold ${theme.sectionHeading} text-center mb-10`}>Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl border ${theme.cardBorder} ${theme.cardHoverBorder} hover:shadow-md transition-all text-center`}
            >
              <h3 className={`font-semibold ${theme.sectionHeading} mb-2`}>{feature.title}</h3>
              {feature.description && <p className={`text-sm ${theme.bodyText}`}>{feature.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
