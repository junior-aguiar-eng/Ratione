import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { eventosDaAgenda, montarAgenda, rotuloDeProximidade } from './agenda';
import { gerarIcs, gerarIcsDeEventos } from './ics';
import type { Lembrete } from './lembretes';

const lembrete = (id: string, titulo: string, vencimento: string, tribunal: string | null = 'TJSP'): Lembrete => ({
  id,
  usuario_id: 'u',
  titulo,
  tribunal,
  vencimento,
  avisar_3_dias: true,
  avisar_1_dia: true,
  enviado_3_dias_em: null,
  enviado_1_dia_em: null
});

const HOJE = '2026-10-29';

describe('Agenda de prazos', () => {
  it('rotula a proximidade em português', () => {
    assert.strictEqual(rotuloDeProximidade(0), 'hoje');
    assert.strictEqual(rotuloDeProximidade(1), 'amanhã');
    assert.strictEqual(rotuloDeProximidade(5), 'em 5 dias');
  });

  it('agrupa do mais próximo ao mais distante, sem os passados e sem grupo vazio', () => {
    const grupos = montarAgenda(
      [
        lembrete('1', 'Apelação', '2026-12-20'),
        lembrete('2', 'Contestação', '2026-10-30'),
        lembrete('3', 'Embargos', '2026-11-04'),
        lembrete('4', 'Já passou', '2026-10-28'),
        lembrete('5', 'Réplica', '2026-11-20'),
        lembrete('6', 'Hoje mesmo', '2026-10-29')
      ],
      HOJE
    );
    assert.deepStrictEqual(grupos.map(g => g.id), ['imediato', 'semana', 'mes', 'depois']);
    assert.deepStrictEqual(grupos[0].itens.map(i => i.lembrete.titulo), ['Hoje mesmo', 'Contestação']);
    assert.deepStrictEqual(grupos[0].itens.map(i => i.quando), ['hoje', 'amanhã']);
    assert.deepStrictEqual(grupos[1].itens.map(i => i.lembrete.titulo), ['Embargos']);
    assert.ok(!grupos.flatMap(g => g.itens).some(i => i.lembrete.titulo === 'Já passou'));
    assert.deepStrictEqual(montarAgenda([lembrete('x', 'Passado', '2026-01-01')], HOJE), []);
  });

  it('empate de data ordena pelo título', () => {
    const g = montarAgenda([lembrete('1', 'B', '2026-11-03'), lembrete('2', 'A', '2026-11-03')], HOJE);
    assert.deepStrictEqual(g[0].itens.map(i => i.lembrete.titulo), ['A', 'B']);
  });

  it('os eventos de calendário levam só título, data e tribunal', () => {
    const e = eventosDaAgenda([lembrete('1', 'Apelação', '2026-11-03', 'TJSP'), lembrete('2', 'Sem tribunal', '2026-11-04', null)], HOJE);
    assert.strictEqual(e.length, 2);
    assert.strictEqual(e[0].data, '2026-11-03');
    assert.ok(e[0].descricao.startsWith('TJSP. '));
    assert.ok(!e[1].descricao.startsWith('null'));
  });
});

describe('Calendário com vários prazos', () => {
  it('um arquivo com um evento por prazo e o mesmo formato do arquivo de um prazo só', () => {
    const ics = gerarIcsDeEventos([
      { data: '2026-11-03', titulo: 'Apelação · TJSP', descricao: 'Um' },
      { data: '2026-11-10', titulo: 'Contestação · TJMG', descricao: 'Dois' }
    ]);
    assert.strictEqual(ics.match(/BEGIN:VEVENT/g)?.length, 2);
    assert.strictEqual(ics.match(/BEGIN:VCALENDAR/g)?.length, 1);
    assert.ok(ics.includes('DTSTART;VALUE=DATE:20261110'));
    assert.ok(ics.includes('SUMMARY:Prazo final: Contestação · TJMG'));
    const um = gerarIcs('2026-11-03', 'Um', 'Apelação · TJSP');
    assert.strictEqual(um.match(/BEGIN:VEVENT/g)?.length, 1);
    assert.ok(um.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0'));
  });
});
