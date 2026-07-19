import type { DeviceType } from '@/types/database';

/**
 * Heurística de detecção de dispositivo via User-Agent.
 *
 * LIMITAÇÃO HONESTA: não existe uma API padrão e confiável no navegador
 * para "sei com certeza que estou rodando dentro do Android Auto" ou
 * "sei com certeza que sou uma Smart TV" — cada fabricante expõe pistas
 * diferentes (ou nenhuma) no User-Agent. Esta função cobre os padrões mais
 * comuns hoje (Tizen/webOS/Google TV/Fire TV para TVs; substring
 * "Android Auto" nos head units mais recentes), mas pode não identificar
 * 100% dos aparelhos. O app funciona normalmente mesmo quando a detecção
 * falha — ela só liga otimizações extras (fonte maior, foco por controle
 * remoto, áudio forçado), nunca é pré-requisito para o uso básico.
 */
export function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;

  if (/Android Auto/i.test(ua)) return 'android_auto';

  if (/Tizen|Web0S|WebOS|GoogleTV|Google TV|SmartTV|SMART-TV|AFTB|AFTT|AFTS|CrKey/i.test(ua)) {
    return 'smart_tv';
  }

  if (window.matchMedia?.('(display-mode: standalone)').matches) return 'pwa';

  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';

  return 'web';
}

export function isTvLikeDevice(type: DeviceType): boolean {
  return type === 'smart_tv';
}
