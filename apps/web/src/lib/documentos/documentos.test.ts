import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { cifrar, decifrar, lerChave, SOBRECARGA_CIFRA } from './cifra';
import { lerConfigDeDocumentos } from './config';
import {
  apagarDocumento,
  apagarTodosDoUsuario,
  enviarDocumento,
  limparVencidos,
  listarDocumentos,
  type DependenciasDeDocumentos,
  type RegistroDeDocumento
} from './servico';
import { LIMITES_DE_DOCUMENTO, validarDocumento } from './validar';

const CHAVE = randomBytes(32);
const PDF = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n');
const TXT = Buffer.from('Sentença de exemplo, em UTF-8.\nSegundo parágrafo.');
const DOCX = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('....[Content_Types].xml....word/document.xml....')]);

describe('F5-01: cifra', () => {
  it('cifra e decifra, e o arquivo guardado não tem o texto original', () => {
    const guardado = cifrar(TXT, CHAVE, 'u1/d1');
    assert.equal(guardado.length, TXT.length + SOBRECARGA_CIFRA);
    assert.ok(!guardado.includes(Buffer.from('parágrafo')));
    assert.deepEqual(decifrar(guardado, CHAVE, 'u1/d1'), TXT);
  });
  it('a mesma entrada cifra diferente a cada vez (IV novo)', () => {
    assert.notDeepEqual(cifrar(TXT, CHAVE, 'u1/d1'), cifrar(TXT, CHAVE, 'u1/d1'));
  });
  it('chave errada, caminho trocado, arquivo adulterado ou truncado não decifram', () => {
    const guardado = cifrar(TXT, CHAVE, 'u1/d1');
    assert.equal(decifrar(guardado, randomBytes(32), 'u1/d1'), null);
    assert.equal(decifrar(guardado, CHAVE, 'u2/d1'), null); // copiado para outro usuário
    const adulterado = Buffer.from(guardado);
    adulterado[20] ^= 1;
    assert.equal(decifrar(adulterado, CHAVE, 'u1/d1'), null);
    assert.equal(decifrar(guardado.subarray(0, 10), CHAVE, 'u1/d1'), null);
    const outraVersao = Buffer.from(guardado);
    outraVersao[0] = 9;
    assert.equal(decifrar(outraVersao, CHAVE, 'u1/d1'), null);
  });
  it('só aceita chave de 32 bytes em base64', () => {
    assert.ok(lerChave(CHAVE.toString('base64')));
    for (const v of [undefined, '', 'curta', randomBytes(16).toString('base64'), randomBytes(48).toString('base64'), '!!!']) assert.equal(lerChave(v), null, String(v));
  });
});

describe('F5-01: configuração', () => {
  const base = { ARGUMENTA_UPLOAD_LIGADO: 'sim', DOCUMENTOS_CHAVE: CHAVE.toString('base64') };
  it('desligado por padrão: sem a flag ou sem chave válida não há configuração', () => {
    assert.equal(lerConfigDeDocumentos({}), null);
    assert.equal(lerConfigDeDocumentos({ DOCUMENTOS_CHAVE: base.DOCUMENTOS_CHAVE }), null);
    assert.equal(lerConfigDeDocumentos({ ARGUMENTA_UPLOAD_LIGADO: 'sim' }), null);
    assert.equal(lerConfigDeDocumentos({ ...base, DOCUMENTOS_CHAVE: 'curta' }), null);
    assert.equal(lerConfigDeDocumentos({ ...base, ARGUMENTA_UPLOAD_LIGADO: 'true' }), null);
  });
  it('retenção: 7 dias por padrão; a variável só pode reduzir, nunca aumentar', () => {
    assert.equal(lerConfigDeDocumentos(base)?.retencaoDias, 7);
    assert.equal(lerConfigDeDocumentos({ ...base, DOCUMENTOS_RETENCAO_DIAS: '1' })?.retencaoDias, 1);
    assert.equal(lerConfigDeDocumentos({ ...base, DOCUMENTOS_RETENCAO_DIAS: '30' })?.retencaoDias, 7);
    assert.equal(lerConfigDeDocumentos({ ...base, DOCUMENTOS_RETENCAO_DIAS: '0' })?.retencaoDias, 7);
    assert.equal(lerConfigDeDocumentos({ ...base, DOCUMENTOS_RETENCAO_DIAS: 'abc' })?.retencaoDias, 7);
  });
});

