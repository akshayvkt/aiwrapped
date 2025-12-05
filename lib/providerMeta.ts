import type { AiProvider } from './types';

interface ProviderTheme {
  id: AiProvider;
  label: string;
  possessive: string;
  gradient: string;
  accentText: string;
  accentHoverText: string;
  shareButtonBg: string;
  shareButtonHover: string;
  downloadPrefix: string;
}

const PROVIDER_THEMES: Record<AiProvider, ProviderTheme> = {
  claude: {
    id: 'claude',
    label: 'Claude',
    possessive: "Claude's",
    gradient: 'from-orange-400 via-pink-400 to-yellow-400',
    accentText: 'text-orange-400',
    accentHoverText: 'hover:text-orange-300',
    shareButtonBg: 'bg-orange-500',
    shareButtonHover: 'hover:bg-orange-400',
    downloadPrefix: 'claude-wrapped',
  },
  chatgpt: {
    id: 'chatgpt',
    label: 'ChatGPT',
    possessive: "ChatGPT's",
    gradient: 'from-emerald-400 via-teal-400 to-sky-400',
    accentText: 'text-emerald-400',
    accentHoverText: 'hover:text-emerald-300',
    shareButtonBg: 'bg-emerald-500',
    shareButtonHover: 'hover:bg-emerald-400',
    downloadPrefix: 'chatgpt-wrapped',
  },
};

export function providerLabel(provider: AiProvider): string {
  return PROVIDER_THEMES[provider]?.label ?? 'Claude';
}

export function providerPossessive(provider: AiProvider): string {
  return PROVIDER_THEMES[provider]?.possessive ?? "Claude's";
}

export function providerGradient(provider: AiProvider): string {
  return PROVIDER_THEMES[provider]?.gradient ?? PROVIDER_THEMES.claude.gradient;
}

export function providerAccentText(provider: AiProvider): string {
  return PROVIDER_THEMES[provider]?.accentText ?? PROVIDER_THEMES.claude.accentText;
}

export function providerAccentHover(provider: AiProvider): string {
  return PROVIDER_THEMES[provider]?.accentHoverText ?? PROVIDER_THEMES.claude.accentHoverText;
}

export function providerTheme(provider: AiProvider): ProviderTheme {
  return PROVIDER_THEMES[provider] ?? PROVIDER_THEMES.claude;
}
