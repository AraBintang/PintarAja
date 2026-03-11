import {
  BookOpen,
  Crown,
  FileCode,
  HardDrive,
  Mail,
  Search,
  Sparkles,
  Video,
  Youtube,
} from 'lucide-react'
import { createContext, useContext, useState } from 'react'

const PlanContext = createContext()

export const usePlans = () => {
  return useContext(PlanContext)
}

export const PlanProvider = ({ children }) => {
  // Initial mock data mapped from the provided reference image
  const defaultPlans = [
    {
      id: 1,
      name: 'Google AI Plus',
      description:
        'Dapatkan akses lebih tinggi ke fitur baru dan canggih untuk meningkatkan produktivitas dan kreativitas',
      price: { weekly: 18750, monthly: 75000, yearly: 900000 },
      discountedPrice: { weekly: 9375, monthly: 37500, yearly: 450000 },
      billingText: 'Selama 6 bulan, lalu Rp 75.000/bulan',
      buttonText: 'Dapatkan Google AI Plus',
      isPopular: false,
      features: [
        {
          icon: <Sparkles className="w-5 h-5 text-gray-700" />,
          title: 'Aplikasi Gemini',
          desc: 'Dapatkan akses tingkat lanjut ke model 3.1 Pro kami yang paling canggih, Deep Research di 3.1 Pro, pembuatan gambar dengan Nano Banana Pro, dan fitur pembuatan video dengan akses terbatas ke Veo 3.1',
          isIncluded: true,
        },
        {
          icon: <Video className="w-5 h-5 text-gray-700" />,
          title: 'Flow',
          desc: 'Alat pembuatan film berteknologi AI kami untuk membuat adegan dan cerita sinematik, termasuk akses terbatas ke Veo 3.1',
          isIncluded: true,
        },
        {
          icon: <Sparkles className="w-5 h-5 text-gray-700" />,
          title: 'Whisk',
          desc: 'Akses tingkat lanjut ke fitur pembuatan video dari gambar dengan Veo 3',
          isIncluded: true,
        },
        {
          icon: <Crown className="w-5 h-5 text-gray-700" />,
          title: '200 kredit AI bulanan',
          desc: 'Poin AI dapat digunakan untuk meningkatkan akses ke fitur AI Google tingkat lanjut',
          isIncluded: true,
        },
        {
          icon: <Search className="w-5 h-5 text-gray-700" />,
          title: 'Google Penelusuran',
          desc: 'Dapatkan akses lebih luas ke model Gemini 3 Pro, dan lainnya',
          isIncluded: true,
        },
        {
          icon: <BookOpen className="w-5 h-5 text-gray-700" />,
          title: 'NotebookLM',
          desc: 'Lebih banyak akses ke partner riset kami dengan Ringkasan Audio & Video, Kuis, dan lainnya',
          isIncluded: true,
        },
        {
          icon: <Mail className="w-5 h-5 text-gray-700" />,
          title: 'Gemini di Gmail, Kalender & Meet',
          desc: 'Akses Gemini langsung di aplikasi Google',
          isIncluded: true,
        },
        {
          icon: <HardDrive className="w-5 h-5 text-gray-700" />,
          title: 'Penyimpanan',
          desc: 'Total penyimpanan sebesar 200 GB untuk Google Foto, Drive, dan Gmail',
          isIncluded: true,
        },
      ],
    },
    {
      id: 2,
      name: 'Google AI Pro',
      description:
        'Dapatkan akses lebih tinggi ke fitur baru dan canggih untuk meningkatkan produktivitas dan kreativitas',
      price: { weekly: 77250, monthly: 309000, yearly: 3708000 },
      discountedPrice: { weekly: 0, monthly: 0, yearly: 0 },
      billingText: 'Selama 1 bulan, lalu Rp 309.000/bulan',
      buttonText: 'Dapatkan Google AI Pro',
      isPopular: true,
      features: [
        {
          icon: <Sparkles className="w-5 h-5 text-gray-700" />,
          title: 'Aplikasi Gemini',
          desc: 'Dapatkan akses lebih tinggi ke model 3.1 Pro kami yang paling canggih, Deep Research di 3.1 Pro, pembuatan gambar dengan Nano Banana Pro, dan fitur pembuatan video dengan akses terbatas ke Veo 3.1',
          isIncluded: true,
        },
        {
          icon: <Video className="w-5 h-5 text-gray-700" />,
          title: 'Flow',
          desc: 'Dapatkan akses lebih tinggi ke alat Pembuatan Film Berteknologi AI kami untuk membuat adegan dan cerita sinematik dengan Veo 3.1',
          isIncluded: true,
        },
        {
          icon: <Sparkles className="w-5 h-5 text-gray-700" />,
          title: 'Whisk',
          desc: 'Akses lebih tinggi ke fitur pembuatan video dari gambar dengan Veo 3',
          isIncluded: true,
        },
        {
          icon: <Crown className="w-5 h-5 text-gray-700" />,
          title: '1.000 kredit AI bulanan',
          desc: 'Poin AI dapat digunakan untuk meningkatkan akses ke fitur AI Google tingkat lanjut',
          isIncluded: true,
        },
        {
          icon: <Search className="w-5 h-5 text-gray-700" />,
          title: 'Google Penelusuran',
          desc: 'Akses lebih tinggi ke model Gemini 3 Pro, dan lainnya',
          isIncluded: true,
        },
        {
          icon: <BookOpen className="w-5 h-5 text-gray-700" />,
          title: 'NotebookLM',
          desc: 'Akses lebih tinggi ke partner riset kami dengan Ringkasan Audio & Video, Kuis, dan lainnya',
          isIncluded: true,
        },
        {
          icon: <Mail className="w-5 h-5 text-gray-700" />,
          title: 'Gemini di Gmail, Dokumen, Vids, dan lainnya',
          desc: 'Akses Gemini langsung di aplikasi Google',
          isIncluded: true,
        },
        {
          icon: <Sparkles className="w-5 h-5 text-gray-700" />,
          title: 'Google Antigravity',
          desc: 'Batas tarif yang lebih tinggi untuk model agen di Google Antigravity, platform pengembangan agentic kami',
          isIncluded: true,
        },
        {
          icon: <FileCode className="w-5 h-5 text-gray-700" />,
          title: 'Google Developer Program premium',
          desc: 'Bangun, pelajari, dan kembangkan aplikasi dengan lebih cepat sebagai developer dengan batas yang lebih tinggi untuk Gemini CLI, Gemini Code Assist, Jules, kredit Cloud, dan lainnya',
          isIncluded: true,
        },
        {
          icon: <HardDrive className="w-5 h-5 text-gray-700" />,
          title: 'Penyimpanan',
          desc: 'Total penyimpanan sebesar 2 TB untuk Google Foto, Drive, dan Gmail',
          isIncluded: true,
        },
      ],
    },
    {
      id: 3,
      name: 'Google AI Ultra',
      description:
        'Dapatkan akses tingkat tertinggi ke kemampuan terbaik AI Google dan fitur eksklusif',
      price: { weekly: 482250, monthly: 3849000, yearly: 46188000 },
      discountedPrice: { weekly: 241125, monthly: 1929000, yearly: 23148000 },
      billingText: 'Selama 3 bulan, lalu Rp 3.849.000/bulan',
      buttonText: 'Dapatkan Google AI Ultra',
      isPopular: false,
      features: [
        {
          icon: <Sparkles className="w-5 h-5 text-gray-700" />,
          title: 'Aplikasi Gemini',
          desc: 'Batas tertinggi pada fitur dan model, serta akses ke Deep Think dan Veo 3.1 (model pembuatan video terbaru)',
          isIncluded: true,
        },
        {
          icon: <Video className="w-5 h-5 text-gray-700" />,
          title: 'Flow',
          desc: 'Batas tertinggi pada alat Pembuatan Film Berteknologi AI dengan akses ke Veo 3.1',
          isIncluded: true,
        },
        {
          icon: <Sparkles className="w-5 h-5 text-gray-700" />,
          title: 'Whisk',
          desc: 'Batas tertinggi untuk fitur pembuatan video dari gambar dengan Veo 3',
          isIncluded: true,
        },
        {
          icon: <Crown className="w-5 h-5 text-gray-700" />,
          title: '25.000 kredit AI bulanan',
          desc: 'Poin AI dapat digunakan untuk meningkatkan akses ke fitur AI Google tingkat lanjut',
          isIncluded: true,
        },
        {
          icon: <Search className="w-5 h-5 text-gray-700" />,
          title: 'Google Penelusuran',
          desc: 'Akses tertinggi ke model Gemini 3 Pro, dan lainnya',
          isIncluded: true,
        },
        {
          icon: <BookOpen className="w-5 h-5 text-gray-700" />,
          title: 'NotebookLM',
          desc: 'Akses tertinggi ke partner riset kami dengan Ringkasan Audio & Video, Kuis, dan lainnya',
          isIncluded: true,
        },
        {
          icon: <Mail className="w-5 h-5 text-gray-700" />,
          title: 'Gemini di Gmail, Dokumen, Vids, dan lainnya',
          desc: 'Batas tertinggi pada Gemini langsung di berbagai aplikasi Google',
          isIncluded: true,
        },
        {
          icon: <Youtube className="w-5 h-5 text-gray-700" />,
          title: 'Paket perorangan YouTube Premium',
          desc: 'Tayangan bebas iklan di YouTube, secara offline, dan di latar belakang',
          isIncluded: true,
        },
        {
          icon: <Sparkles className="w-5 h-5 text-gray-700" />,
          title: 'Google Antigravity',
          desc: 'Batas tarif tertinggi untuk model agen di Google Antigravity, platform pengembangan agentic kami',
          isIncluded: true,
        },
        {
          icon: <FileCode className="w-5 h-5 text-gray-700" />,
          title: 'Google Developer Program premium',
          desc: 'Bangun, pelajari, dan kembangkan aplikasi dengan lebih cepat sebagai developer dengan batas tertinggi untuk Gemini CLI, Gemini Code Assist, Jules, kredit Cloud, dan lainnya',
          isIncluded: true,
        },
        {
          icon: <HardDrive className="w-5 h-5 text-gray-700" />,
          title: 'Penyimpanan',
          desc: 'Total penyimpanan sebesar 30 TB untuk Google Foto, Drive, dan Gmail',
          isIncluded: true,
        },
      ],
    },
  ]

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('pintaraja_plans')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge parsed data with default plans to retain JSX icons
        return parsed.map((p, idx) => ({
          ...p,
          features: p.features.map((f, fIdx) => ({
            ...f,
            icon: defaultPlans[idx]?.features[fIdx]?.icon || (
              <Sparkles className="w-5 h-5 text-gray-700" />
            ),
          })),
        }))
      } catch (e) {
        console.error('Failed to parse plans from local storage', e)
      }
    }
    return defaultPlans
  })

  const updatePlan = (id, updatedPlan) => {
    const newPlans = plans.map((p) => (p.id === id ? { ...p, ...updatedPlan } : p))
    setPlans(newPlans)

    // Save to local storage without JSX icons to prevent Stringify circular errors
    const serializablePlans = newPlans.map((p) => ({
      ...p,
      features: p.features.map((f) => {
        const { ...rest } = f
        return rest
      }),
    }))
    localStorage.setItem('pintaraja_plans', JSON.stringify(serializablePlans))
  }

  return <PlanContext.Provider value={{ plans, updatePlan }}>{children}</PlanContext.Provider>
}
