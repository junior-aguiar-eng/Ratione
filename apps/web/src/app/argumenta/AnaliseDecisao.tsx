'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, FileDown, Loader2, Sparkles } from 'lucide-react';
import { LIMITE_CARACTERES_DECISAO, MAX_PARAGRAFOS, prepararDecisao, restaurar, type DecisaoPreparada } from '@ratione/argumenta';
import Notice from '../../components/Notice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CartaoDeIA, CartaoDeLeitura } from '../../components/Cartoes';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input, campoClasses } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSessao } from '../../lib/useSessao';
import { obterSupabase } from '../../lib/supabase/client';
import { dataCurta } from '../../lib/uso';
import type { SaidaEstrutura, SaidaFundamentos, SaidaQuestoes } from '../../lib/ia/tarefas/argumenta';
import { listarNormas } from '../../lib/normaviva';
import { bancoSupabase, verificarCitacoes, type VerificacaoDaCitacao } from '../../lib/argumenta/verificarCitacoes';
import { montarMapa } from '../../lib/argumenta/mapa';
import { CATEGORIA, FUNDAMENTO, RESULTADO, TIPO_DECISAO } from '../../lib/argumenta/rotulos';
import PrazoDoCaso from '../../components/PrazoDoCaso';
import { guardarCaso, lerCaso, limparCaso, type Resultados } from '../../lib/caso/memoria';
import { lerQuestaoDoCaso } from '../../lib/caso/ligacao';
import MapaView from './MapaView';
import SeloCitacao from './SeloCitacao';
import SugeridosDaQuestao from './SugeridosDaQuestao';
import DocumentoImpresso from './DocumentoImpresso';
import { montarDocumento, nomeDoArquivo } from '../../lib/argumenta/documento';
import { baixarDocx } from '../../lib/argumenta/baixarDocx';
import { exportarPdf } from '../../lib/imprimir';
import { referenciaVisual } from './referencias';

/**
 * Análise de decisão colada (F5-03, etapas 1 a 4). O texto é segmentado e pseudonimizado aqui, no navegador; só os parágrafos com
 * marcadores vão ao servidor, e a tabela de troca nunca sai desta tela. As três tarefas do catálogo de IA (`argumenta-estrutura`,
 * `argumenta-questoes`, `argumenta-fundamentos`) rodam uma depois da outra, só quando a pessoa logada clica. Nada fica guardado.
 */

type Etapa = 'estrutura' | 'questoes' | 'fundamentos';

const ETAPAS: { id: Etapa; rotulo: string }[] = [
  { id: 'estrutura', rotulo: 'Identificando a estrutura da decisão' },
  { id: 'questoes', rotulo: 'Identificando as questões e as conclusões' },
  { id: 'fundamentos', rotulo: 'Identificando os fundamentos de cada conclusão' }
];

const SECAO: Record<SaidaEstrutura['secoes'][number]['tipo'], string> = {
  cabecalho: 'Cabeçalho',
  ementa: 'Ementa',
  relatorio: 'Relatório',
  preliminares: 'Preliminares',
  fundamentacao: 'Fundamentação',
  dispositivo: 'Dispositivo',
  outro: 'Outro trecho'
};

/** Erro do servidor com o motivo, para a tela decidir se pode tentar de novo. */
class ErroDeAnalise extends Error {
  constructor(
    mensagem: string,
    readonly motivo?: string
  ) {
    super(mensagem);
  }
}

async function enviar(url: string, corpo: unknown): Promise<Record<string, any>> {
  let r: Response;
  try {
    r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  } catch {
    throw new ErroDeAnalise('Sem conexão. Tente de novo.');
  }
  const resposta = await r.json().catch(() => ({}));
  if (!r.ok) throw new ErroDeAnalise(resposta.mensagem ?? 'A análise por IA falhou agora.', resposta.motivo);
  return resposta;
}

const pedir = async (etapa: Etapa, entrada: unknown): Promise<unknown> => (await enviar(`/api/ia/argumenta-${etapa}`, { entrada })).resposta;

