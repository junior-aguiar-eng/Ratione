/**
 * F5-01: cifra dos documentos enviados antes de irem ao armazenamento (RIPD, condição 1: criptografia com chave sob controle do Ratione,
 * e não só a do provedor). AES-256-GCM; a chave vem do ambiente (`DOCUMENTOS_CHAVE`, 32 bytes em base64, guardada no Secret Manager).
 *
 * Formato do arquivo guardado: [versão: 1 byte][IV: 12 bytes][texto cifrado][etiqueta GCM: 16 bytes]. A versão deixa trocar a chave ou o
 * algoritmo depois sem quebrar o que já foi guardado. O caminho do objeto entra como dado autenticado: um arquivo copiado para outro caminho
 * (ou de outro usuário) não decifra.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const VERSAO = 1;
const TAM_IV = 12;
const TAM_ETIQUETA = 16;

export const SOBRECARGA_CIFRA = 1 + TAM_IV + TAM_ETIQUETA;

/** A chave do ambiente (base64 de 32 bytes), ou `null` se ausente ou do tamanho errado: sem chave válida nada é guardado. */
export function lerChave(valor: string | undefined): Buffer | null {
  const texto = valor?.trim();
  if (!texto || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(texto)) return null;
  const chave = Buffer.from(texto, 'base64');
  return chave.length === 32 ? chave : null;
}

export function cifrar(conteudo: Uint8Array, chave: Buffer, caminho: string): Buffer {
  const iv = randomBytes(TAM_IV);
  const cifra = createCipheriv('aes-256-gcm', chave, iv);
  cifra.setAAD(Buffer.from(caminho, 'utf8'));
  const dados = Buffer.concat([cifra.update(conteudo), cifra.final()]);
  return Buffer.concat([Buffer.from([VERSAO]), iv, dados, cifra.getAuthTag()]);
}

/** Devolve o conteúdo original, ou `null` se a chave, o caminho ou o arquivo não conferem (nunca lança por adulteração). */
export function decifrar(guardado: Uint8Array, chave: Buffer, caminho: string): Buffer | null {
  const b = Buffer.from(guardado);
  if (b.length < SOBRECARGA_CIFRA || b[0] !== VERSAO) return null;
  try {
    const decifra = createDecipheriv('aes-256-gcm', chave, b.subarray(1, 1 + TAM_IV));
    decifra.setAAD(Buffer.from(caminho, 'utf8'));
    decifra.setAuthTag(b.subarray(b.length - TAM_ETIQUETA));
    return Buffer.concat([decifra.update(b.subarray(1 + TAM_IV, b.length - TAM_ETIQUETA)), decifra.final()]);
  } catch {
    return null;
  }
}
