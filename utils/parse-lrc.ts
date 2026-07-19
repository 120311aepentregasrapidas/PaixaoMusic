export interface LyricLine {
  timeSeconds: number;
  text: string;
}

/**
 * Parser de formato LRC — o padrão de letras sincronizadas usado por
 * players de música (linhas como "[01:23.45]Trecho da letra").
 *
 * `songs.lyrics_lrc` guarda o conteúdo bruto do arquivo .lrc. Este parser
 * não faz nenhuma chamada de rede — é só interpretação de texto, então
 * roda tanto no servidor quanto no cliente.
 */
export function parseLrc(raw: string): LyricLine[] {
  const lines = raw.split(/\r?\n/);
  const result: LyricLine[] = [];

  const timeTag = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const line of lines) {
    const matches = [...line.matchAll(timeTag)];
    if (matches.length === 0) continue;

    const text = line.replace(timeTag, '').trim();
    if (!text) continue;

    for (const match of matches) {
      const minutes = Number(match[1] ?? 0);
      const seconds = Number(match[2] ?? 0);
      const fraction = match[3] ? Number(`0.${match[3]}`) : 0;
      result.push({ timeSeconds: minutes * 60 + seconds + fraction, text });
    }
  }

  return result.sort((a, b) => a.timeSeconds - b.timeSeconds);
}

/** Encontra o índice da linha ativa para um dado momento de reprodução */
export function findActiveLyricIndex(lines: LyricLine[], currentSeconds: number): number {
  let activeIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line && line.timeSeconds <= currentSeconds) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
}
