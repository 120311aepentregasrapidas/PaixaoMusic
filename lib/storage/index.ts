import type { StorageProvider, StorageProviderName } from './StorageProvider';
import { ArchiveOrgProvider } from './providers/ArchiveOrgProvider';

/**
 * Factory central do Storage Provider.
 *
 * Esta é a ÚNICA função que o resto do sistema deve chamar para obter um
 * storage provider. Services, repositories e API routes importam
 * `getStorageProvider()` — nunca uma classe concreta diretamente.
 *
 * Trocar de Archive.org para Cloudflare R2 (por exemplo) no futuro:
 *   1. Criar lib/storage/providers/CloudflareR2Provider.ts implementando StorageProvider
 *   2. Adicionar o case 'cloudflare_r2' abaixo
 *   3. Mudar STORAGE_PROVIDER=cloudflare_r2 no .env / na tabela storage_provider
 * Nenhum outro arquivo do projeto precisa mudar.
 */
let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = (process.env.STORAGE_PROVIDER ?? 'archive_org') as StorageProviderName;

  switch (providerName) {
    case 'archive_org': {
      cachedProvider = new ArchiveOrgProvider({
        accessKey: process.env.ARCHIVE_ORG_ACCESS_KEY ?? '',
        secretKey: process.env.ARCHIVE_ORG_SECRET_KEY ?? '',
      });
      break;
    }

    case 'cloudflare_r2':
    case 'backblaze_b2':
    case 's3':
    case 'self_hosted':
      throw new Error(
        `Storage provider "${providerName}" ainda não foi implementado. ` +
          `Crie lib/storage/providers/${providerName} e registre-o aqui.`,
      );

    default:
      throw new Error(`Storage provider desconhecido: "${providerName}"`);
  }

  return cachedProvider;
}

export type { StorageProvider, StorageProviderName } from './StorageProvider';
