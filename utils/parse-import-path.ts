/**
 * Parser de importação.
 *
 * Recebe o caminho relativo de um arquivo dentro da pasta selecionada
 * (ex.: "Queen/A Night At The Opera/06 - Bohemian Rhapsody.mp4") e extrai:
 *   - artista  → primeira pasta
 *   - álbum    → segunda pasta (se existir)
 *   - título   → nome do arquivo, limpo de lixo comum
 *
 * Convenção esperada (do Readme): Artista/Álbum/Música.mp4
 * Mas o parser é tolerante a estruturas mais simples (Artista/Música.mp4)
 * ou arquivos soltos na raiz (usa "Artista Desconhecido").
 */

export interface ParsedImportEntry {
  artistName: string;
  albumName: string | null;
  trackNumber: number | null;
  title: string;
  originalFilename: string;
  originalPath: string;
}

const NOISE_PATTERNS: RegExp[] = [
  /\(official\s*(music\s*)?video\)/gi,
  /\[official\s*(music\s*)?video\]/gi,
  /\(official\s*audio\)/gi,
  /\[official\s*audio\]/gi,
  /\(lyrics?\)/gi,
  /\[lyrics?\]/gi,
  /\(hd\)/gi,
  /\[hd\]/gi,
  /\(hq\)/gi,
  /\[hq\]/gi,
  /\(4k\)/gi,
  /\[4k\]/gi,
  /\(remastered.*?\)/gi,
  /\[remastered.*?\]/gi,
  /\bvevo\b/gi,
  /\bmv\b/gi,
];

/** Remove a extensão do arquivo (.mp4, .mkv, .mov...) */
function stripExtension(filename: string): string {
  return filename.replace(/\.[a-zA-Z0-9]+$/, '');
}

/** Extrai e remove um número de faixa no início do nome ("01 - ", "01.", "01_") */
function extractTrackNumber(name: string): { trackNumber: number | null; rest: string } {
  const match = name.match(/^(\d{1,3})[\s._-]+(.*)$/);
  if (match && match[1] != null && match[2] != null) {
    return { trackNumber: parseInt(match[1], 10), rest: match[2] };
  }
  return { trackNumber: null, rest: name };
}

/** Remove ruído comum de nomes de vídeo baixados (Official Video, HD, Vevo etc.) */
function removeNoise(name: string): string {
  let cleaned = name;
  for (const pattern of NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned
    .replace(/[_]+/g, ' ') // underscores → espaço
    .replace(/\s{2,}/g, ' ') // espaços duplicados
    .trim()
    .replace(/^[-–—\s]+|[-–—\s]+$/g, ''); // traços soltos nas pontas
}

/**
 * Tenta separar "Artista - Título" quando o nome do arquivo contém esse
 * padrão (comum em downloads soltos, sem estrutura de pastas por artista).
 */
function splitArtistTitle(name: string): { artist: string | null; title: string } {
  const parts = name.split(/\s+-\s+/);
  const first = parts[0];
  if (parts.length >= 2 && first != null) {
    return { artist: first.trim(), title: parts.slice(1).join(' - ').trim() };
  }
  return { artist: null, title: name };
}

/**
 * @param relativePath caminho relativo dentro da pasta selecionada, com "/" como separador
 *                     (é o que `File.webkitRelativePath` fornece no navegador)
 */
export function parseImportPath(relativePath: string, filename: string): ParsedImportEntry {
  const segments = relativePath.split('/').filter(Boolean);
  // segments[0] é sempre a pasta raiz selecionada pelo usuário — ignoramos ela.
  const meaningfulSegments = segments.slice(1, -1); // tudo entre a raiz e o arquivo

  const rawName = stripExtension(filename);
  const { trackNumber, rest } = extractTrackNumber(rawName);
  const cleanedName = removeNoise(rest);

  let artistName: string;
  let albumName: string | null;
  let title: string;

  if (meaningfulSegments.length >= 2 && meaningfulSegments[0] != null && meaningfulSegments[1] != null) {
    // Artista/Álbum/Música.mp4
    artistName = meaningfulSegments[0];
    albumName = meaningfulSegments[1];
    title = cleanedName;
  } else if (meaningfulSegments.length === 1 && meaningfulSegments[0] != null) {
    // Artista/Música.mp4 — sem álbum explícito
    artistName = meaningfulSegments[0];
    albumName = null;
    title = cleanedName;
  } else {
    // Arquivo solto na raiz — tenta extrair "Artista - Título" do próprio nome
    const split = splitArtistTitle(cleanedName);
    artistName = split.artist ?? 'Artista Desconhecido';
    albumName = null;
    title = split.title;
  }

  return {
    artistName: artistName.trim(),
    albumName: albumName?.trim() || null,
    trackNumber,
    title: title.trim() || rawName,
    originalFilename: filename,
    originalPath: relativePath,
  };
}

/** Gera um slug (URL-friendly) a partir de um nome — usado para artists.slug, albums.slug, songs.slug */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