describe('F5-01: tipo do arquivo pelo conteúdo', () => {
  it('reconhece PDF, DOCX e texto', () => {
    assert.deepEqual(validarDocumento(PDF), { ok: true, tipo: 'pdf' });
    assert.deepEqual(validarDocumento(DOCX), { ok: true, tipo: 'docx' });
    assert.deepEqual(validarDocumento(TXT), { ok: true, tipo: 'txt' });
  });
  it('recusa vazio, grande demais, executável, ZIP que não é Word e texto inválido', () => {
    assert.equal(validarDocumento(new Uint8Array(0)).ok, false);
    assert.equal(validarDocumento(new Uint8Array(LIMITES_DE_DOCUMENTO.maxBytes + 1)).ok, false);
    assert.equal(validarDocumento(Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00])).ok, false); // MZ: executável
    assert.equal(validarDocumento(Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('outro.zip')])).ok, false);
    assert.equal(validarDocumento(Buffer.from([0xff, 0xfe, 0xfa, 0x80, 0x81])).ok, false); // não é UTF-8
  });
});

/** Armazenamento e banco em memória. */
function montar(inicial: RegistroDeDocumento[] = [], opcoes: { falhaNoBanco?: boolean } = {}) {
  let agora = new Date('2026-11-04T12:00:00Z');
  let n = 0;
  const arquivos = new Map<string, Buffer>();
  const linhas = [...inicial];
  for (const r of inicial) arquivos.set(r.caminho, Buffer.from('x'));
  const dep: DependenciasDeDocumentos = {
    chave: CHAVE,
    retencaoDias: 7,
    agora: () => agora,
    novoId: () => `id-${++n}`,
    armazenamento: {
      async gravar(c, b) {
        arquivos.set(c, b);
      },
      async remover(cs) {
        cs.forEach(c => arquivos.delete(c));
      }
    },
    banco: {
      async inserir(r) {
        if (opcoes.falhaNoBanco) throw new Error('banco fora do ar');
        linhas.push(r);
      },
      async doUsuario(u) {
        return linhas.filter(r => r.usuarioId === u);
      },
      async remover(ids) {
        for (const id of ids) linhas.splice(linhas.findIndex(r => r.id === id), 1);
      },
      async vencidos(ate, limite) {
        return linhas.filter(r => r.expiraEm <= ate).slice(0, limite);
      }
    }
  };
  return { dep, arquivos, linhas, avancar: (dias: number) => (agora = new Date(agora.getTime() + dias * 86_400_000)) };
}

const registro = (id: string, usuarioId: string, expiraEm: string): RegistroDeDocumento => ({
  id,
  usuarioId,
  tipo: 'txt',
  tamanhoBytes: 1,
  caminho: `${usuarioId}/${id}`,
  criadoEm: new Date('2026-10-01T00:00:00Z'),
  expiraEm: new Date(expiraEm)
});

