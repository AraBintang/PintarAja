import { Zap } from 'lucide-react'

export const AutoIcon = () => <Zap className="w-4 h-4 text-amber-500" />

const OpenAILogo = () => (
  <img src="/gpt-ai-icon.svg" alt="GPT" className="w-3.5 h-3.5 object-contain" />
)
const GeminiLogo = () => (
  <img src="/google-gemini-icon.svg" alt="Gemini" className="w-3.5 h-3.5 object-contain" />
)
const ClaudeLogo = () => (
  <img src="/claude-ai-icon.svg" alt="Claude" className="w-3.5 h-3.5 object-contain" />
)
const DeepSeekLogo = () => (
  <img src="/deepseek-ai-icon.svg" alt="DeepSeek" className="w-3.5 h-3.5 object-contain" />
)
const QwenLogo = () => (
  <img src="/qwen-ai-icon.svg" alt="Qwen" className="w-3.5 h-3.5 object-contain" />
)

export const AI_CODE_MAP = {
  'SETTING-GPT': { label: 'ChatGPT', icon: <OpenAILogo /> },
  'SETTING-GMN': { label: 'Gemini', icon: <GeminiLogo /> },
  'SETTING-CLD': { label: 'Claude', icon: <ClaudeLogo /> },
  'SETTING-DSK': { label: 'DeepSeek', icon: <DeepSeekLogo /> },
  'SETTING-QWN': { label: 'Qwen', icon: <QwenLogo /> },
}
