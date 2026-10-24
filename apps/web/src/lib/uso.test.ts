import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  celulaCsv,
  cotasDoPlano,
  dataCurta,
  dataHora,
  diasDeHistorico,
  estadoExibido,
  gastouCota,
  historicoEmCsv,
  inicioDoHistorico,
  nomeDoCsv,
  podeExportar,
  precoEmReais,
  rotuloDaAnalise,
  type LinhaAnalise,
  type LinhaResumo
} from './uso';

const AGORA = new Date('2026-10-23T17:05:00.000Z'); // 14:05 em Brasília
const minutosAtras = (m: number) => new Date(AGORA.getTime() - m * 60_000).toISOString();
const linha = (sobre: Partial<LinhaAnalise> = {}): LinhaAnalise => ({
  id: 'a1',
  tipo: 'rapida',
  rotulo: null,
  situacao: 'concluida',
  consumiu: true,
  falhas: 0,
  criada_em: minutosAtras(60),
  concluida_em: minutosAtras(59),
  ...sobre
});

describe('Meu uso: o que mostrar de cada análise', () => {
  it('estado exibido: concluída, falhou e cancelada vêm do banco; em andamento depende do relógio e do consumo', () => {
    assert.equal(estadoExibido(linha(), AGORA), 'concluida');
    assert.equal(estadoExibido(linha({ situacao: 'falhou', consumiu: false }), AGORA), 'falhou');
    assert.equal(estadoExibido(linha({ situacao: 'cancelada', consumiu: false }), AGORA), 'cancelada');
    assert.equal(estadoExibido(linha({ situacao: 'em_andamento', consumiu: false, criada_em: minutosAtras(3) }), AGORA), 'em_andamento');
    assert.equal(estadoExibido(linha({ situacao: 'em_andamento', consumiu: true, criada_em: minutosAtras(3) }), AGORA), 'em_andamento');
    assert.equal(estadoExibido(linha({ situacao: 'em_andamento', consumiu: true, criada_em: minutosAtras(16) }), AGORA), 'interrompida');
    assert.equal(estadoExibido(linha({ situacao: 'em_andamento', consumiu: false, criada_em: minutosAtras(16) }), AGORA), 'abandonada');
  });

  it('só gasta cota o que foi entregue: falha, cancelada e abandonada não gastam; interrompida gasta', () => {
    assert.equal(gastouCota(linha(), AGORA), true);
    assert.equal(gastouCota(linha({ situacao: 'em_andamento', consumiu: true, criada_em: minutosAtras(30) }), AGORA), true, 'interrompida');
    assert.equal(gastouCota(linha({ situacao: 'falhou', consumiu: false }), AGORA), false);
    assert.equal(gastouCota(linha({ situacao: 'cancelada', consumiu: false }), AGORA), false);
    assert.equal(gastouCota(linha({ situacao: 'em_andamento', consumiu: false, criada_em: minutosAtras(30) }), AGORA), false, 'abandonada');
    assert.equal(gastouCota(linha({ situacao: 'em_andamento', consumiu: false, criada_em: minutosAtras(2) }), AGORA), false, 'em andamento, ainda sem entrega');
  });

  it('o histórico do gratuito vai a 30 dias e só os planos pagos exportam', () => {
    assert.equal(diasDeHistorico('gratuito'), 30);
    assert.equal(diasDeHistorico('essencial'), 365);
    assert.equal(diasDeHistorico('profissional'), 365);
    assert.equal(podeExportar('gratuito'), false);
    assert.equal(podeExportar('essencial'), true);
    assert.equal(inicioDoHistorico('gratuito', AGORA), '2026-09-23T17:05:00.000Z');
  });

  it('datas no horário de Brasília', () => {
    assert.equal(dataHora('2026-10-23T17:05:00.000Z'), '23/10/2026 14:05');
    assert.equal(dataHora('2026-10-24T02:30:00.000Z'), '23/10/2026 23:30', 'já é noite em Brasília');
    assert.equal(dataCurta('2026-10-26T02:59:00.000Z'), '25/10');
    assert.equal(nomeDoCsv(AGORA), 'ratione-uso-2026-10-23.csv');
    assert.equal(nomeDoCsv(new Date('2026-10-24T02:30:00.000Z')), 'ratione-uso-2026-10-23.csv');
  });

  it('as cotas do plano deixam de fora o que vale zero e vêm na ordem rápida, completa, explicação', () => {
    const base = { plano: 'gratuito', plano_nome: 'Gratuito', periodo: 'semana', inicio: '', fim: '', usadas: 0, restantes: 0 } as const;
    const resumo: LinhaResumo[] = [
      { ...base, tipo: 'explicacao', quantidade: 10 },
      { ...base, tipo: 'completa', quantidade: 0 },
      { ...base, tipo: 'rapida', quantidade: 3 }
    ];
    assert.deepEqual(cotasDoPlano(resumo).map(l => l.tipo), ['rapida', 'explicacao']);
  });
});

