/**
 * Storage Provider — camada de abstração de armazenamento de vídeos.
 *
 * Regra de ouro do projeto: NENHUMA parte do sistema (player, importador,
 * páginas, API routes) pode falar diretamente com Archive.org, R2, S3 etc.
 * Tudo passa por este contrato. Trocar de provedor = trocar a implementação
 * registrada em `lib/storage/index.ts`, sem tocar no resto do app.
 */

export type StorageProviderName =
  | 'archive_org'
  | 'cloudflare_r2'
  | 'backblaze_b2'
  | 's3'
  | 'self_hosted';

export interface UploadInput {
  /** Identificador lógico único do arquivo dentro da biblioteca (ex.: slug do artista/música) */
  key: string;
  /** Buffer ou stream do arquivo MP4 */
  file: Buffer | ReadableStream;
  /** Nome original do arquivo, para metadados do provider */
  filename: string;
  contentType: string;
  /** Metadados adicionais que o provider pode querer gravar (artista, álbum, ano...) */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  /** Chave/identificador que deve ser persistido em videos.storage_key */
  storageKey: string;
  /** URL pública (ou assinada) de acesso direto, se o provider já a fornecer */
  publicUrl?: string;
}

export interface StreamUrlOptions {
  /** Tempo de expiração da URL assinada, em segundos (quando aplicável) */
  expiresInSeconds?: number;
}

/**
 * Contrato que toda implementação de storage deve cumprir.
 */
export interface StorageProvider {
  readonly name: StorageProviderName;

  /** Envia um arquivo novo para o storage e retorna a chave de referência */
  upload(input: UploadInput): Promise<UploadResult>;

  /**
   * Retorna a URL de streaming direto do MP4 para uma dada storageKey.
   * Deve funcionar tanto para o <video> (modo vídeo) quanto para o modo
   * apenas-áudio (o mesmo arquivo é usado, o player apenas oculta o vídeo).
   */
  getStreamUrl(storageKey: string, options?: StreamUrlOptions): Promise<string>;

  /** Remove um arquivo do storage (usado em exclusões/reimportações) */
  delete(storageKey: string): Promise<void>;

  /** Verifica se um arquivo com essa chave já existe (evita duplicidade na importação) */
  exists(storageKey: string): Promise<boolean>;
}
