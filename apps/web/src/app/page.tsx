import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MotorPrazoZero } from '@ratione/prazozero';
import { MotorNormaViva } from '@ratione/normaviva';
import { GRAFOS_PRECEDENTES_CATALOGADOS } from '@ratione/tesemap';
import RecentesHome from '../components/RecentesHome';
import { MODULOS } from '../lib/modulos';
import { DECISAO_DEMO } from '../lib/decisaoDemo';
import { dataCurta, dataLonga, diaDaSemana } from '../lib/datas';

function Secao({
  id,
  nome,
  titulo,
  descricao,
  cta,
  href,
  legenda,
  invertido,
  children
}: {
  id: string;
  nome: string;
  titulo: string;
  descricao: string;
  cta: string;
  href: string;
  legenda: string;
  invertido?: boolean;
  children: React.ReactNode;
}) {
  const status = MODULOS.find(m => m.href === href)?.status;
  return (
    <section id={id} className="py-14 border-t border-line grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <div className={`lg:col-span-5 space-y-5 ${invertido ? 'lg:order-2' : ''}`}>
        <div className="flex items-center gap-3">
          <span className="eyebrow">{nome}</span>
          {status && status !== 'Disponível' && <span className="tag-neutral">{status}</span>}
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-[1.15] sm:leading-10">{titulo}</h2>
        <p className="text-base text-ink-soft leading-relaxed max-w-md">{descricao}</p>
        <Link href={href} className="btn-primary">
          <span>{cta}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className={`lg:col-span-7 ${invertido ? 'lg:order-1' : ''}`}>
        <div className="bg-surface border border-line rounded-xl p-6 sm:p-8">{children}</div>
        <p className="text-sm text-ink-mute mt-3">{legenda}</p>
      </div>
    </section>
  );
}

function VisualArgumenta() {
  const tese = DECISAO_DEMO.fundamentacao.tesesIdentificadas[0];
  const etapas = [
    { rotulo: 'Decisão', texto: 'Sentença cível · Fraude bancária e transações via PIX', tom: 'bg-surface-2 text-ink-soft' },
    { rotulo: 'Tese', texto: tese.titulo, tom: 'bg-brand-tint text-brand-text' },
    { rotulo: 'Fundamento', texto: 'CDC, art. 14 · Súmula 479/STJ', tom: 'bg-info-tint text-info-text' },
    { rotulo: 'Conclusão', texto: 'Pedidos julgados procedentes', tom: 'bg-ok-tint text-ok-text' }
  ];

  return (
    <div className="space-y-6">
      <ol className="space-y-0">
        {etapas.map((e, i) => (
          <li key={e.rotulo} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`tag ${e.tom} w-24 justify-center`}>{e.rotulo}</span>
              {i < etapas.length - 1 && <span className="w-px flex-1 bg-line-strong my-1" />}
            </div>
            <p className="text-base text-ink pb-5 pt-0.5 leading-snug">{e.texto}</p>
          </li>
        ))}
      </ol>
      <div className="rounded-lg bg-danger-tint border border-danger/30 p-4 text-sm text-danger-text leading-relaxed">
        <span className="font-semibold">Ponto de atenção:</span> argumento defensivo não enfrentado (CPC, art. 489, § 1º,
        IV), à p. 6 da decisão.
      </div>
    </div>
  );
}

