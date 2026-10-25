'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import Notice from '../../../components/Notice';
import EmptyState from '../../../components/EmptyState';
import { useSessao } from '../../../lib/useSessao';
import { precoEmReais } from '../../../lib/uso';
import { dolares, lerCotacao, margemAposIa, plural, situacaoFundo } from '../../../lib/admin/apresentacao';
import type { ResumoFinanceiro } from '../../../lib/admin/financeiro';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import EstatisticasUso from './EstatisticasUso';
import ContasAdministradas from './ContasAdministradas';

const NOMES = { gratuito: 'Gratuito', essencial: 'Essencial', profissional: 'Profissional', sem_atribuicao: 'Sem atribuição histórica' };

/** A página e cada requisição são autorizadas no servidor. A chave da sessão também retira dados da tela ao trocar de conta. */
export default function PainelAdministrativo() {
  const { usuario, carregando } = useSessao();
  if (carregando) return <p role="status">Verificando a sessão…</p>;
  if (!usuario) return <Notice tom="warn">Entre novamente na sua conta para acessar o painel.</Notice>;
  return <ResumoAdministrativo key={usuario.id} />;
}

function ResumoAdministrativo() {
  const [dados, setDados] = useState<ResumoFinanceiro | null>(null);
  const [pagina, setPagina] = useState(0);
  const [versao, setVersao] = useState(0);
  const [ocupado, setOcupado] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cotacaoTexto, setCotacaoTexto] = useState('');
  const cotacao = lerCotacao(cotacaoTexto);

  useEffect(() => {
    const controle = new AbortController();
    setOcupado(true);
    setDados(null);
    setErro(null);
    void (async () => {
      try {
        const r = await fetch(`/api/admin/financeiro?pagina=${pagina}`, { cache: 'no-store', signal: controle.signal });
        if (r.status === 404) throw new Error('O acesso ao painel não está disponível para esta sessão.');
        if (!r.ok) throw new Error('Não foi possível ler o painel. Confira a configuração e a migração do painel e tente novamente.');
        const resumo = await r.json() as ResumoFinanceiro;
        if (!controle.signal.aborted) setDados(resumo);
      } catch (e) {
        if (!controle.signal.aborted) setErro((e as Error).message);
      } finally {
        if (!controle.signal.aborted) setOcupado(false);
      }
    })();
    return () => controle.abort();
  }, [pagina, versao]);

  const receita = dados?.planos.reduce((s,p) => s + p.receita_centavos, 0) ?? 0;
  const reembolsado = dados?.planos.reduce((s,p) => s + p.reembolsado_centavos, 0) ?? 0;
  const custo = dados?.planos.reduce((s,p) => s + p.custo_real_usd, 0) ?? 0;
  const reservado = dados?.planos.reduce((s,p) => s + p.reservado_usd, 0) ?? 0;
  const semPlano = dados?.planos.find(p => p.plano === 'sem_atribuicao');

  return (
    <div>
      <PageHeader eyebrow="Administração" title="Uso e receita" description="Estatísticas de uso e custos de IA, situação dos fundos e gestão de acesso das contas. Acesso restrito ao responsável."
        actions={<Link href="/meu-espaco" className={buttonVariants({ variant: 'secondary' })}>Meu espaço</Link>} />
      <div className="flex flex-col gap-8">
        <EstatisticasUso />
        <ContasAdministradas />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">{dados ? `Mês de ${new Date(dados.inicio).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })}. Horário de Brasília.` : 'Mês corrente, no horário de Brasília.'}</p>
          <Button type="button" variant="secondary" disabled={ocupado} onClick={() => { setPagina(0); setVersao(v=>v+1); }}>Atualizar painel</Button>
        </div>
        {ocupado && <p role="status" className="text-ink-soft">Carregando painel…</p>}
        {erro && <Notice tom="warn">{erro}</Notice>}
        {dados && <>
          <section aria-label="Totais do mês" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[['Cobranças aprovadas',precoEmReais(receita)],['Reembolsadas',precoEmReais(reembolsado)],['Custo real de IA',dolares(custo)],['Reservas de IA',dolares(reservado)]].map(([titulo,valor]) => (
              <Card key={titulo} className="p-5 flex flex-col gap-2"><h2 className="text-sm text-ink-soft">{titulo}</h2><p className="text-2xl font-semibold text-ink break-words">{valor}</p></Card>
            ))}
          </section>
          <Notice tom="info">
            Receita bruta: cobranças de produção registradas neste mês e atualmente aprovadas. Reembolsadas já estão excluídas da receita e aparecem à parte.
            {' '}Isso não representa o fluxo de caixa. Cobranças de teste aprovadas: {precoEmReais(dados.teste_aprovado_centavos)}, excluídas da receita.
          </Notice>

          <section aria-labelledby="admin-fundos" className="flex flex-col gap-4">
            <h2 id="admin-fundos" className="font-serif text-2xl font-semibold text-ink">Fundos de IA</h2>
            <p className="text-sm text-ink-soft">Custo real é o valor final registrado nas chamadas. Reservas são o custo máximo comprometido, ainda sem confirmação. Os alertas consideram ambos.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dados.fundos.map(f=>{
                const estado = situacaoFundo(f.orcamento_usd,f.custo_real_usd,f.reservado_usd);
                return <Card key={f.fundo} className="p-5 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-ink">{f.fundo === 'gratuito' ? 'Gratuito' : 'Pagantes'}</h3>
                    <Badge variant={estado.situacao === 'esgotado' ? 'danger' : estado.situacao === 'alerta' ? 'warn' : 'ok'}>{estado.situacao === 'esgotado' ? 'Esgotado' : estado.situacao === 'alerta' ? 'Alerta: 80% ou mais' : 'Dentro do limite'}</Badge>
                  </div>
                  <p className="text-sm text-ink-soft">Limite: {dolares(f.orcamento_usd)} · custo real: {dolares(f.custo_real_usd)} · reservas: {dolares(f.reservado_usd)}</p>
                  <div role="progressbar" aria-label={`Fundo ${f.fundo}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100,estado.percentual)} className="h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div className={estado.situacao === 'esgotado' ? 'h-full bg-danger' : 'h-full bg-brand'} style={{width:`${Math.min(100,estado.percentual)}%`}} />
                  </div>
                  <p className="text-sm text-ink-soft">{estado.percentual.toLocaleString('pt-BR',{maximumFractionDigits:1})}% comprometidos. Disponível: {dolares(Math.max(0,f.orcamento_usd-f.custo_real_usd-f.reservado_usd))}.</p>
                </Card>;
              })}
            </div>
          </section>

          <section aria-labelledby="admin-planos" className="flex flex-col gap-4">
            <h2 id="admin-planos" className="font-serif text-2xl font-semibold text-ink">Receita e custo por plano</h2>
            {semPlano && (semPlano.custo_real_usd > 0 || semPlano.reservado_usd > 0 || semPlano.receita_centavos > 0 || semPlano.reembolsado_centavos > 0) && (
              <Notice tom="warn">Há registros sem atribuição histórica de plano. Eles entram nos totais, mas não são distribuídos pelo plano atual das contas. As margens por plano cobrem somente os registros atribuídos.</Notice>
            )}
            <label className="flex flex-col gap-2 max-w-sm text-sm text-ink" htmlFor="admin-cotacao">
              Cotação usada na estimativa (R$ por US$ 1)
              <Input id="admin-cotacao" type="text" inputMode="decimal" value={cotacaoTexto} onChange={e=>setCotacaoTexto(e.target.value)} placeholder="Informe a cotação" aria-describedby="admin-cotacao-ajuda" aria-invalid={!!cotacaoTexto && !cotacao} />
            </label>
            <p id="admin-cotacao-ajuda" className="text-sm text-ink-soft">Cotação manual, não consultada nem guardada. Margem após IA = (receita bruta − custo real de IA convertido) ÷ receita. Não inclui reservas, taxas, impostos ou infraestrutura; não é lucro líquido.</p>
            {cotacaoTexto && !cotacao && <p role="alert" className="text-sm text-danger">Informe um valor maior que zero e de até 1.000, com ponto ou vírgula decimal.</p>}
            <div className="overflow-x-auto max-w-full" tabIndex={0} role="region" aria-label="Valores por plano">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Valores por plano no mês corrente; margens somente dos registros atribuídos.</caption>
                <thead><tr className="border-b border-line text-ink-soft">{['Plano','Aprovadas (R$)','Reembolsadas (R$)','IA (US$)','Reservas (US$)','Saldo após IA (R$)','Margem após IA'].map(t=><th key={t} scope="col" className="py-3 pr-5 font-medium whitespace-nowrap">{t}</th>)}</tr></thead>
                <tbody>{dados.planos.map(p=>{
                  const margem = p.plano === 'sem_atribuicao' ? null : margemAposIa(p.receita_centavos,p.custo_real_usd,cotacao);
                  return <tr key={p.plano} className="border-b border-line text-ink">
                    <th scope="row" className="py-3 pr-5 font-medium whitespace-nowrap">{NOMES[p.plano]}</th>
                    <td className="py-3 pr-5 whitespace-nowrap">{precoEmReais(p.receita_centavos)}</td><td className="py-3 pr-5 whitespace-nowrap">{precoEmReais(p.reembolsado_centavos)}</td>
                    <td className="py-3 pr-5 whitespace-nowrap">{dolares(p.custo_real_usd)}</td><td className="py-3 pr-5 whitespace-nowrap">{dolares(p.reservado_usd)}</td>
                    <td className="py-3 pr-5 whitespace-nowrap">{margem ? precoEmReais(margem.saldoReais*100) : 'Não calculado'}</td>
                    <td className="py-3 whitespace-nowrap">{margem ? `${margem.percentual.toLocaleString('pt-BR',{maximumFractionDigits:2})}%` : 'Não calculada'}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="admin-clientes" className="flex flex-col gap-4">
            <h2 id="admin-clientes" className="font-serif text-2xl font-semibold text-ink">Custo de IA por conta</h2>
            <p className="text-sm text-ink-soft">{dados.total_clientes} {plural(dados.total_clientes, 'conta', 'contas')} com chamadas registradas no mês, excluído o cache. Identificação pelo ID da conta, sem nomes, e-mails ou conteúdo das análises.</p>
            {dados.clientes.length === 0 ? <EmptyState titulo="Nenhuma conta nesta página">Ainda não há uso no período ou a página ficou vazia. Atualize o painel ou volte à página anterior.</EmptyState> : (
              <ul className="divide-y divide-line border-y border-line">{dados.clientes.map(c=><li key={c.usuario_id} className="py-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-6">
                <p className="text-sm text-ink break-all min-w-0">Conta {c.usuario_id}</p><p className="text-sm text-ink-soft shrink-0">Custo real: {dolares(c.custo_real_usd)} · reservas: {dolares(c.reservado_usd)}</p>
              </li>)}</ul>
            )}
            <nav aria-label="Páginas de contas" className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" disabled={ocupado || pagina === 0} onClick={()=>setPagina(p=>p-1)}>Anterior</Button>
              <span className="text-sm text-ink-soft">Página {pagina+1}</span>
              <Button type="button" variant="secondary" disabled={ocupado || (pagina+1)*20 >= dados.total_clientes} onClick={()=>setPagina(p=>p+1)}>Próxima</Button>
            </nav>
          </section>
        </>}
        {!dados && pagina > 0 && !ocupado && <Button type="button" variant="secondary" onClick={()=>setPagina(p=>p-1)}>Voltar à página anterior</Button>}
      </div>
    </div>
  );
}
