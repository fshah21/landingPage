import type { UploadedImage } from '../../types'
import type { Theme } from '../../themes'

interface GalleryProps {
  images: UploadedImage[]
  theme: Theme
  background: string
}

export function Gallery({ images, theme, background }: GalleryProps) {
  if (images.length === 0) return null
  return (
    <section className={`py-16 px-6 ${background}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className={`text-2xl font-bold ${theme.sectionHeading} text-center mb-10`}>Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image) => (
            <img
              key={image.id}
              src={image.dataUrl}
              alt={image.name}
              className={`w-full h-48 object-cover rounded-lg border ${theme.cardBorder}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