/** O que o plano do usuário ainda permite de análises rápidas no período (função `uso_resumo` do banco; só lê o próprio uso). */
interface UsoRapida {
  plano: string;
  quantidade: number;
  restantes: number;
  renovaEm: string;
}


/** No computador (largura de 1024 px ou mais) o texto da decisão fica ao lado da análise; no celular, recolhido. */
const textoAbreAoLado = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

export default function AnaliseDecisao() {
  const { usuario, carregando, contaDisponivel } = useSessao();
  // Voltando de outra ferramenta (citação aberta no NormaViva ou no TeseMap), a análise reaparece: ela fica só na memória desta aba
  const [memoria] = useState(lerCaso);
  const [texto, setTexto] = useState('');
  const [extras, setExtras] = useState('');
  const [enviada, setEnviada] = useState<DecisaoPreparada | null>(memoria?.enviada ?? null);
  const [resultados, setResultados] = useState<Resultados>(memoria?.resultados ?? {});
  const [andamento, setAndamento] = useState<Etapa | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState(memoria?.aba ?? 'geral');
  const [ativos, setAtivos] = useState<number[]>([]);
  const [textoAberto, setTextoAberto] = useState(false);
  const [analiseId, setAnaliseId] = useState<string | null>(memoria?.analiseId ?? null);
  const [encerrada, setEncerrada] = useState(false);
  const [rotulo, setRotulo] = useState(memoria?.rotulo ?? '');
  const [uso, setUso] = useState<UsoRapida | null>(null);
  const [erroDoArquivo, setErroDoArquivo] = useState<string | null>(null);
  const [selos, setSelos] = useState<Map<string, VerificacaoDaCitacao>>(() => memoria?.selos ?? new Map());
  // F5-03: o mapa é montado por código com o que as etapas 2 e 4 já trouxeram; não chama o modelo
  const mapa = useMemo(() => (resultados.questoes ? montarMapa(resultados.questoes, resultados.fundamentos) : null), [resultados.questoes, resultados.fundamentos]);
  const listaRef = useRef<HTMLDivElement | null>(null);

  const preparo = useMemo(() => prepararDecisao(texto, extras.split('\n')), [texto, extras]);
  const vazio = preparo.paragrafos.length === 0 || !texto.trim();
  const longo = preparo.caracteres > LIMITE_CARACTERES_DECISAO || preparo.paragrafos.length > MAX_PARAGRAFOS;

  // Só abre a decisão quando a pessoa pede o texto; referências abrem e rolam até os trechos citados.
  useEffect(() => {
    if (!textoAberto || ativos.length === 0 || !listaRef.current) return;
    listaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const el = listaRef.current.querySelector<HTMLElement>(`[data-paragrafo="${ativos[0]}"]`);
    if (el) listaRef.current.scrollTo({ top: Math.max(el.offsetTop - 8, 0), behavior: 'smooth' });
  }, [ativos, textoAberto]);

  // F5-04: confere as citações no corpus público. Sai da página só a citação ("CDC, art. 14"), nunca o texto da decisão.
  const fundamentosProntos = resultados.fundamentos;
  useEffect(() => {
    // Análise que voltou da memória já traz os selos conferidos: não confere de novo
    if (fundamentosProntos && fundamentosProntos === memoria?.resultados.fundamentos && memoria.selos.size > 0) return;
    setSelos(new Map());
    const sb = obterSupabase();
    if (!fundamentosProntos || !sb) return;
    let ativa = true;
    void (async () => {
      try {
        const normas = (await listarNormas(sb)).map(n => n.id);
        const confirmadas = await verificarCitacoes(fundamentosProntos.fundamentos.map(f => f.citacao), normas, bancoSupabase(sb));
        if (ativa) setSelos(confirmadas);
      } catch {
        /* sem selo: a tela não afirma nada sobre a citação */
      }
    })();
    return () => {
      ativa = false;
    };
  }, [fundamentosProntos, memoria]);

  // A análise aberta fica na memória da aba, para as outras ferramentas mostrarem a relação com o caso e para a pessoa voltar a ela
  useEffect(() => {
    if (enviada) guardarCaso({ enviada, resultados, analiseId, rotulo, selos, aba });
    else limparCaso();
  }, [enviada, resultados, analiseId, rotulo, selos, aba]);

  // "Voltar à análise" (?caso=Q2): abre a aba das questões e rola até a questão de origem
  const voltouParaQuestao = useRef<string | null>(null);
  useEffect(() => {
    if (!memoria || voltouParaQuestao.current !== null) return;
    const q = lerQuestaoDoCaso(window.location.search);
    voltouParaQuestao.current = q ?? '';
    if (!q) return;
    setAba('questoes');
    requestAnimationFrame(() => document.getElementById(`questao-${q}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [memoria]);

  // O que resta da cota do plano: lido ao abrir e sempre que o formulário volta (depois de uma análise)
  const usuarioId = usuario?.id;
  useEffect(() => {
    if (!usuarioId || enviada) return;
    let ativa = true;
    void (async () => {
      const sb = obterSupabase();
      if (!sb) return;
      const { data, error } = await sb.rpc('uso_resumo');
      if (!ativa || error || !Array.isArray(data)) return;
      const l = data.find((x: { tipo: string }) => x.tipo === 'rapida');
      if (l) setUso({ plano: l.plano_nome, quantidade: l.quantidade, restantes: l.restantes, renovaEm: l.fim });
    })();
    return () => {
      ativa = false;
    };
  }, [usuarioId, enviada]);

  if (process.env.NEXT_PUBLIC_IA_EXPLICACAO !== 'sim' || (!carregando && !contaDisponivel)) {
    return (
      <Notice tom="info" titulo="Análise de decisões">
        A análise de decisões não está habilitada nesta instalação.
      </Notice>
    );
  }

  /**
   * Roda as etapas que faltam. A análise é iniciada UMA vez (aqui a cota do plano é conferida) e as três etapas carregam o mesmo
   * `analiseId`; "Tentar de novo" continua a mesma análise, sem gastar outra. Falha não consome a cota.
   */
  const executar = async (decisao: DecisaoPreparada, atuais: Resultados, analiseAtual: string | null) => {
    setErro(null);
    let feitos = { ...atuais };
    let id = analiseAtual;
    try {
      if (!id) {
        setAndamento('estrutura');
        const inicio = await enviar('/api/analises', { tipo: 'rapida', rotulo: rotulo.trim() || undefined, paragrafos: decisao.paragrafos.length });
        id = inicio.analiseId as string;
        setAnaliseId(id);
        setUso(u => (u ? { ...u, restantes: inicio.restantes, renovaEm: inicio.renovaEm } : u));
      }
      const base = { analiseId: id, paragrafos: decisao.paragrafos };
      if (!feitos.estrutura) {
        setAndamento('estrutura');
        feitos = { ...feitos, estrutura: (await pedir('estrutura', base)) as SaidaEstrutura };
        setResultados(feitos);
      }
      if (!feitos.questoes) {
        setAndamento('questoes');
        feitos = { ...feitos, questoes: (await pedir('questoes', base)) as SaidaQuestoes };
        setResultados(feitos);
      }
      if (!feitos.fundamentos) {
        setAndamento('fundamentos');
        const questoes = feitos.questoes!.questoes.map(q => ({ id: q.id, enunciado: q.enunciado, conclusao: q.conclusao }));
        feitos = { ...feitos, fundamentos: (await pedir('fundamentos', { ...base, questoes })) as SaidaFundamentos };
        setResultados(feitos);
      }
    } catch (e) {
      setErro((e as Error).message);
      // Análise que o servidor encerrou (falhas sem solução, estornada): não adianta tentar de novo, só começar outra
      if (e instanceof ErroDeAnalise && e.motivo === 'analise_invalida') setEncerrada(true);
    } finally {
      setAndamento(null);
    }
  };

  const analisar = () => {
    setEnviada(preparo);
    setResultados({});
    setAnaliseId(null);
    setEncerrada(false);
    setAba('geral');
    setAtivos([]);
    setTextoAberto(textoAbreAoLado());
    void executar(preparo, {}, null);
  };

  const novaAnalise = () => {
    setEnviada(null);
    setResultados({});
    setAnaliseId(null);
    setEncerrada(false);
    setErro(null);
    setAtivos([]);
    setTextoAberto(false);
  };

  // Formulário
  if (!enviada) {
    const trocados = preparo.substituicoes.length;
    return (
      <Card className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-semibold text-ink">Analisar uma decisão</h2>
          <p className="text-base text-ink-soft">
            Cole o texto de uma sentença, acórdão ou decisão. O Argumenta identifica a estrutura, as questões resolvidas, as conclusões e os
            fundamentos de cada uma, com acesso aos trechos correspondentes da decisão.
          </p>
        </div>

        <div>
          <Label htmlFor="argumenta-texto">Texto da decisão</Label>
          <textarea
            id="argumenta-texto"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={12}
            placeholder="Cole aqui o texto da decisão (copiado do PDF ou do editor de texto)."
            aria-describedby="argumenta-tamanho"
            aria-invalid={longo || undefined}
            className={`${campoClasses} font-serif text-[15px] leading-relaxed resize-y`}
          />
          <p id="argumenta-tamanho" className={`mt-1.5 text-sm ${longo ? 'text-danger-text' : 'text-ink-mute'}`}>
            {vazio
              ? `Até cerca de 20 páginas (${LIMITE_CARACTERES_DECISAO.toLocaleString('pt-BR')} caracteres).`
              : `${preparo.paragrafos.length} ${preparo.paragrafos.length === 1 ? 'parágrafo' : 'parágrafos'} · ${preparo.caracteres.toLocaleString('pt-BR')} de ${LIMITE_CARACTERES_DECISAO.toLocaleString('pt-BR')} caracteres${
                  longo ? '. O texto passou do limite: analise uma parte menor (por exemplo, sem o relatório).' : ''
                }`}
          </p>
        </div>

        <div>
          <Label htmlFor="argumenta-rotulo">Nome da análise (opcional)</Label>
          <Input
            id="argumenta-rotulo"
            value={rotulo}
            onChange={e => setRotulo(e.target.value)}
            maxLength={80}
            placeholder="Ex.: Cobrança de serviços, 1ª instância"
            aria-describedby="argumenta-rotulo-ajuda"
          />
          <p id="argumenta-rotulo-ajuda" className="mt-1.5 text-sm text-ink-mute">
            Aparece só no seu histórico de uso. Não coloque nomes das partes nem números de processo.
          </p>
        </div>

        <details className="group text-sm">
          <summary className="w-fit cursor-pointer text-brand-text hover:underline underline-offset-2">
            {trocados === 0 ? 'Conferir o que será enviado e ocultar nomes' : `${trocados} ${trocados === 1 ? 'dado pessoal trocado' : 'dados pessoais trocados'} por marcadores · conferir e ocultar nomes`}
          </summary>
          <div className="mt-3 flex flex-col gap-4 border-l-2 border-line pl-4">
            <p className="text-sm text-ink-soft">
              Antes de sair do seu navegador, nomes das partes e dos advogados, CPF, CNPJ, RG, OAB, número do processo, endereço, CEP, telefone e
              e-mail são trocados por marcadores como [PARTE_1]. Os dados reais voltam só nesta tela. A detecção usa padrões e rótulos (como
              &ldquo;Autor:&rdquo;): confira abaixo e acrescente outros nomes, se faltar algum.
            </p>
            {trocados > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {preparo.substituicoes.map(s => (
                  <li key={s.marcador} className="flex gap-2 min-w-0">
                    <span className="font-mono text-ink-soft shrink-0">{s.marcador}</span>
                    <span className="text-ink truncate">{s.original}</span>
                  </li>
                ))}
              </ul>
            )}
            <div>
              <Label htmlFor="argumenta-extras">Outros nomes a ocultar (um por linha)</Label>
              <textarea
                id="argumenta-extras"
                value={extras}
                onChange={e => setExtras(e.target.value)}
                rows={3}
                className={`${campoClasses} resize-y`}
              />
            </div>
            {!vazio && (
              <details>
                <summary className="cursor-pointer text-sm text-brand-text">Conferir o texto preparado para análise</summary>
                <div className="mt-2 max-h-72 overflow-y-auto flex flex-col gap-3 text-sm text-ink-soft">
                  {preparo.paragrafos.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </details>
            )}
          </div>
        </details>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={analisar} disabled={!usuario || vazio || longo || uso?.restantes === 0}>
            <Sparkles className="w-4 h-4" />
            Analisar decisão
          </Button>
          {!carregando && !usuario && (
            <span className="text-sm text-ink-soft">
              <Link href="/entrar" className="text-brand-text underline underline-offset-2">
                Entre na sua conta
              </Link>{' '}
              para analisar uma decisão.
            </span>
          )}
        </div>
        {uso && (
          <p className={`text-sm ${uso.restantes === 0 ? 'text-danger-text' : 'text-ink-soft'}`} aria-live="polite">
            {uso.restantes === 0
              ? `Você usou todas as ${uso.quantidade} análises rápidas do plano ${uso.plano} neste período. A cota renova em ${dataCurta(uso.renovaEm)}.`
              : `Esta análise usa 1 das suas ${uso.restantes} análises rápidas restantes (de ${uso.quantidade}, plano ${uso.plano}), até ${dataCurta(uso.renovaEm)}. Se a análise falhar, a cota não é gasta.`}{' '}
            <Link href="/meu-espaco/uso" className="text-brand-text underline underline-offset-2">
              Ver meu uso
            </Link>
          </p>
        )}
        <p className="text-sm text-ink-mute">Nada do texto nem da resposta fica guardado no Ratione. A análise fica só nesta aba do navegador e se perde ao fechá-la ou recarregar a página. O histórico guarda só informações de uso e o tamanho da decisão.</p>
      </Card>
    );
  }

  // Análise
  const r = (s: string) => restaurar(s, enviada.substituicoes);
  const { estrutura, questoes, fundamentos } = resultados;
  const ref = (numeros: readonly number[]) => {
    if (numeros.length === 0) return null;
    const referencia = referenciaVisual(numeros);
    return (
      <button
        type="button"
        onClick={() => {
          setTextoAberto(true);
          setAtivos(referencia.trechos);
        }}
        aria-label={referencia.descricao}
        className="text-sm text-brand-text hover:underline underline-offset-2"
      >
        {referencia.rotulo}
      </button>
    );
  };

  const documento = estrutura
    ? montarDocumento({ estrutura, questoes, fundamentos, selos, restaurar: r, geradoEm: new Date().toLocaleDateString('pt-BR') })
    : null;
  const hoje = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const baixarWord = async () => {
    if (!documento) return;
    setErroDoArquivo(null);
    try {
      await baixarDocx(documento, nomeDoArquivo(hoje()));
    } catch {
      setErroDoArquivo('Não foi possível gerar o arquivo Word agora. Tente o PDF ou tente de novo.');
    }
  };

  return (
    <>
    <div className="flex flex-col gap-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold text-ink">Sua decisão</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" type="button" onClick={() => setTextoAberto(aberto => !aberto)} aria-expanded={textoAberto} aria-controls="texto-da-decisao">
            {textoAberto ? 'Ocultar texto' : 'Consultar texto da decisão'}
            <ChevronDown className={`w-4 h-4 transition-transform ${textoAberto ? 'rotate-180' : ''}`} aria-hidden />
          </Button>
          {documento && (
            <>
              <Button variant="secondary" type="button" onClick={() => void baixarWord()} disabled={andamento !== null}>
                <FileDown className="w-4 h-4" aria-hidden />
                Baixar em Word
              </Button>
              <Button variant="secondary" type="button" onClick={() => exportarPdf(nomeDoArquivo(hoje()))} disabled={andamento !== null}>
                <FileDown className="w-4 h-4" aria-hidden />
                Salvar em PDF
              </Button>
            </>
          )}
          <Button variant="secondary" type="button" onClick={novaAnalise} disabled={andamento !== null}>
            Nova análise
          </Button>
        </div>
      </div>

      {erroDoArquivo && (
        <p className="text-sm text-danger-text" role="alert">
          {erroDoArquivo}
        </p>
      )}

      {estrutura && <PrazoDoCaso />}

      {(andamento || erro) && (
        <Card className="p-5 flex flex-col gap-3" aria-live="polite">
          <ol className="flex flex-col gap-1.5 text-sm">
            {ETAPAS.map(e => {
              const pronta = !!resultados[e.id];
              const atual = andamento === e.id;
              return (
                <li key={e.id} className={`flex items-center gap-2 ${pronta || atual ? 'text-ink' : 'text-ink-mute'}`}>
                  {pronta ? (
                    <Check className="w-4 h-4 text-ok-text" aria-hidden />
                  ) : atual ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  ) : (
                    <span className="w-4 h-4" aria-hidden />
                  )}
                  {e.rotulo}
                  {atual && '…'}
                </li>
              );
            })}
          </ol>
          {erro && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-danger-text">{erro}</p>
              {!encerrada && (
                <Button variant="secondary" type="button" onClick={() => void executar(enviada, resultados, analiseId)}>
                  Tentar de novo
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <CartaoDeLeitura className={`${textoAberto ? 'lg:col-span-5 lg:sticky lg:top-24' : 'hidden'} overflow-hidden p-0 gap-0`} id="texto-da-decisao" aria-label="Texto completo da decisão">
          <h3 className="px-5 py-3 text-sm font-semibold text-ink border-b border-line bg-surface-2">Texto completo da decisão</h3>
          <div ref={listaRef} className="relative max-h-[560px] overflow-y-auto px-5 py-4 space-y-3">
            {enviada.paragrafos.map((p, i) => (
              <p
                key={i}
                data-paragrafo={i + 1}
                className={`rounded-sm px-3 py-2 font-serif text-[15px] leading-relaxed text-ink ${ativos.includes(i + 1) ? 'bg-brand-tint border-l-[3px] border-brand' : ''}`}
              >
                {r(p)}
              </p>
            ))}
          </div>
        </CartaoDeLeitura>

        <div className={`${textoAberto ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col gap-6 min-w-0`}>
          {!estrutura ? (
            <p className="text-base text-ink-soft">{erro ? 'A análise não foi concluída.' : 'Preparando a análise…'}</p>
          ) : (
            <CartaoDeIA titulo="Análise por IA" deslocado={false} className="p-5 sm:p-6 gap-5" meta="Gerada só a partir do texto colado">
            <Tabs value={aba} onValueChange={setAba} className="gap-8">
              <TabsList aria-label="Seções da análise">
                <TabsTrigger value="geral">Visão geral</TabsTrigger>
                <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
                <TabsTrigger value="questoes" disabled={!questoes}>
                  Questões e fundamentos
                  {questoes && <Badge className="px-1.5">{questoes.questoes.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="mapa" disabled={!questoes}>
                  Mapa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="flex flex-col gap-8">
                <section className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="brand">{TIPO_DECISAO[estrutura.tipo]}</Badge>
                    <span className="text-base font-medium text-ink">{r(estrutura.resultado)}</span>
                  </div>
                  <p className="text-base text-ink-soft leading-relaxed">{r(estrutura.resumo)}</p>
                </section>
                {estrutura.pedidos.length > 0 && (
                  <section className="border-t border-line pt-6 flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-ink">Pedidos</h3>
                    <ul className="flex flex-col gap-2">
                      {estrutura.pedidos.map((p, i) => (
                        <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 text-base text-ink-soft">
                          <span>{r(p.descricao)}</span>
                          {ref(p.paragrafos)}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="estrutura">
                <ol className="divide-y divide-line border-y border-line">
                  {[...estrutura.secoes]
                    .sort((a, b) => a.inicio - b.inicio)
                    .map((s, i) => (
                      <li key={i} className="flex items-baseline justify-between gap-4 py-3">
                        <span className="text-base font-medium text-ink">{SECAO[s.tipo]}</span>
                        {ref(Array.from({ length: s.fim - s.inicio + 1 }, (_, k) => s.inicio + k))}
                      </li>
                    ))}
                </ol>
              </TabsContent>

              <TabsContent value="questoes" className="flex flex-col gap-10">
                {questoes?.questoes.map((q, i) => {
                  const desta = fundamentos?.fundamentos.filter(f => f.questao === q.id) ?? [];
                  return (
                    <section key={q.id} id={`questao-${q.id}`} className={`scroll-mt-24 flex flex-col gap-4 ${i > 0 ? 'border-t border-line pt-8' : ''}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="eyebrow">
                          Questão {i + 1} · {CATEGORIA[q.categoria]}
                        </span>
                        <Badge variant={RESULTADO[q.resultado].tom}>{RESULTADO[q.resultado].rotulo}</Badge>
                        {ref(q.paragrafos)}
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-ink leading-snug">{r(q.enunciado)}</h3>
                      <div className="flex flex-col gap-1">
                        <p className="text-base text-ink">
                          <span className="font-medium">Conclusão: </span>
                          {r(q.conclusao)}
                        </p>
                        {ref(q.paragrafosConclusao)}
                      </div>
                      {fundamentos ? (
                        desta.length > 0 ? (
                          <ul className="flex flex-col gap-3">
                            {desta.map((f, k) => (
                              <li key={k} className="flex gap-3">
                                <Badge variant={FUNDAMENTO[f.tipo].tom} className="w-24 justify-center self-start shrink-0">
                                  {FUNDAMENTO[f.tipo].rotulo}
                                </Badge>
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-base text-ink leading-snug">{r(f.descricao)}</p>
                                  <div className="flex flex-wrap items-baseline gap-x-3">
                                    {f.citacao && <span className="text-sm text-ink-soft">{r(f.citacao)}</span>}
                                    {ref(f.paragrafos)}
                                  </div>
                                  {selos.get(f.citacao.trim()) && <SeloCitacao verificacao={selos.get(f.citacao.trim())!} questaoId={q.id} />}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-ink-mute">Nenhum fundamento identificado para esta questão.</p>
                        )
                      ) : (
                        andamento === 'fundamentos' && <p className="text-sm text-ink-mute">Identificando os fundamentos…</p>
                      )}
                      <SugeridosDaQuestao
                        questaoId={q.id}
                        links={desta.flatMap(f => {
                          const selo = selos.get(f.citacao.trim());
                          return selo?.estado === 'encontrada' ? selo.links : [];
                        })}
                      />
                    </section>
                  );
                })}
              </TabsContent>

              <TabsContent value="mapa" className="flex flex-col gap-10">
                {mapa && (
                  <MapaView
                    mapa={mapa}
                    selos={selos}
                    r={r}
                    ref_={ref}
                    carregandoFundamentos={!fundamentos && andamento === 'fundamentos'}
                    fundamentosProntos={!!fundamentos}
                  />
                )}
              </TabsContent>
            </Tabs>
            <p className="text-xs text-ink-soft leading-relaxed border-t border-ia/20 pt-3">
              Gerada por IA só a partir do texto colado, sem consultar leis, jurisprudência ou outras fontes. Pode conter erro: confira os pontos no texto da decisão usando “Ver no texto”. Os dados pessoais foram trocados por marcadores antes do envio. Nada do texto nem da análise fica guardado no Ratione; ela fica só nesta aba e se perde ao fechá-la ou recarregar a página.
            </p>
            </CartaoDeIA>
          )}
        </div>
      </div>
    </div>
    {documento && <DocumentoImpresso documento={documento} />}
    </>
  );
}
