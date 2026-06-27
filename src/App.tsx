import { useEffect, useMemo, useState } from 'react'
import { UploadPanel } from './components/UploadPanel'
import { LandingPage } from './components/landing/LandingPage'
import { PaywallModal } from './components/PaywallModal'
import { parseReadme } from './lib/parseReadme'
import { exportProject } from './lib/exportProject'
import { DEFAULT_THEME_ID } from './themes'
import { DEFAULT_SECTION_ORDER, type SectionKey, type UploadedImage } from './types'

const SAMPLE_README = `# Acme Toolkit

A blazing-fast toolkit for building things people actually want to use.

Acme Toolkit cuts the boilerplate out of everyday development so your team can ship features instead of fighting configuration.

## Features

- Zero config - Works out of the box with sane defaults
- Type safe - Full TypeScript support across the board
- Extensible - Plugin system for anything you need to bolt on

## Pricing

### Starter - $9/mo
- 1 project
- Basic themes
- Email support

### Pro - $29/mo
- Unlimited projects
- All themes
- Priority support

### Enterprise - Contact us
- Custom integrations
- Dedicated support
- SLA guarantees

## Why Acme

We built Acme after years of copy-pasting the same setup between projects. It's open source, actively maintained, and used in production by teams of all sizes. Check the code on [GitHub](https://github.com/example/acme).

[Get Started](https://example.com/start)

## Social

Follow us on [Instagram](https://instagram.com/acme), [LinkedIn](https://linkedin.com/company/acme), and [Twitter](https://x.com/acme).
`

const UNLOCK_STORAGE_KEY = 'landing-page-generator:unlocked'
const README_STORAGE_KEY = 'landing-page-generator:readme'
const IMAGES_STORAGE_KEY = 'landing-page-generator:images'
const THEME_STORAGE_KEY = 'landing-page-generator:themeId'
const SECTION_ORDER_STORAGE_KEY = 'landing-page-generator:sectionOrder'

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function readStoredSectionOrder(): SectionKey[] {
  const stored = readStoredJson<SectionKey[]>(SECTION_ORDER_STORAGE_KEY, DEFAULT_SECTION_ORDER)
  const missing = DEFAULT_SECTION_ORDER.filter((key) => !stored.includes(key))
  return [...stored, ...missing]
}

export default function App() {
  const [readme, setReadme] = useState(() => sessionStorage.getItem(README_STORAGE_KEY) ?? SAMPLE_README)
  const [images, setImages] = useState<UploadedImage[]>(() => readStoredJson(IMAGES_STORAGE_KEY, []))
  const [themeId, setThemeId] = useState(() => sessionStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID)
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(readStoredSectionOrder)
  const [isExporting, setIsExporting] = useState(false)
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_STORAGE_KEY) === 'true')

  useEffect(() => {
    sessionStorage.setItem(README_STORAGE_KEY, readme)
  }, [readme])

  useEffect(() => {
    sessionStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images))
  }, [images])

  useEffect(() => {
    sessionStorage.setItem(THEME_STORAGE_KEY, themeId)
  }, [themeId])

  useEffect(() => {
    sessionStorage.setItem(SECTION_ORDER_STORAGE_KEY, JSON.stringify(sectionOrder))
  }, [sectionOrder])

  const data = useMemo(() => parseReadme(readme), [readme])

  async function runExport() {
    setIsExporting(true)
    try {
      await exportProject(data, images, themeId, sectionOrder)
    } finally {
      setIsExporting(false)
    }
  }

  function handleDownloadClick() {
    if (isUnlocked) {
      void runExport()
    } else {
      setIsPaywallOpen(true)
    }
  }

  function handleUnlocked() {
    sessionStorage.setItem(UNLOCK_STORAGE_KEY, 'true')
    setIsUnlocked(true)
    setIsPaywallOpen(false)
    void runExport()
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-slate-900">Landing Page Generator</h1>
        <button
          type="button"
          onClick={handleDownloadClick}
          disabled={isExporting}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {isExporting ? 'Preparing zip…' : isUnlocked ? 'Download React project' : 'Unlock & download — ₹99'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] h-[calc(100vh-65px)]">
        <div className="overflow-y-auto p-6 bg-white border-r border-slate-200">
          <UploadPanel
            readme={readme}
            onReadmeChange={setReadme}
            images={images}
            onImagesChange={setImages}
            themeId={themeId}
            onThemeChange={setThemeId}
            sectionOrder={sectionOrder}
            onSectionOrderChange={setSectionOrder}
          />
        </div>
        <div className="overflow-y-auto bg-slate-200">
          <div className="bg-white m-4 rounded-xl shadow-sm overflow-hidden">
            <LandingPage data={data} images={images} themeId={themeId} sectionOrder={sectionOrder} />
          </div>
        </div>
      </div>

      {isPaywallOpen && (
        <PaywallModal
          projectTitle={data.title}
          onClose={() => setIsPaywallOpen(false)}
          onUnlocked={handleUnlocked}
        />
      )}
    </div>
  )
}
