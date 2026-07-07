import React, { useState, useEffect, useRef } from 'react'
import { useSnackbar } from '@/context/SnackbarContext'
import { useQuota } from '@/hooks/useQuota'
import { request } from '@/utils/Http'
import { ArrowUp, Image as ImageIcon, Plus, X as XIcon, Download, Sparkles, Zap, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { AI_CODE_MAP, AI_MODELS, AutoIcon } from '@/assets/ai'

const IMAGE_MODELS = [
    { 
        id: 'flux', 
        name: 'Flux (Realistis)',
        description: 'High fidelity, realistic image generation',
        icon: <Sparkles className="w-4 h-4 text-gray-300" />
    },
    { 
        id: 'turbo', 
        name: 'Turbo (Cepat)',
        description: 'Fast generation for quick concepts',
        icon: <Zap className="w-4 h-4 text-gray-300" />
    },
    { 
        id: 'midjourney', 
        name: 'Midjourney',
        description: 'Artistic and highly detailed images',
        icon: <ImageIcon className="w-4 h-4 text-gray-300" />
    },
    { 
        id: 'anime', 
        name: 'Anime',
        description: 'Specialized for anime and manga styles',
        icon: <ImageIcon className="w-4 h-4 text-gray-300" />
    },
]

function Spinner() {
    return (
        <svg className="animate-spin w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
    )
}

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState('')
    const [images, setImages] = useState([])
    const [imageUrl, setImageUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [aiProviders, setAiProviders] = useState([])
    const [selectedModel, setSelectedModel] = useState('')
    
    const { showSnackbar } = useSnackbar()
    const { decrement, rollback } = useQuota()

    const textareaRef = useRef(null)
    const imageRef = useRef(null)
    const endRef = useRef(null)

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
    const [showModelMenu, setShowModelMenu] = useState(false)

    useEffect(() => {
        request('/chats')
            .then((res) => {
                if (res?.ai && res.ai.length > 0) {
                    setAiProviders(res.ai)
                    if (!selectedModel) {
                        setSelectedModel(String(res.ai[0].id))
                    }
                }
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)')
        const handler = (e) => setIsMobile(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = prompt ? Math.min(el.scrollHeight, 24 * 5) + 'px' : ''
    }, [prompt])

    useEffect(() => {
        if (imageUrl && endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [imageUrl])

    const handleInput = (e) => {
        setPrompt(e.target.value)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!loading && prompt) generateImage(e)
        }
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        if (images.length + files.length > 5) {
            showSnackbar('error', 'Maksimal 5 gambar referensi!')
            return
        }
        
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }))
        
        setImages(prev => [...prev, ...newImages])
        e.target.value = null
    }

    const removeImage = (index) => {
        setImages(prev => {
            const newImages = [...prev]
            URL.revokeObjectURL(newImages[index].preview)
            newImages.splice(index, 1)
            return newImages
        })
    }

    const generateImage = async (e) => {
        if (e) e.preventDefault()
        if (!prompt || loading) return

        const quotaCode = 'SETTING-GPT' 
        
        setLoading(true)
        setImageUrl('')
        decrement(quotaCode)

        try {
            const formData = new FormData()
            formData.append('prompt', prompt)
            formData.append('model', selectedModel)
            
            images.forEach((img, index) => {
                formData.append(`images[${index}]`, img.file)
            })

            const response = await request('/generate-image', {
                method: 'POST',
                body: formData
            })

            if (response.url) {
                setImageUrl(response.url)
                showSnackbar('success', 'Gambar berhasil dibuat!')
            }
        } catch (err) {
            rollback(quotaCode)
            showSnackbar('error', err.message || 'Gagal generate gambar.')
        } finally {
            setLoading(false)
        }
    }

    const canSend = Boolean(prompt.trim() && !loading)
    const selectedModelName = IMAGE_MODELS.find(m => m.id === selectedModel)?.name

    return (
        <div className="flex flex-col h-[100vh] bg-[#f7f7f5] dark:bg-[#0f141e] transition-colors duration-300">
            {/* Area Konten (Scrollable) */}
            <div className="flex-1 overflow-y-auto pt-8 md:pt-12 px-6 pb-44 flex flex-col items-center">
                
                {!imageUrl && !loading && (
                    <div className="mt-20 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">AI Image Generator</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
                            Pilih model di menu bawah, ketikkan imajinasi Anda, dan biarkan AI menggambarnya. <br/>
                            Anda juga bisa menekan tombol <strong>+</strong> untuk upload gambar referensi (wajah/objek).
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="mt-20 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Sedang melukis imajinasi Anda... (10-30 detik)</p>
                    </div>
                )}

                {imageUrl && !loading && (
                    <div className="w-full max-w-3xl mt-4 p-4 md:p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/60 dark:border-gray-700/50 flex flex-col items-center shadow-sm animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-full relative group rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                            <img src={imageUrl} alt={prompt} className="w-full h-auto object-contain" />
                        </div>
                        <div className="w-full mt-6 flex justify-between items-center">
                            <div className="flex-1" />
                            <a
                                href={imageUrl}
                                download={`ai-image-${Date.now()}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-sm flex-shrink-0"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                        </div>
                    </div>
                )}
                
                <div ref={endRef} className="h-4 w-full"></div>
            </div>

            {/* Bottom Bar Input ala ChatInput */}
            <div
                className="fixed bottom-0 right-0 transition-all duration-300 ease-in-out"
                style={{ left: isMobile ? '10px' : 'var(--sidebar-w, 64px)', right: isMobile ? '10px' : '' }}
            >
                <div className="max-w-3xl md:mx-auto w-full bg-[#f7f7f5] dark:bg-[#0f141e] rounded-t-4xl">
                    <form
                        onSubmit={generateImage}
                        className="w-full bg-white -mt-8 dark:bg-gray-800 rounded-[32px] border border-gray-200/60 dark:border-gray-700/50 shadow-sm relative"
                    >
                        
                        {/* Area Preview File yang di-upload */}
                        {images.length > 0 && (
                            <div className="px-4 pt-4 flex items-end gap-2 flex-wrap">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group shrink-0">
                                        <img src={img.preview} alt={`preview-${index}`} className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-600" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            disabled={loading}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={prompt}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            placeholder={loading ? 'Sedang menggambar...' : 'Deskripsikan gambar yang Anda inginkan...'}
                            className="w-full px-5 my-4 text-[15px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none bg-transparent resize-none min-h-[35px] max-h-[200px] disabled:cursor-not-allowed transition-colors"
                        />

                        <div className="flex items-center justify-between px-3 pb-3">
                            <div className="flex items-center gap-1 relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={imageRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={() => imageRef.current?.click()}
                                    disabled={loading}
                                    className="w-9 h-9 rounded-full border bg-[#eeedeb] dark:bg-black/20 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors relative z-30 flex-shrink-0 disabled:opacity-50"
                                    title="Upload referensi gambar"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>

                                {/* Dropdown Model Gambar */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => !loading && setShowModelMenu((v) => !v)}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-3 py-2 ml-1 bg-[#eeedeb] dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-[13px] transition-all border border-transparent dark:border-gray-700 whitespace-nowrap disabled:opacity-50"
                                    >
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                                            {(() => {
                                                const sel = aiProviders.find(m => String(m.id) === String(selectedModel));
                                                if (!sel) return 'Select Model';
                                                const modelInfo = (AI_MODELS[sel.code] ?? []).find(
                                                    (item) => item.value === sel.model || item.label === sel.model,
                                                );
                                                return modelInfo?.label || sel.model || 'Select Model';
                                            })()}
                                        </span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 ml-0.5">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {showModelMenu && !loading && (
                                        <AnimatePresence>
                                            <div className="fixed inset-0 z-[60]" onClick={() => setShowModelMenu(false)} />
                                            <motion.div
                                                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                                className="absolute bottom-full mb-2 left-0 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-[70] w-[300px] p-2 flex flex-col gap-1 max-h-[400px] overflow-y-auto"
                                            >
                                                <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                                                    Select AI Model
                                                </div>
                                                {aiProviders.map((m) => {
                                                    const isSelected = String(m.id) === String(selectedModel);
                                                    const mapped = AI_CODE_MAP[m.code] ?? { label: m.code, icon: <AutoIcon /> };
                                                    const modelInfo = (AI_MODELS[m.code] ?? []).find(
                                                        (item) => item.value === m.model || item.label === m.model,
                                                    );
                                                    const displayName = modelInfo?.label || m.model;
                                                    const displayDesc = modelInfo?.desc || 'Advanced AI Model';

                                                    return (
                                                        <button
                                                            key={m.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedModel(String(m.id))
                                                                setShowModelMenu(false)
                                                            }}
                                                            className={`w-full text-left flex items-center justify-between px-3 py-3 rounded-xl outline-none transition-colors ${isSelected ? 'bg-blue-50 dark:bg-[#25324A] text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#25324A]'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-shrink-0 opacity-80 w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                                                                    {mapped.icon}
                                                                </div>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className={`text-[14px] font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                                                        {displayName}
                                                                    </span>
                                                                    <span className="text-[12px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                                        {displayDesc}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="flex-shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-blue-500 text-white">
                                                                    <Check className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>

                            <div className="pr-1 flex gap-2">
                                <button
                                    type="submit"
                                    disabled={!canSend}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${loading ? 'bg-black dark:bg-white text-white dark:text-black cursor-not-allowed' : canSend ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105' : 'bg-[#eeedeb] dark:bg-black/20 text-gray-400 dark:text-[#555]'}`}
                                >
                                    {loading ? <Spinner /> : <ArrowUp className="w-[18px] h-[18px]" />}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="py-2 text-center">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            Pintaraja AI Image Generator memproses gambar dalam hitungan detik.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
