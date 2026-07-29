import { Zap, Wand2 } from 'lucide-react'
import { createElement } from 'react'

import claudeAiIcon from '@/assets/icons/claude-ai-icon.svg'
import deepseekAiIcon from '@/assets/icons/deepseek-ai-icon.svg'
import googleGeminiIcon from '@/assets/icons/google-gemini-icon.svg'
import gptAiIcon from '@/assets/icons/gpt-ai-icon.svg'
import grokAiIcon from '@/assets/icons/grok-ai-icon.svg'
import qwenAiIcon from '@/assets/icons/qwen-ai-icon.svg'

export const AutoIcon = () => createElement(Zap, { className: 'w-3.5 h-3.5 text-amber-500' })

const OpenAILogo = createElement('img', {
  src: gptAiIcon,
  alt: 'GPT',
  className: 'w-3.5 h-3.5 object-contain dark:invert',
})

const GeminiLogo = createElement('img', {
  src: googleGeminiIcon,
  alt: 'Gemini',
  className: 'w-3.5 h-3.5 object-contain',
})

const ClaudeLogo = createElement('img', {
  src: claudeAiIcon,
  alt: 'Claude',
  className: 'w-3.5 h-3.5 object-contain',
})

const GrokLogo = createElement('img', {
  src: grokAiIcon,
  alt: 'Grok',
  className: 'w-3.5 h-3.5 object-contain dark:invert',
})

const DeepSeekLogo = createElement('img', {
  src: deepseekAiIcon,
  alt: 'DeepSeek',
  className: 'w-3.5 h-3.5 object-contain',
})

const QwenLogo = createElement('img', {
  src: qwenAiIcon,
  alt: 'Qwen',
  className: 'w-3.5 h-3.5 object-contain',
})

const DreaminaLogo = () => createElement(Wand2, { className: 'w-3.5 h-3.5 text-blue-500' })

export const AI_CODE_MAP = {
  'SETTING-GPT': { label: 'ChatGPT', icon: OpenAILogo },
  'SETTING-GMN': { label: 'Gemini', icon: GeminiLogo },
  'SETTING-CLD': { label: 'Claude', icon: ClaudeLogo },
  'SETTING-XAI': { label: 'Grok', icon: GrokLogo },
  'SETTING-DSK': { label: 'DeepSeek', icon: DeepSeekLogo },
  'SETTING-QWN': { label: 'Qwen', icon: QwenLogo },
  'SETTING-DRM': { label: 'Dreamina', icon: DreaminaLogo },
}

