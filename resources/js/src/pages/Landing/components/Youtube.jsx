import { usePublicSettings } from '@/hooks/usePublicSettings'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Youtube() {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 })
  const { settings, loading } = usePublicSettings()

  const toEmbedUrl = (url) => {
    if (!url) return null
    if (url.includes('/embed/')) return url
    const match = url.match(/(?:youtu\.be\/|v=)([^?&]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }

  const videos = Array.isArray(settings?.youtube_embed_url)
    ? settings.youtube_embed_url
        .filter((v) => v.value)
        .map((v) => ({ ...v, value: toEmbedUrl(v.value) }))
    : settings?.youtube_embed_url
      ? [{ id: 0, label: 'Video', value: toEmbedUrl(settings.youtube_embed_url) }]
      : []

  if (!loading && videos.length === 0) return null

  return (
    <section ref={sectionRef} className="pt-12 pb-24 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div
          className={`text-center mb-14 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transition: 'opacity 0.6s ease, transform 0.6s ease' }}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="h-10 w-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-5 w-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[13px] font-medium text-[#4A90D9] bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A90D9]" />
                Video
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a192f] dark:text-white tracking-tight">
                Lihat Cara Kerjanya
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-[16px] max-w-xl mx-auto">
                Tonton video berikut untuk memahami bagaimana Pintaraja membantu produktivitasmu.
              </p>
            </>
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  {/* Iframe placeholder 16:9 */}
                  <div
                    className="relative w-full bg-gray-200 dark:bg-gray-700 animate-pulse"
                    style={{ paddingBottom: '56.25%' }}
                  >
                    {/* Play icon placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400 dark:text-gray-500 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Label placeholder */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse flex-1" />
                  </div>
                </div>
              ))
            : videos.map((video, i) => (
                <div
                  key={video.id ?? i}
                  className={`group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-orange-500/40 dark:hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-1 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transition: `opacity 0.6s ease ${0.1 * (i + 1)}s, transform 0.6s ease ${0.1 * (i + 1)}s, box-shadow 0.3s ease`,
                  }}
                >
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={video.value}
                      title={video.label ?? `Video ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white fill-white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300 truncate">
                      {video.label ?? 'Youtube Video'}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
