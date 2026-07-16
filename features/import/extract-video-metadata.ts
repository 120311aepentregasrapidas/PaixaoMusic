/**
 * Extração de metadados técnicos no navegador.
 *
 * Usa a própria tag <video> do navegador para ler duração/resolução direto
 * do arquivo, SEM precisar enviar nada para o servidor primeiro — é rápido
 * e funciona para qualquer MP4/MKV/MOV suportado pelo navegador.
 *
 * IMPORTANTE — limitação conhecida: o navegador não expõe codec, bitrate
 * ou fps exatos via APIs padrão (isso exigiria decodificar o container do
 * arquivo, ex. com mediainfo.js/ffprobe rodando no servidor). Por isso esses
 * três campos ficam `null` neste MVP — as colunas existem no banco
 * (`videos.video_codec`, `videos.audio_codec`, `videos.fps`) e podem ser
 * preenchidas depois por um worker de servidor que rode ffprobe, sem
 * precisar mudar nada na importação em si.
 */
export interface TechnicalMetadata {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  fileSizeBytes: number;
}

export function extractVideoMetadata(file: File): Promise<TechnicalMetadata> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(url);
      videoEl.remove();
    };

    const timeout = setTimeout(() => {
      // Arquivo corrompido ou formato não suportado pelo navegador — não trava a importação
      cleanup();
      resolve({ durationSeconds: null, width: null, height: null, fileSizeBytes: file.size });
    }, 8000);

    videoEl.onloadedmetadata = () => {
      clearTimeout(timeout);
      const result: TechnicalMetadata = {
        durationSeconds: Number.isFinite(videoEl.duration) ? videoEl.duration : null,
        width: videoEl.videoWidth || null,
        height: videoEl.videoHeight || null,
        fileSizeBytes: file.size,
      };
      cleanup();
      resolve(result);
    };

    videoEl.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve({ durationSeconds: null, width: null, height: null, fileSizeBytes: file.size });
    };

    videoEl.src = url;
  });
}

/** Calcula um checksum leve (não-criptográfico) só para detectar duplicidade básica por tamanho+nome */
export function buildQuickFingerprint(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}
