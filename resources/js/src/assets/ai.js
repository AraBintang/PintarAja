import { Zap } from 'lucide-react'
import { createElement } from 'react'

import claudeAiIcon from '@/assets/icons/claude-ai-icon.svg'
import deepseekAiIcon from '@/assets/icons/deepseek-ai-icon.svg'
import googleGeminiIcon from '@/assets/icons/google-gemini-icon.svg'
import gptAiIcon from '@/assets/icons/gpt-ai-icon.svg'
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

export const AI_CODE_MAP = {
  'SETTING-GPT': { label: 'ChatGPT', icon: OpenAILogo },
  'SETTING-GMN': { label: 'Gemini', icon: GeminiLogo },
  'SETTING-CLD': { label: 'Claude', icon: ClaudeLogo },
  'SETTING-DSK': { label: 'DeepSeek', icon: DeepSeekLogo },
  'SETTING-QWN': { label: 'Qwen', icon: QwenLogo },
}

export const AI_MODELS = {
  'SETTING-GPT': [
    { value: 'gpt-4.1', label: 'GPT-4.1', desc: 'Most capable, best for complex tasks & coding' },
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
    { value: 'gpt-4o', label: 'GPT-4o', desc: 'Multimodal flagship — text, vision & audio' },
    {
      value: 'gpt-4o-mini',
      label: 'GPT-4o Mini',
      desc: 'Lightweight 4o, cost-efficient multimodal',
    },
    { value: 'o3', label: 'o3', desc: 'Advanced reasoning for math & science' },
    { value: 'o4-mini', label: 'o4 Mini', desc: 'Fast reasoning model, great for coding & STEM' },
  ],
  'SETTING-GMN': [
    {
      value: 'gemini-2.5-pro-preview-05-06',
      label: 'Gemini 2.5 Pro',
      desc: 'Most intelligent Gemini, deep reasoning',
    },
    {
      value: 'gemini-2.5-flash-preview-04-17',
      label: 'Gemini 2.5 Flash',
      desc: 'Best price-performance with thinking mode',
    },
    {
      value: 'gemini-2.0-flash',
      label: 'Gemini 2.0 Flash',
      desc: 'Next-gen speed, real-time multimodal',
    },
    {
      value: 'gemini-2.0-flash-lite',
      label: 'Gemini 2.0 Flash-Lite',
      desc: 'Most cost-efficient for high-volume tasks',
    },
    {
      value: 'gemini-1.5-pro',
      label: 'Gemini 1.5 Pro',
      desc: '2M token context, complex reasoning',
    },
    {
      value: 'gemini-1.5-flash',
      label: 'Gemini 1.5 Flash',
      desc: 'Versatile & fast, long context support',
    },
    {
      value: 'gemini-1.5-flash-8b',
      label: 'Gemini 1.5 Flash-8B',
      desc: 'Lightweight, best for high-frequency use',
    },
  ],
  'SETTING-CLD': [
    {
      value: 'claude-opus-4-5',
      label: 'Claude Opus 4.5',
      desc: 'Most powerful, complex analysis & writing',
    },
    {
      value: 'claude-sonnet-4-5',
      label: 'Claude Sonnet 4.5',
      desc: 'Best balance of speed and intelligence',
    },
    {
      value: 'claude-haiku-4-5',
      label: 'Claude Haiku 4.5',
      desc: 'Fastest & compact, near-instant responses',
    },
    {
      value: 'claude-opus-4-0',
      label: 'Claude Opus 4',
      desc: 'Exceptional for research & reasoning',
    },
    {
      value: 'claude-sonnet-4-0',
      label: 'Claude Sonnet 4',
      desc: 'High performance, coding & data analysis',
    },
    {
      value: 'claude-3-7-sonnet-latest',
      label: 'Claude Sonnet 3.7',
      desc: 'Extended thinking, frontier intelligence',
    },
    {
      value: 'claude-3-5-haiku-latest',
      label: 'Claude Haiku 3.5',
      desc: 'Fast & affordable for simple workflows',
    },
  ],
  'SETTING-DSK': [
    {
      value: 'deepseek-chat',
      label: 'DeepSeek V3',
      desc: 'Flagship chat model with strong reasoning',
    },
    {
      value: 'deepseek-reasoner',
      label: 'DeepSeek R1',
      desc: 'Advanced chain-of-thought reasoning model',
    },
  ],
  'SETTING-QWN': [
    { value: 'qwen-max', label: 'Qwen Max', desc: 'Most capable Qwen, complex multilingual tasks' },
    { value: 'qwen-plus', label: 'Qwen Plus', desc: 'Balanced performance & cost efficiency' },
    { value: 'qwen-turbo', label: 'Qwen Turbo', desc: 'Ultra-fast, cost-efficient responses' },
    { value: 'qwen-long', label: 'Qwen Long', desc: 'Extra-long context, ideal for documents' },
    { value: 'qwq-plus', label: 'QwQ Plus', desc: 'Deep reasoning & mathematical thinking' },
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
  'SETTING-DSK': {
    label: 'DeepSeek Model Docs',
    url: 'https://api-docs.deepseek.com/quick_start/pricing',
    color: 'text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700/50',
    iconColor: 'text-sky-500',
  },
  'SETTING-QWN': {
    label: 'Qwen Model Docs',
    url: 'https://qwen.readthedocs.io/en/latest/',
    color: 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/50',
    iconColor: 'text-purple-500',
  },
}