describe('F5-01: guardar, listar e apagar', () => {
  it('guarda o arquivo cifrado, com caminho opaco e sem nome nem conteúdo no banco', async () => {
    const { dep, arquivos, linhas } = montar();
    const r = await enviarDocumento('u1', PDF, dep);
    assert.ok(r.ok);
    assert.equal(r.documento.tipo, 'pdf');
    assert.equal(r.documento.expiraEm, '2026-11-11T12:00:00.000Z'); // 7 dias
    assert.equal(linhas.length, 1);
    assert.equal(linhas[0].caminho, 'u1/id-1');
    const guardado = arquivos.get('u1/id-1')!;
    assert.ok(!guardado.includes(Buffer.from('%PDF-')), 'o arquivo guardado está cifrado');
    assert.deepEqual(decifrar(guardado, CHAVE, 'u1/id-1'), PDF);
    assert.ok(!JSON.stringify(r.documento).includes('u1/'), 'o caminho interno não vai ao usuário');
  });

  it('formato recusado não guarda nada', async () => {
    const { dep, arquivos, linhas } = montar();
    const r = await enviarDocumento('u1', Buffer.from([0x4d, 0x5a, 0x90, 0x00]), dep);
    assert.ok(!r.ok && r.status === 400);
    assert.equal(arquivos.size + linhas.length, 0);
  });

  it('arquivo grande demais: 413', async () => {
    const { dep } = montar();
    const r = await enviarDocumento('u1', new Uint8Array(LIMITES_DE_DOCUMENTO.maxBytes + 1), dep);
    assert.ok(!r.ok && r.status === 413);
  });

  it('limite de arquivos por usuário: 429, e o de outro usuário não conta', async () => {
    const cheios = Array.from({ length: LIMITES_DE_DOCUMENTO.maxPorUsuario }, (_, i) => registro(`d${i}`, 'u1', '2026-12-01T00:00:00Z'));
    const { dep } = montar(cheios);
    const r = await enviarDocumento('u1', TXT, dep);
    assert.ok(!r.ok && r.status === 429);
    assert.ok((await enviarDocumento('u2', TXT, dep)).ok);
  });

  it('o vencido sai antes de contar o limite, do armazenamento e do banco', async () => {
    const velhos = Array.from({ length: LIMITES_DE_DOCUMENTO.maxPorUsuario }, (_, i) => registro(`d${i}`, 'u1', '2026-11-01T00:00:00Z'));
    const { dep, arquivos, linhas } = montar(velhos);
    const r = await enviarDocumento('u1', TXT, dep);
    assert.ok(r.ok);
    assert.equal(linhas.length, 1);
    assert.deepEqual([...arquivos.keys()], ['u1/id-1']);
  });

  it('falha ao gravar no banco desfaz o arquivo (nada órfão)', async () => {
    const { dep, arquivos } = montar([], { falhaNoBanco: true });
    await assert.rejects(enviarDocumento('u1', TXT, dep), /banco fora do ar/);
    assert.equal(arquivos.size, 0);
  });

  it('lista só os do usuário e já descarta os vencidos', async () => {
    const { dep, arquivos } = montar([registro('a', 'u1', '2026-12-01T00:00:00Z'), registro('b', 'u1', '2026-11-01T00:00:00Z'), registro('c', 'u2', '2026-12-01T00:00:00Z')]);
    assert.deepEqual((await listarDocumentos('u1', dep)).map(d => d.id), ['a']);
    assert.ok(!arquivos.has('u1/b'), 'o vencido foi apagado do armazenamento');
    assert.ok(arquivos.has('u2/c'));
  });

  it('apaga o próprio documento; o de outro usuário ou inexistente dá o mesmo "não achou"', async () => {
    const { dep, arquivos, linhas } = montar([registro('a', 'u1', '2026-12-01T00:00:00Z'), registro('c', 'u2', '2026-12-01T00:00:00Z')]);
    assert.equal(await apagarDocumento('u1', 'c', dep), false);
    assert.equal(await apagarDocumento('u1', 'nao-existe', dep), false);
    assert.equal(linhas.length, 2);
    assert.equal(await apagarDocumento('u1', 'a', dep), true);
    assert.deepEqual([...arquivos.keys()], ['u2/c']);
    assert.deepEqual(linhas.map(l => l.id), ['c']);
  });

  it('exclusão da conta apaga todos os do usuário e só os dele', async () => {
    const { dep, arquivos, linhas } = montar([registro('a', 'u1', '2026-12-01T00:00:00Z'), registro('b', 'u1', '2026-12-01T00:00:00Z'), registro('c', 'u2', '2026-12-01T00:00:00Z')]);
    assert.equal(await apagarTodosDoUsuario('u1', dep), 2);
    assert.deepEqual([...arquivos.keys()], ['u2/c']);
    assert.deepEqual(linhas.map(l => l.id), ['c']);
    assert.equal(await apagarTodosDoUsuario('u1', dep), 0);
  });

  it('faxina geral: apaga os vencidos de todos, em lotes, e deixa os demais', async () => {
    const { dep, arquivos, linhas, avancar } = montar([
      registro('a', 'u1', '2026-11-05T00:00:00Z'),
      registro('b', 'u2', '2026-11-06T00:00:00Z'),
      registro('c', 'u3', '2026-12-30T00:00:00Z')
    ]);
    assert.equal(await limparVencidos(dep), 0);
    avancar(3);
    assert.equal(await limparVencidos(dep, 1), 1); // lote de 1
    assert.equal(await limparVencidos(dep), 1);
    assert.deepEqual([...arquivos.keys()], ['u3/c']);
    assert.deepEqual(linhas.map(l => l.id), ['c']);
  });
});
