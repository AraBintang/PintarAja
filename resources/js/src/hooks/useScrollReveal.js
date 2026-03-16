import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered reveal animations.
 * Returns a ref to attach to the element and an isVisible boolean.
 * Once visible, stays visible (no re-hide).
 *
 * @param {Object} options
 * @param {number} options.threshold - IntersectionObserver threshold (0–1), default 0.15
 * @param {string} options.rootMargin - margin around the root, default '0px 0px -40px 0px'
 */
export default function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, isVisible])

  return { ref, isVisible, inView }
}
