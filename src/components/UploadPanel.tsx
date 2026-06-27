import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import type { SectionKey, UploadedImage } from '../types'
import { SECTION_LABELS } from '../types'
import { THEMES } from '../themes'

interface UploadPanelProps {
  readme: string
  onReadmeChange: (value: string) => void
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  themeId: string
  onThemeChange: (themeId: string) => void
  sectionOrder: SectionKey[]
  onSectionOrderChange: (order: SectionKey[]) => void
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function UploadPanel({
  readme,
  onReadmeChange,
  images,
  onImagesChange,
  themeId,
  onThemeChange,
  sectionOrder,
  onSectionOrderChange,
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const readmeInputRef = useRef<HTMLInputElement>(null)

  function moveSection(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return
    const next = [...sectionOrder]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    onSectionOrderChange(next)
  }

  async function addImageFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const newImages = await Promise.all(
      imageFiles.map(async (file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        dataUrl: await fileToDataUrl(file),
      })),
    )
    onImagesChange([...images, ...newImages])
  }

  async function handleReadmeFile(file: File) {
    const text = await file.text()
    onReadmeChange(text)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const readmeFile = files.find((f) => f.name.toLowerCase().endsWith('.md'))
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (readmeFile) handleReadmeFile(readmeFile)
    if (imageFiles.length > 0) addImageFiles(imageFiles)
  }

  function removeImage(id: string) {
    onImagesChange(images.filter((img) => img.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Theme</label>
        <div className="flex gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeChange(theme.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                themeId === theme.id ? 'border-indigo-500' : 'border-transparent hover:border-slate-200'
              }`}
            >
              <span className={`block w-full h-6 rounded mb-1 ${theme.heroBg}`} />
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Section order</label>
        <div className="flex flex-col gap-1">
          {sectionOrder.map((key, index) => (
            <div
              key={key}
              className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700"
            >
              <span>{SECTION_LABELS[key]}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="w-6 h-6 rounded border border-slate-300 text-xs disabled:opacity-30 hover:bg-white"
                  aria-label={`Move ${SECTION_LABELS[key]} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === sectionOrder.length - 1}
                  className="w-6 h-6 rounded border border-slate-300 text-xs disabled:opacity-30 hover:bg-white"
                  aria-label={`Move ${SECTION_LABELS[key]} down`}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700">README.md</label>
          <button
            type="button"
            onClick={() => readmeInputRef.current?.click()}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Upload file
          </button>
          <input
            ref={readmeInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              if (file) handleReadmeFile(file)
            }}
          />
        </div>
        <textarea
          value={readme}
          onChange={(e) => onReadmeChange(e.target.value)}
          placeholder="# My Project&#10;&#10;A short tagline about what it does.&#10;&#10;## Features&#10;- Fast&#10;- Simple&#10;- Open source"
          className="w-full h-64 p-3 text-sm font-mono border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Images</label>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center text-sm transition-colors ${
            isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 text-slate-500'
          }`}
        >
          Drag & drop a README.md and/or images here, or
          <label className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer ml-1">
            browse
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addImageFiles(e.target.files)}
            />
          </label>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.dataUrl} alt={img.name} className="w-full h-16 object-cover rounded border border-slate-200" />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
