import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { LandingPageData, SectionKey, UploadedImage } from '../types'

import typesSource from '../types.ts?raw'
import themesSource from '../themes.ts?raw'
import socialSource from './social.ts?raw'
import heroSource from '../components/landing/Hero.tsx?raw'
import featuresSource from '../components/landing/Features.tsx?raw'
import pricingSource from '../components/landing/Pricing.tsx?raw'
import gallerySource from '../components/landing/Gallery.tsx?raw'
import sectionsSource from '../components/landing/Sections.tsx?raw'
import socialIconsSource from '../components/landing/SocialIcons.tsx?raw'
import socialSectionSource from '../components/landing/Social.tsx?raw'
import footerSource from '../components/landing/Footer.tsx?raw'
import landingPageSource from '../components/landing/LandingPage.tsx?raw'

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'landing-page'
  )
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

const PACKAGE_JSON = (projectName: string) => `{
  "name": "${projectName}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.1",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.2",
    "autoprefixer": "^10.5.2",
    "postcss": "^8.5.15",
    "tailwindcss": "^4.3.1",
    "typescript": "~6.0.2",
    "vite": "^8.1.0"
  }
}
`

const TSCONFIG_JSON = `{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
`

const VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`

const POSTCSS_CONFIG = `export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
`

const INDEX_CSS = `@import "tailwindcss";\n`

const MAIN_TSX = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

function indexHtml(title: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
}

function appTsx() {
  return `import { LandingPage } from './components/landing/LandingPage'
import { data, images, themeId, sectionOrder } from './data'

export default function App() {
  return <LandingPage data={data} images={images} themeId={themeId} sectionOrder={sectionOrder} />
}
`
}

function dataTs(data: LandingPageData, images: UploadedImage[], themeId: string, sectionOrder: SectionKey[]) {
  const imagesForExport = images.map((img) => ({
    id: img.id,
    name: img.name,
    dataUrl: `/images/${img.name}`,
  }))
  return `import type { LandingPageData, SectionKey, UploadedImage } from './types'

export const data: LandingPageData = ${JSON.stringify(data, null, 2)}

export const images: UploadedImage[] = ${JSON.stringify(imagesForExport, null, 2)}

export const themeId: string = ${JSON.stringify(themeId)}

export const sectionOrder: SectionKey[] = ${JSON.stringify(sectionOrder)}
`
}

export async function exportProject(
  data: LandingPageData,
  images: UploadedImage[],
  themeId: string,
  sectionOrder: SectionKey[],
) {
  const projectName = slugify(data.title)
  const zip = new JSZip()

  zip.file('package.json', PACKAGE_JSON(projectName))
  zip.file('tsconfig.json', TSCONFIG_JSON)
  zip.file('vite.config.ts', VITE_CONFIG)
  zip.file('postcss.config.js', POSTCSS_CONFIG)
  zip.file('index.html', indexHtml(data.title))
  zip.file('.gitignore', 'node_modules\ndist\n')

  zip.file('src/main.tsx', MAIN_TSX)
  zip.file('src/index.css', INDEX_CSS)
  zip.file('src/App.tsx', appTsx())
  zip.file('src/types.ts', typesSource)
  zip.file('src/themes.ts', themesSource)
  zip.file('src/data.ts', dataTs(data, images, themeId, sectionOrder))

  const lib = zip.folder('src/lib')!
  lib.file('social.ts', socialSource)

  const landing = zip.folder('src/components/landing')!
  landing.file('Hero.tsx', heroSource)
  landing.file('Features.tsx', featuresSource)
  landing.file('Pricing.tsx', pricingSource)
  landing.file('Gallery.tsx', gallerySource)
  landing.file('Sections.tsx', sectionsSource)
  landing.file('SocialIcons.tsx', socialIconsSource)
  landing.file('Social.tsx', socialSectionSource)
  landing.file('Footer.tsx', footerSource)
  landing.file('LandingPage.tsx', landingPageSource)

  if (images.length > 0) {
    const imagesFolder = zip.folder('public/images')!
    for (const img of images) {
      imagesFolder.file(img.name, dataUrlToBytes(img.dataUrl))
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${projectName}.zip`)
}