describe('Meu uso: preço', () => {
  it('centavos em reais, com espaço comum depois do R$', () => {
    assert.equal(precoEmReais(2900), 'R$ 29,00');
    assert.equal(precoEmReais(7990), 'R$ 79,90');
    assert.equal(precoEmReais(123456), 'R$ 1.234,56');
  });
});

describe('Meu uso: nome da análise', () => {
  it('vazio vira sem nome; espaços e quebras de linha são juntados', () => {
    for (const vazio of [undefined, null, '', '   ', '\n\t']) assert.deepEqual(rotuloDaAnalise(vazio), { ok: true, rotulo: null });
    assert.deepEqual(rotuloDaAnalise('  Cobrança   de\nserviços '), { ok: true, rotulo: 'Cobrança de serviços' });
  });

  it('recusa o que não é texto, o que passa de 80 caracteres e o que tem dado pessoal reconhecível', () => {
    assert.equal(rotuloDaAnalise(42).ok, false);
    assert.equal(rotuloDaAnalise({}).ok, false);
    assert.equal(rotuloDaAnalise('x'.repeat(81)).ok, false);
    assert.equal(rotuloDaAnalise('x'.repeat(80)).ok, true);
    for (const ruim of ['Processo 0001234-56.2024.8.02.0001', 'CPF 123.456.789-09', 'maria@exemplo.com', 'Autor: Maria Souza']) {
      const r = rotuloDaAnalise(ruim);
      assert.ok(!r.ok && /não pode ter/.test(r.mensagem), ruim);
    }
  });
});

describe('Meu uso: exportação em CSV', () => {
  it('cabeçalho e linhas com o nome do tipo, o resultado em português e se gastou cota; BOM e fim de linha do Excel', () => {
    const csv = historicoEmCsv(
      [linha({ rotulo: 'Cobrança X' }), linha({ id: 'a2', tipo: 'explicacao', situacao: 'falhou', consumiu: false, criada_em: '2026-10-23T12:00:00.000Z' })],
      AGORA
    );
    assert.ok(csv.startsWith('﻿"Data e hora (Brasília)";"Tipo";"Nome";"Resultado";"Gastou cota";"Parágrafos"\r\n'));
    const linhas = csv.trim().split('\r\n');
    assert.equal(linhas.length, 3);
    assert.equal(linhas[1], '"23/10/2026 13:05";"Análise rápida";"Cobrança X";"Concluída";"Sim";""');
    assert.equal(linhas[2], '"23/10/2026 09:00";"Explicação de dispositivo";"";"Falhou";"Não";""');
  });

  it('o nome é texto do cliente: aspas dobradas e fórmula neutralizada', () => {
    assert.equal(celulaCsv('Ele disse "oi"'), '"Ele disse ""oi"""');
    for (const perigoso of ['=SOMA(A1:A9)', '+55 82', '-1', '@usuario', '\t=1']) {
      assert.ok(celulaCsv(perigoso).startsWith(`"'`), perigoso);
    }
    assert.equal(celulaCsv('Cobrança 2024'), '"Cobrança 2024"');
    const csv = historicoEmCsv([linha({ rotulo: '=HYPERLINK("http://x")' })], AGORA);
    assert.ok(csv.includes(`"'=HYPERLINK(""http://x"")"`));
  });

  it('histórico vazio gera só o cabeçalho', () => {
    assert.equal(historicoEmCsv([], AGORA).trim().split('\r\n').length, 1);
  });
});