export const AI_MODELS = {
  'SETTING-GPT': [
    {
      value: 'gpt-5.6-sol',
      label: 'GPT-5.6 Sol',
      desc: 'Latest GPT-5.6 Sol model',
    },
    {
      value: 'gpt-5.6-tera',
      label: 'GPT-5.6 Tera',
      desc: 'Latest GPT-5.6 Tera model',
    },
    {
      value: 'gpt-5.6-luna',
      label: 'GPT-5.6 Luna',
      desc: 'Latest GPT-5.6 Luna model',
    },
    {
      value: 'gpt-5',
      label: 'GPT-5',
      desc: 'Most powerful OpenAI model, frontier intelligence & reasoning',
    },
    {
      value: 'gpt-5-nano',
      label: 'GPT-5-nano',
      desc: 'Fastest, most cost-efficient version of GPT-5',
    },
    {
      value: 'gpt-4.1',
      label: 'GPT-4.1',
      desc: 'Flagship model, best for complex tasks & coding',
    },
    {
      value: 'gpt-4.1-mini',
      label: 'GPT-4.1 Mini',
      desc: 'Fast & affordable, great for everyday tasks',
    },
    {
      value: 'gpt-4.1-nano',
      label: 'GPT-4.1 Nano',
      desc: 'Ultra-fast, cheapest, ideal for simple Q&A',
    },
    {
      value: 'gpt-4o',
      label: 'GPT-4o',
      desc: 'Multimodal flagship — text, vision & audio',
    },
    {
      value: 'gpt-4o-mini',
      label: 'GPT-4o Mini',
      desc: 'Lightweight 4o, cost-efficient multimodal',
    },
    {
      value: 'o4-mini',
      label: 'o4 Mini',
      desc: 'Fast reasoning model, great for coding & STEM',
    },
    {
      value: 'o1',
      label: 'o1',
      desc: 'Advanced reasoning for math, science & complex logic',
    },
  ],

  'SETTING-GMN': [
    {
      value: 'models/gemini-3.5-flash',
      label: 'Gemini 3.5 Flash',
      desc: 'Latest generation, best overall speed & quality balance',
    },
    {
      value: 'models/gemini-3.1-pro-preview',
      label: 'Gemini 3.1 Pro Preview',
      desc: 'Advanced reasoning with custom tools support',
    },
    {
      value: 'models/gemini-3.1-flash-lite',
      label: 'Gemini 3.1 Flash Lite',
      desc: 'Lightweight 3.1, fast & cost-efficient at scale',
    },
    {
      value: 'models/gemini-3-pro-preview',
      label: 'Gemini 3 Pro Preview',
      desc: 'Powerful multimodal reasoning, preview release',
    },
    {
      value: 'models/gemini-3-flash-preview',
      label: 'Gemini 3 Flash Preview',
      desc: 'Fast gen-3 model, great for real-time tasks',
    },
    {
      value: 'models/gemini-2.5-pro',
      label: 'Gemini 2.5 Pro',
      desc: 'Deep reasoning, 1M context window',
    },
    {
      value: 'models/gemini-2.5-flash',
      label: 'Gemini 2.5 Flash',
      desc: 'Best price-performance with thinking mode',
    },
    {
      value: 'models/gemini-2.5-flash-lite',
      label: 'Gemini 2.5 Flash-Lite',
      desc: 'Ultra cost-efficient, high-volume tasks',
    },
  ],

  'SETTING-CLD': [
    {
      value: 'claude-5.0',
      label: 'Claude 5.0',
      desc: 'Latest Claude 5.0 generation model',
    },
    {
      value: 'claude-4.8',
      label: 'Claude Opus 4.8',
      desc: 'Latest Claude Opus 4.8 generation model',
    },
    {
      value: 'claude-sonnet-5',
      label: 'Claude Sonnet 5',
      desc: 'Next generation Sonnet model',
    },
    {
      value: 'claude-sonnet-4-6',
      label: 'Claude Sonnet 4.6',
      desc: 'Latest Sonnet, best balance of speed & intelligence',
    },
    {
      value: 'claude-opus-4-6',
      label: 'Claude Opus 4.6',
      desc: 'Most powerful Claude, complex analysis & writing',
    },
    {
      value: 'claude-opus-4-5-20251101',
      label: 'Claude Opus 4.5',
      desc: 'High capability, strong reasoning & research',
    },
    {
      value: 'claude-sonnet-4-5-20250929',
      label: 'Claude Sonnet 4.5',
      desc: 'Fast & smart, ideal for coding & data analysis',
    },
    {
      value: 'claude-haiku-4-5-20251001',
      label: 'Claude Haiku 4.5',
      desc: 'Fastest Claude, near-instant responses',
    },
    {
      value: 'claude-fable-5',
      label: 'Claude Fable',
      desc: 'Latest Claude Fable model',
    },
  ],

  'SETTING-XAI': [
    {
      value: 'grok-4.5',
      label: 'Grok 4.5',
      desc: 'Latest Grok 4.5 model',
    },
    {
      value: 'grok-4.20-0309-reasoning',
      label: 'Grok 4.20 Reasoning',
      desc: 'Latest Grok, deep thinking & complex problem solving',
    },
    {
      value: 'grok-4.20-0309-non-reasoning',
      label: 'Grok 4.20',
      desc: 'Latest Grok, fast response for everyday tasks',
    },
    {
      value: 'grok-4.20-multi-agent-0309',
      label: 'Grok 4.20 Multi-Agent',
      desc: 'Optimized for multi-agent pipelines & orchestration',
    },
    {
      value: 'grok-code-fast-1',
      label: 'Grok Code Fast',
      desc: 'Specialized for coding tasks with fast response',
    },
    {
      value: 'grok-imagine-image-pro',
      label: 'Grok Imagine Pro',
      desc: 'Highest quality image generation by xAI',
    },
  ],

  'SETTING-DSK': [
    {
      value: 'deepseek-chat',
      label: 'DeepSeek V3',
      desc: 'Flagship chat model, strong reasoning & coding',
    },
    {
      value: 'deepseek-reasoner',
      label: 'DeepSeek R1',
      desc: 'Advanced chain-of-thought reasoning model',
    },
  ],

  'SETTING-QWN': [
    {
      value: 'qwen3.5-plus',
      label: 'Qwen3.5 Plus',
      desc: 'Latest flagship Qwen, powerful multilingual reasoning',
    },
    {
      value: 'qwen3.5-flash',
      label: 'Qwen3.5 Flash',
      desc: 'Fast & efficient, great for everyday multilingual tasks',
    },
    {
      value: 'qwen-max',
      label: 'Qwen Max',
      desc: 'Most capable Qwen, complex multilingual tasks',
    },
    {
      value: 'qwen-plus',
      label: 'Qwen Plus',
      desc: 'Balanced performance & cost efficiency',
    },
    {
      value: 'qwen-turbo',
      label: 'Qwen Turbo',
      desc: 'Ultra-fast, cost-efficient responses',
    },
    {
      value: 'qwq-plus',
      label: 'QwQ Plus',
      desc: 'Deep reasoning & mathematical thinking',
    },
    {
      value: 'qwen3-coder-plus',
      label: 'Qwen3 Coder Plus',
      desc: 'Specialized coding model, best for dev tasks',
    },
  ],
  'SETTING-DRM': [
    {
      value: 'dreamina-4-0',
      label: 'Dreamina 4.0',
      desc: 'ByteDance Dreamina Advanced AI Model',
    },
  ],
}

// Documentation links per AI provider
export const AI_DOC_CONFIG = {
  'SETTING-GPT': {
    label: 'OpenAI Model Docs',
    url: 'https://platform.openai.com/docs/models',
    color:
      'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50',
    iconColor: 'text-emerald-500',
  },
  'SETTING-GMN': {
    label: 'Google Gemini Model Docs',
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini',
    color: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50',
    iconColor: 'text-blue-500',
  },
  'SETTING-CLD': {
    label: 'Anthropic Claude Model Docs',
    url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
    color: 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700/50',
    iconColor: 'text-orange-500',
  },
  'SETTING-XAI': {
    label: 'xAI Grok Model Docs',
    url: 'https://docs.x.ai/docs/models',
    color: 'text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700/50',
    iconColor: 'text-sky-500',
  },
  'SETTING-DSK': {
    label: 'DeepSeek Model Docs',
    url: 'https://api-docs.deepseek.com/quick_start/pricing',
    color: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700/50',
    iconColor: 'text-indigo-500',
  },
  'SETTING-QWN': {
    label: 'Qwen Model Docs',
    url: 'https://qwen.readthedocs.io/en/latest/',
    color: 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/50',
    iconColor: 'text-purple-500',
  },
  'SETTING-DRM': {
    label: 'Dreamina Model Docs',
    url: 'https://www.volcengine.com/docs',
    color: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50',
    iconColor: 'text-blue-500',
  },
}
