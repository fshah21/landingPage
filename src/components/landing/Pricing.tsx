import type { PricingTier } from '../../types'
import type { Theme } from '../../themes'

interface PricingProps {
  tiers: PricingTier[]
  theme: Theme
  background: string
}

export function Pricing({ tiers, theme, background }: PricingProps) {
  if (tiers.length === 0) return null
  return (
    <section className={`py-16 px-6 ${background}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className={`text-2xl font-bold ${theme.sectionHeading} text-center mb-10`}>Pricing</h2>
        <div
          className="grid gap-6 justify-center"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(220px, 280px))` }}
        >
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`p-8 rounded-xl border ${theme.cardBorder} ${theme.cardHoverBorder} transition-colors text-center flex flex-col items-center`}
            >
              <h3 className={`font-semibold text-lg ${theme.sectionHeading} mb-2`}>{tier.name}</h3>
              {tier.price && <p className={`text-3xl font-bold ${theme.accentText} mb-4`}>{tier.price}</p>}
              {tier.features.length > 0 && (
                <ul className={`text-sm ${theme.bodyText} space-y-2`}>
                  {tier.features.map((feature, j) => (
                    <li key={j}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
