/**
 * F5-01: o que se aceita como documento. O tipo vem do **conteúdo** (os primeiros bytes), nunca do nome nem do tipo que o navegador declara.
 * Não se executa nem se interpreta o arquivo aqui: só se confere o formato e o tamanho. A leitura do texto é a F5-02 (Docling).
 */
export const TIPOS_DE_DOCUMENTO = ['pdf', 'docx', 'txt'] as const;
export type TipoDeDocumento = (typeof TIPOS_DE_DOCUMENTO)[number];

export const LIMITES_DE_DOCUMENTO = {
  /** Tamanho de cada arquivo (decisão do responsável, 04/11/2026). */
  maxBytes: 10 * 1024 * 1024,
  /** Quantos arquivos um usuário pode ter guardados ao mesmo tempo (idem). */
  maxPorUsuario: 10,
  /** Dias até o arquivo ser apagado sozinho (idem; configurável por `DOCUMENTOS_RETENCAO_DIAS`). */
  retencaoDias: 7
} as const;

export type ResultadoValidacao = { ok: true; tipo: TipoDeDocumento } | { ok: false; mensagem: string };

export function validarDocumento(bytes: Uint8Array): ResultadoValidacao {
  if (bytes.length === 0) return { ok: false, mensagem: 'O arquivo está vazio.' };
  if (bytes.length > LIMITES_DE_DOCUMENTO.maxBytes) {
    return { ok: false, mensagem: `O arquivo passa de ${LIMITES_DE_DOCUMENTO.maxBytes / 1024 / 1024} MB.` };
  }

  // PDF: "%PDF-" nos primeiros bytes (a especificação aceita lixo antes, até 1 KB)
  const inicio = Buffer.from(bytes.subarray(0, 1024)).toString('latin1');
  if (inicio.includes('%PDF-')) return { ok: true, tipo: 'pdf' };

  // DOCX: um ZIP ("PK\x03\x04") que traz as partes do Word. Os nomes das partes ficam em claro no ZIP.
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const todo = Buffer.from(bytes).toString('latin1');
    if (todo.includes('[Content_Types].xml') && todo.includes('word/')) return { ok: true, tipo: 'docx' };
    return { ok: false, mensagem: 'Este arquivo ZIP não é um documento do Word (.docx).' };
  }

  // Texto: UTF-8 válido e sem byte nulo
  if (!bytes.includes(0)) {
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      return { ok: true, tipo: 'txt' };
    } catch {
      /* cai na recusa abaixo */
    }
  }
  return { ok: false, mensagem: 'Formato não aceito. Envie PDF, DOCX (Word) ou texto simples (.txt em UTF-8).' };
}
