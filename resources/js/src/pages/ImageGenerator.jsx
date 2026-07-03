import React, { useState } from 'react'
import { useSnackbar } from '@/context/SnackbarContext'
import { useQuota } from '@/hooks/useQuota'
import { request } from '@/utils/Http'
import { Loader2, Image as ImageIcon, Download } from 'lucide-react'

const IMAGE_MODELS = [
    { id: 'flux', name: 'Flux (Kualitas Realistis Tinggi)' },
    { id: 'turbo', name: 'Turbo (Super Cepat & Artistik)' },
    { id: 'midjourney', name: 'Gaya Midjourney' },
    { id: 'anime', name: 'Gaya Anime' },
]

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedModel, setSelectedModel] = useState('flux')
    
    const { showSnackbar } = useSnackbar()
    const { decrement, rollback } = useQuota()

    const generateImage = async (e) => {
        e.preventDefault()
        if (!prompt) return

        // Kode kuota menggunakan SETTING-GPT karena model ini menggunakan kuota utama AI (bisa disesuaikan di masa depan)
        const quotaCode = 'SETTING-GPT' 
        
        setLoading(true)
        setImageUrl('')
        decrement(quotaCode)

        try {
            const response = await request('/generate-image', {
                method: 'POST',
                body: { prompt, model: selectedModel }
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

    return (
        <div className="flex flex-col h-[100vh] bg-[#f7f7f5] dark:bg-[#0f141e] transition-colors duration-300 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto p-6 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-700/50 p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <ImageIcon className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Image Generator</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Pilih gaya model AI dan tuliskan imajinasi Anda, biarkan AI yang menggambarnya.
                    </p>

                    <form onSubmit={generateImage} className="space-y-6">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Pilih Model AI Gambar
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                disabled={loading}
                                className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
                            >
                                {IMAGE_MODELS.map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Deskripsi Gambar (Prompt)
                            </label>
                            <textarea
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[140px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors resize-none"
                                placeholder="Contoh: Seekor kucing astronot sedang makan pizza di bulan dengan gaya cyberpunk..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !prompt}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Sedang Membuat (Mungkin memakan waktu 10-20 detik)...</span>
                                </>
                            ) : (
                                <span>✨ Generate Gambar Sekarang</span>
                            )}
                        </button>
                    </form>

                    {imageUrl && (
                        <div className="mt-10 p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 w-full text-left">Hasil Generate:</h3>
                            <div className="relative group w-full max-w-2xl rounded-2xl overflow-hidden shadow-lg mb-8 bg-gray-200 dark:bg-gray-800 aspect-square flex items-center justify-center">
                                <img src={imageUrl} alt={prompt} className="w-full h-full object-contain" />
                            </div>
                            <a
                                href={imageUrl}
                                download={`ai-image-${selectedModel}-${Date.now()}.png`}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Download className="w-5 h-5" />
                                Download Gambar (Resolusi Penuh)
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
