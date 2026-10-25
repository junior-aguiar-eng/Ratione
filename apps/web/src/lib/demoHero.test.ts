import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ATOS_DEMO, DATA_INICIAL_DEMO, calcularDemoPrazo, consultarDemoNorma, resumirTexto } from './demoHero';
import { arestasDoNo, arestasValidadas, NO_CENTRAL, rotuloDoNo } from './grafoVitrine';

const hoje = () => new Date().toISOString().slice(0, 10);

describe('Demonstrações da página inicial: PrazoZero', () => {
  it('o cenário de referência (10/03/2026, apelação, TJSP) dá 01/04/2026, como o motor validado', () => {
    const r = calcularDemoPrazo({ data: DATA_INICIAL_DEMO, atoId: 'apelacao', tribunalId: 'TJSP' });
    assert.ok(r);
    assert.equal(r.prazoFinal, '2026-04-01');
    assert.equal(r.diasUteis, 15);
    assert.equal(r.calendarioConferido, true);
    assert.ok(r.excluidos.length > 0, 'a memória de cálculo mostra os dias excluídos');
    assert.ok(r.fontes.length > 0, 'cada calendário conferido cita o ato de onde foi lido');
  });

  it('o prazo final nunca cai em fim de semana e a contagem tem o número de dias do ato', () => {
    for (const ato of ATOS_DEMO) {
      for (const tribunalId of ['TJSP', 'TJMG', 'TJAL']) {
        const r = calcularDemoPrazo({ data: '2026-06-15', atoId: ato.id, tribunalId });
        assert.ok(r, `${ato.id} ${tribunalId}`);
        assert.equal(r.diasUteis, ato.dias);
        const dia = new Date(`${r.prazoFinal}T12:00:00Z`).getUTCDay();
        assert.ok(dia !== 0 && dia !== 6, `${r.prazoFinal} caiu em fim de semana`);
      }
    }
  });

  it('recusa o que está fora da demonstração: data fora do ano conferido, ato ou tribunal desconhecido', () => {
    assert.equal(calcularDemoPrazo({ data: '2025-12-30', atoId: 'apelacao', tribunalId: 'TJSP' }), null);
    assert.equal(calcularDemoPrazo({ data: '2026-12-10', atoId: 'apelacao', tribunalId: 'TJSP' }), null);
    assert.equal(calcularDemoPrazo({ data: '2026-03-10', atoId: 'inexistente', tribunalId: 'TJSP' }), null);
    assert.equal(calcularDemoPrazo({ data: '2026-03-10', atoId: 'apelacao', tribunalId: 'TJRJ' }), null);
    assert.equal(calcularDemoPrazo({ data: 'lixo', atoId: 'apelacao', tribunalId: 'TJSP' }), null);
  });
});

describe('Demonstrações da página inicial: NormaViva', () => {
  it('o art. 85, § 6º-A do CPC não existia antes de 03/06/2022 e passa a valer nesse dia', () => {
    const antes = consultarDemoNorma('2022-06-01');
    assert.equal(antes.existe, false);
    assert.equal(antes.texto, null);
    const inicio = consultarDemoNorma('2022-06-03');
    assert.equal(inicio.existe, true);
    assert.match(inicio.ato ?? '', /14\.365\/2022/);
    assert.equal(inicio.desde, '2022-06-03');
    assert.ok((inicio.texto ?? '').length > 50);
  });

  it('hoje o dispositivo está vigente', () => {
    const r = consultarDemoNorma(hoje());
    assert.equal(r.existe, true);
    assert.equal(r.rotulo, 'art. 85, § 6º-A');
  });
});

describe('Demonstrações da página inicial: TeseMap e utilidades', () => {
  it('o nó central tem relações validadas e só as validadas aparecem', () => {
    assert.ok(arestasValidadas().length >= 5);
    const doCentro = arestasDoNo(NO_CENTRAL);
    assert.ok(doCentro.length >= 3);
    assert.ok(doCentro.every(a => a.origem === NO_CENTRAL || a.destino === NO_CENTRAL));
    assert.equal(rotuloDoNo(NO_CENTRAL), 'Tema 1.076 do STJ');
  });

  it('resumir corta no espaço e acrescenta reticências só quando precisa', () => {
    assert.equal(resumirTexto('curto', 20), 'curto');
    assert.equal(resumirTexto('uma frase um pouco mais comprida', 15), 'uma frase um…');
  });
});
