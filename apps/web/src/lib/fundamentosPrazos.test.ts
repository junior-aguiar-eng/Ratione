import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { linhasDoCorpus } from '@ratione/normaviva/corpus';
import { CATALOGO_PRAZOS, FUNDAMENTOS_DOS_PRAZOS, idDoDispositivo, prazosFundamentadosPor } from '@ratione/prazozero';

const IDS_NO_CORPUS = new Set(
  linhasDoCorpus(join(__dirname, '..', '..', '..', '..', 'packages', 'normaviva', 'corpus')).flatMap(n => n.dispositivos.map(d => d.id))
);

describe('Fundamentos dos prazos: cada artigo existe no corpus do NormaViva', () => {
  it('todo prazo do catálogo tem fundamento, e só prazo do catálogo', () => {
    const ids = new Set(CATALOGO_PRAZOS.map(p => p.id));
    for (const id of ids) assert.ok(FUNDAMENTOS_DOS_PRAZOS[id]?.length, `sem fundamento: ${id}`);
    for (const id of Object.keys(FUNDAMENTOS_DOS_PRAZOS)) assert.ok(ids.has(id), `prazo desconhecido: ${id}`);
  });

  it('cada dispositivo citado existe no corpus', () => {
    const ausentes = Object.entries(FUNDAMENTOS_DOS_PRAZOS).flatMap(([prazo, lista]) =>
      lista.map(f => idDoDispositivo(f)).filter(id => !IDS_NO_CORPUS.has(id)).map(id => `${prazo}: ${id}`)
    );
    assert.deepStrictEqual(ausentes, []);
  });

  it('o artigo da base legal escrita no catálogo aparece entre os fundamentos', () => {
    // "CPC, arts. 1.009 e 1.003, § 5º" cita o art. 1.009: o mapa estruturado não pode ter ficado para trás do texto
    for (const p of CATALOGO_PRAZOS) {
      for (const [, numero] of p.baseLegal.matchAll(/\barts?\.\s*(\d[\d.]*(?:-[A-Z])?)/g)) {
        const achou = FUNDAMENTOS_DOS_PRAZOS[p.id].some(f => f.rotulo.startsWith(`art. ${numero}`));
        assert.ok(achou, `${p.id}: art. ${numero} está na base legal escrita e não no mapa`);
      }
    }
  });

  it('o inverso: o artigo aponta para os prazos que ele fundamenta, também a partir de um parágrafo', () => {
    assert.deepStrictEqual(prazosFundamentadosPor('LEI-13105-2015|corpo|art. 1.023'), ['embargos-declaracao']);
    assert.ok(prazosFundamentadosPor('LEI-13105-2015|corpo|art. 1.029, § 1º').includes('recurso-especial'));
    assert.deepStrictEqual(prazosFundamentadosPor('LEI-13105-2015|corpo|art. 85'), []);
    assert.deepStrictEqual(prazosFundamentadosPor('LEI-13105-2015|preambulo|art. 1.023'), []);
  });
});
