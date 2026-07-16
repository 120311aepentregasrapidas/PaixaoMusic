import type {
  StorageProvider,
  StorageProviderName,
  UploadInput,
  UploadResult,
  StreamUrlOptions,
} from '../StorageProvider';

/**
 * Implementação inicial usando Archive.org como storage de vídeos.
 *
 * Archive.org expõe uma API S3-like (`https://s3.us.archive.org`) para upload
 * e serve arquivos publicamente em `https://archive.org/download/{identifier}/{filename}`.
 * Isso é suficiente para nossas necessidades de streaming (Range requests são
 * suportadas nativamente pelo Archive.org, o que viabiliza seek no player).
 *
 * IMPORTANTE: esta classe é a ÚNICA parte do sistema que conhece detalhes do
 * Archive.org. Se um dia o usuário migrar para R2/B2/S3/NAS, basta criar um
 * novo arquivo (ex.: CloudflareR2Provider.ts) implementando a mesma interface
 * StorageProvider e trocar a instância em lib/storage/index.ts.
 */
export class ArchiveOrgProvider implements StorageProvider {
  readonly name: StorageProviderName = 'archive_org';

  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly baseUrl = 'https://archive.org';
  private readonly uploadUrl = 'https://s3.us.archive.org';

  constructor(config: { accessKey: string; secretKey: string }) {
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    // O "identifier" do Archive.org funciona como o bucket/item que guarda o arquivo.
    const identifier = this.buildIdentifier(input.key);
    const uploadTarget = `${this.uploadUrl}/${identifier}/${encodeURIComponent(input.filename)}`;

    const headers: Record<string, string> = {
      authorization: `LOW ${this.accessKey}:${this.secretKey}`,
      'content-type': input.contentType,
      // Mantém o item privado até revisão manual; pode ser alterado no painel admin.
      'x-archive-meta01-collection': 'opensource_movies',
      'x-archive-auto-make-bucket': '1',
    };

    if (input.metadata) {
      for (const [metaKey, metaValue] of Object.entries(input.metadata)) {
        headers[`x-archive-meta-${metaKey.toLowerCase()}`] = metaValue;
      }
    }

    const response = await fetch(uploadTarget, {
      method: 'PUT',
      headers,
      // @ts-expect-error — fetch aceita Buffer/ReadableStream no runtime Node/Edge
      body: input.file,
    });

    if (!response.ok) {
      throw new Error(
        `Falha ao enviar para Archive.org (${response.status}): ${await response.text()}`,
      );
    }

    return {
      storageKey: `${identifier}/${input.filename}`,
      publicUrl: `${this.baseUrl}/download/${identifier}/${input.filename}`,
    };
  }

  async getStreamUrl(storageKey: string, _options?: StreamUrlOptions): Promise<string> {
    // Arquivos no Archive.org já são publicamente acessíveis via /download/,
    // e o servidor deles suporta HTTP Range — essencial para seek no player.
    return `${this.baseUrl}/download/${storageKey}`;
  }

  async delete(storageKey: string): Promise<void> {
    const response = await fetch(`${this.uploadUrl}/${storageKey}`, {
      method: 'DELETE',
      headers: {
        authorization: `LOW ${this.accessKey}:${this.secretKey}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Falha ao remover do Archive.org (${response.status})`);
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/download/${storageKey}`, { method: 'HEAD' });
    return response.ok;
  }

  private buildIdentifier(key: string): string {
    // Identifiers do Archive.org aceitam apenas [a-zA-Z0-9_.-]
    const sanitized = key
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-zA-Z0-9_.-]+/g, '-')
      .toLowerCase();
    return `paixao-music-${sanitized}`;
  }
}