function VisualNormaViva() {
  const motor = new MotorNormaViva();
  const id = 'CPC-ART-85-P6A';
  const versao = motor.obterLinhaDoTempo(id)[0];
  const antes = motor.consultarDispositivoNaData(id, '2020-01-01');

  const pontos = [
    {
      rotulo: antes ? 'Antes' : 'Antes de ' + dataCurta(versao.dataInicioVigencia),
      detalhe: antes ? 'Redação anterior' : 'Dispositivo inexistente',
      cor: 'bg-ink-mute'
    },
    {
      rotulo: dataCurta(versao.dataInicioVigencia),
      detalhe: `Acrescentado pela ${versao.atoModificador.rotulo}`,
      cor: 'bg-info'
    },
    { rotulo: 'Hoje', detalhe: versao.dataFimVigencia === null ? 'Vigente' : 'Sem vigência', cor: 'bg-ok' }
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-mute">{versao.normaNome}</p>
          <h3 className="font-serif text-2xl font-semibold text-ink mt-0.5">{versao.dispositivoRotulo}</h3>
        </div>
        <span className="tag-ok">Vigente</span>
      </div>

      <ol className="grid grid-cols-3 gap-4 relative">
        <span aria-hidden className="absolute left-0 right-0 top-[7px] h-px bg-line-strong" />
        {pontos.map(p => (
          <li key={p.rotulo} className="relative pt-6">
            <span className={`absolute top-0 left-0 w-3.5 h-3.5 rounded-full ring-4 ring-surface ${p.cor}`} />
            <p className="text-sm font-semibold text-ink">{p.rotulo}</p>
            <p className="text-sm text-ink-soft leading-snug mt-0.5">{p.detalhe}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
        <span className="text-ink-soft">Ver redação em:</span>
        <span className="px-3 py-1.5 rounded-md bg-brand-tint text-brand-text font-medium">Hoje</span>
        <span className="px-3 py-1.5 rounded-md border border-line-strong text-ink-soft">{dataCurta('2020-01-01')}</span>
      </div>
    </div>
  );
}

function VisualTeseMap() {
  const grafo = GRAFOS_PRECEDENTES_CATALOGADOS['tema-1076-stj'];
  const no = (id: string) => grafo.nos.find(n => n.id === id)!;

  // Posições (viewBox 640x300). Colunas: legislação/tese/distinção à esquerda; dispositivos à direita.
  const L = { x: 10, w: 250, h: 62 };
  const R = { x: 380, w: 250, h: 62 };
  const layout: Record<string, { x: number; y: number; w: number; tipo: 'info' | 'warn' | 'ok' | 'rel' }> = {
    'lei-14365': { x: L.x, y: 8, w: L.w, tipo: 'ok' },
    'tema-1076-stj': { x: L.x, y: 118, w: L.w, tipo: 'warn' },
    'distinguishing-fazenda': { x: L.x, y: 228, w: L.w, tipo: 'rel' },
    'cpc-art85-p2': { x: R.x, y: 8, w: R.w, tipo: 'info' },
    'cpc-art85-p8': { x: R.x, y: 173, w: R.w, tipo: 'info' }
  };
  const cor: Record<string, string> = {
    info: 'rgb(var(--info))',
    warn: 'rgb(var(--warn))',
    ok: 'rgb(var(--ok))',
    rel: 'rgb(var(--rel))'
  };
  const arestas = grafo.arestas.filter(a => layout[a.source] && layout[a.target]);
  const centro = (id: string, lado: 'dir' | 'esq') => {
    const n = layout[id];
    return { x: lado === 'dir' ? n.x + n.w : n.x, y: n.y + 31 };
  };

  const textoRelacoes = arestas.map(a => ({
    id: a.id,
    de: no(a.source).label,
    rel: a.label,
    para: no(a.target).label
  }));

  return (
    <div>
      <svg viewBox="0 0 640 300" className="w-full h-auto hidden sm:block" role="img" aria-label="Mapa do Tema 1.076/STJ">
        <defs>
          <marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="rgb(var(--ink-mute))" />
          </marker>
        </defs>
        {arestas.map(a => {
          const origem = layout[a.source];
          const destino = layout[a.target];
          const mesmaColuna = origem.x === destino.x;
          const p1 = mesmaColuna
            ? { x: origem.x + origem.w / 2, y: origem.y + (origem.y < destino.y ? 62 : 0) }
            : centro(a.source, origem.x < destino.x ? 'dir' : 'esq');
          const p2 = mesmaColuna
            ? { x: destino.x + destino.w / 2, y: destino.y + (origem.y < destino.y ? 0 : 62) }
            : centro(a.target, origem.x < destino.x ? 'esq' : 'dir');
          return (
            <line
              key={a.id}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgb(var(--ink-mute))"
              strokeWidth="1.5"
              markerEnd="url(#seta)"
            />
          );
        })}
        {Object.entries(layout).map(([id, p]) => (
          <g key={id}>
            <rect x={p.x} y={p.y} width={p.w} height={62} rx="8" fill="rgb(var(--surface))" stroke="rgb(var(--line-strong))" />
            <rect x={p.x} y={p.y} width="5" height="62" rx="2.5" fill={cor[p.tipo]} />
            <foreignObject x={p.x + 16} y={p.y} width={p.w - 24} height="62">
              <div
                style={{ height: 62, display: 'flex', alignItems: 'center', fontSize: 14, lineHeight: 1.3, fontWeight: 500, color: 'rgb(var(--ink))' }}
              >
                {no(id).label}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>

      <ul className="sm:hidden space-y-3">
        {textoRelacoes.map(r => (
          <li key={r.id} className="text-sm leading-snug text-ink-soft">
            <span className="font-medium text-ink">{r.de}</span> <span className="text-brand-text">{r.rel.toLowerCase()}</span>{' '}
            <span className="font-medium text-ink">{r.para}</span>
          </li>
        ))}
      </ul>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm text-ink-soft">
        {[
          ['bg-warn', 'Precedente vinculante'],
          ['bg-info', 'Dispositivo legal'],
          ['bg-ok', 'Alteração legislativa'],
          ['bg-rel', 'Distinguishing']
        ].map(([c, t]) => (
          <li key={t} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${c}`} /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function VisualPrazoZero() {
  const r = new MotorPrazoZero().calcularPrazo({
    dataEvento: '2026-03-10',
    tipoEvento: 'disponibilizacao_dje',
    diasPrazo: 15,
    tribunalId: 'TJSP',
    nomeAto: 'Apelação Cível'
  });

  const linhas = [
    ['Disponibilização no DJe', r.dataDisponibilizacao!],
    ['Publicação considerada', r.dataPublicacao],
    ['Início da contagem', r.dataTermoInicial]
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-mute">Prazo final</p>
        <p className="font-serif text-4xl sm:text-5xl font-semibold text-ink mt-1 leading-tight sm:leading-none">{dataLonga(r.dataVencimentoFinal)}</p>
        <p className="text-base text-ink-soft mt-2">
          {diaDaSemana(r.dataVencimentoFinal)} · {r.diasTotaisComputados} dias úteis · Apelação Cível · TJSP
        </p>
      </div>

      <dl className="divide-y divide-line border-y border-line">
        {linhas.map(([rotulo, data]) => (
          <div key={rotulo} className="flex items-baseline justify-between py-3">
            <dt className="text-sm text-ink-soft">{rotulo}</dt>
            <dd className="text-base font-medium text-ink num">
              {dataCurta(data)} <span className="text-sm font-normal text-ink-mute">· {diaDaSemana(data)}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-ink-soft">
        Base legal: CPC, arts. 219, 220 e 224. Cada dia contado ou excluído aparece na memória de cálculo.
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <section className="pt-10 sm:pt-16 pb-16 max-w-3xl space-y-6">
        <h1 className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight text-ink leading-[1.05] sm:leading-none">
          Direito, estruturado.
        </h1>
        <p className="text-lg sm:text-xl text-ink-soft leading-relaxed sm:leading-7">
          Ferramentas especializadas para analisar decisões, compreender normas, explorar jurisprudência e calcular
          prazos.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/prazozero" className="btn-primary">
            <span>Calcular prazo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#ferramentas" className="btn-secondary">
            Ver as ferramentas
          </Link>
        </div>
      </section>

      <div id="ferramentas" className="scroll-mt-20">
        <h2 className="sr-only">O que você quer fazer?</h2>

        <Secao
          id="argumenta"
          nome="Argumenta"
          titulo="Entenda como uma decisão foi construída."
          descricao="Decomposição de decisões em teses, premissas e conclusões, com os pontos de atenção da fundamentação."
          cta="Analisar decisão"
          href="/argumenta"
          legenda="Exemplo ilustrativo de análise."
        >
          <VisualArgumenta />
        </Secao>

        <Secao
          id="normaviva"
          nome="NormaViva"
          titulo="Veja a lei como ela realmente vigora."
          descricao="Texto normativo, linha do tempo legislativa e a redação do dispositivo em qualquer data."
          cta="Consultar norma"
          href="/normaviva"
          legenda="Exemplo com dados do módulo."
          invertido
        >
          <VisualNormaViva />
        </Secao>

        <Secao
          id="tesemap"
          nome="TeseMap"
          titulo="Explore como uma tese se conecta à jurisprudência."
          descricao="Precedentes vinculantes, dispositivos legais e distinções reunidos em um mapa navegável."
          cta="Explorar tese"
          href="/tesemap"
          legenda="Exemplo com dados do módulo: Tema 1.076/STJ."
        >
          <VisualTeseMap />
        </Secao>

        <Secao
          id="prazozero"
          nome="PrazoZero"
          titulo="Calcule um prazo e veja exatamente como ele foi contado."
          descricao="Prazo final, base legal e memória de cálculo dia a dia, para conferir cada etapa da contagem."
          cta="Calcular prazo"
          href="/prazozero"
          legenda="Resultado real do cálculo para uma intimação disponibilizada em 10/03/2026."
          invertido
        >
          <VisualPrazoZero />
        </Secao>
      </div>

      <RecentesHome />
    </div>
  );
}
