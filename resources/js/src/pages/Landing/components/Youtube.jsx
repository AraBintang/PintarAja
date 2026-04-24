import { usePublicSettings } from '@/hooks/usePublicSettings'
import useScrollReveal from '@/hooks/useScrollReveal'

// Proper YouTube logo SVG
function YoutubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24">
      <path
        fill="#FF0000"
        d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z"
      />
    </svg>
  )
}

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

  // Determine grid class based on video count
  const getGridClass = (count) => {
    if (count === 1) return 'flex justify-center'
    if (count === 2) return 'flex flex-wrap justify-center gap-6'
    return 'flex flex-wrap justify-center gap-6'
  }

  // Max width for each card based on count
  const getCardWidth = (count) => {
    if (count === 1) return 'w-full max-w-2xl'
    if (count === 2) return 'w-full sm:w-[calc(50%-12px)] max-w-lg'
    return 'w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md'
  }

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/7 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="h-10 w-72 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              <div className="h-5 w-96 bg-gray-100 dark:bg-gray-800/70 rounded-lg animate-pulse" />
            </div>
          ) : (
            <>
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[13px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-full mb-5">
                <YoutubeIcon className="w-4 h-4" />
                Video
              </span>

              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a192f] dark:text-white tracking-tight leading-tight">
                Lihat Cara Kerjanya
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-base max-w-xl mx-auto leading-relaxed">
                Tonton video berikut untuk memahami bagaimana Pintaraja membantu produktivitasmu.
              </p>
            </>
          )}
        </div>

        {/* Video Grid — flex with centering */}
        <div
          className={loading ? 'flex flex-wrap justify-center gap-6' : getGridClass(videos.length)}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900"
                >
                  <div
                    className="relative w-full bg-gray-200 dark:bg-gray-800 animate-pulse"
                    style={{ paddingBottom: '56.25%' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400 fill-current ml-0.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/80 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse flex-1" />
                  </div>
                </div>
              ))
            : videos.map((video, i) => (
                <div
                  key={video.id ?? i}
                  className={`${getCardWidth(videos.length)} group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-red-500/15 dark:hover:shadow-red-500/20 transition-all duration-500 hover:-translate-y-1.5 bg-white dark:bg-gray-900 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${0.1 * i}s` : '0s',
                    transitionProperty: 'opacity, transform, box-shadow',
                    transitionDuration: '0.6s, 0.6s, 0.3s',
                    transitionTimingFunction: 'ease',
                  }}
                >
                  {/* Video iframe */}
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

                  {/* Label bar */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                    <YoutubeIcon className="w-7 h-7 shrink-0" />
                    <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate">
                      {video.label ?? 'YouTube Video'}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
