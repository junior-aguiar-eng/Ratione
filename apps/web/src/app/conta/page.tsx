'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, LogOut } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import EmptyState from '../../components/EmptyState';
import { obterSupabase } from '../../lib/supabase/client';
import { useSessao } from '../../lib/useSessao';
import { traduzirErroAuth } from '../../lib/erros-auth';
import { TRIBUNAIS_BRASIL } from '@ratione/core';

const PROFISSOES = [
  ['', 'Prefiro não informar'],
  ['advogado', 'Advogado(a)'],
  ['magistrado', 'Magistrado(a)'],
  ['servidor', 'Servidor(a) da Justiça'],
  ['estudante', 'Estudante de Direito'],
  ['concurseiro', 'Concurseiro(a)'],
  ['outro', 'Outro']
] as const;

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

interface Perfil {
  nome: string;
  profissao: string;
  oab: string;
  tribunal_padrao: string;
  uf_padrao: string;
}

const VAZIO: Perfil = { nome: '', profissao: '', oab: '', tribunal_padrao: '', uf_padrao: '' };

export default function ContaPage() {
  const router = useRouter();
  const { usuario, carregando, contaDisponivel } = useSessao();
  const [perfil, setPerfil] = useState<Perfil>(VAZIO);
  const [mensagem, setMensagem] = useState<{ tom: 'info' | 'danger'; texto: string } | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (!carregando && !usuario) router.replace('/entrar');
  }, [carregando, usuario, router]);

  useEffect(() => {
    const sb = obterSupabase();
    if (!sb || !usuario) return;
    sb.from('perfis')
      .select('nome, profissao, oab, tribunal_padrao, uf_padrao')
      .eq('id', usuario.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPerfil({
            nome: data.nome ?? '',
            profissao: data.profissao ?? '',
            oab: data.oab ?? '',
            tribunal_padrao: data.tribunal_padrao ?? '',
            uf_padrao: data.uf_padrao ?? ''
          });
        }
      });
  }, [usuario]);

  const aviso = (tom: 'info' | 'danger', texto: string) => setMensagem({ tom, texto });

  const salvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = obterSupabase();
    if (!sb || !usuario) return;
    setOcupado(true);
    const { error } = await sb
      .from('perfis')
      .update({
        nome: perfil.nome.trim() || null,
        profissao: perfil.profissao || null,
        oab: perfil.oab.trim() || null,
        tribunal_padrao: perfil.tribunal_padrao || null,
        uf_padrao: perfil.uf_padrao || null
      })
      .eq('id', usuario.id);
    setOcupado(false);
    if (error) aviso('danger', 'Não foi possível salvar o perfil. Confira os campos e tente de novo.');
    else aviso('info', 'Perfil salvo.');
  };

  const trocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = obterSupabase();
    if (!sb) return;
    if (novaSenha.length < 8) return aviso('danger', 'A senha precisa ter pelo menos 8 caracteres.');
    setOcupado(true);
    const { error } = await sb.auth.updateUser({ password: novaSenha });
    setOcupado(false);
    if (error) aviso('danger', traduzirErroAuth(error.message));
    else {
      setNovaSenha('');
      aviso('info', 'Senha alterada.');
    }
  };

  const sair = async () => {
    await obterSupabase()?.auth.signOut();
    router.replace('/');
  };

  const exportar = async () => {
    const sb = obterSupabase();
    if (!sb || !usuario) return;
    const [{ data: perfilBd }, { data: itens }] = await Promise.all([
      sb.from('perfis').select('*').eq('id', usuario.id).maybeSingle(),
      sb.from('itens_salvos').select('*').order('criado_em', { ascending: false })
    ]);
    const conteudo = JSON.stringify({ exportadoEm: new Date().toISOString(), email: usuario.email, perfil: perfilBd, itensSalvos: itens }, null, 2);
    const blob = new Blob([conteudo], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ratione-meus-dados.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const apagarItens = async () => {
    const sb = obterSupabase();
    if (!sb || !usuario) return;
    if (!window.confirm('Apagar TODOS os registros salvos na sua conta? Isso não pode ser desfeito.')) return;
    const { error } = await sb.from('itens_salvos').delete().eq('usuario_id', usuario.id);
    if (error) aviso('danger', 'Não foi possível apagar os registros.');
    else aviso('info', 'Todos os registros salvos na conta foram apagados.');
  };

  if (!carregando && !contaDisponivel) {
    return (
      <div>
        <PageHeader eyebrow="Conta" title="Minha conta" />
        <EmptyState titulo="Conta indisponível nesta instalação">O login ainda não está configurado neste ambiente.</EmptyState>
      </div>
    );
  }
  if (carregando || !usuario) return null;

  const tribunais = Object.values(TRIBUNAIS_BRASIL);

  return (
    <div>
      <PageHeader eyebrow="Conta" title="Minha conta" description={usuario.email ?? undefined} />

      <div className="max-w-xl space-y-12">
        <div aria-live="polite">
          {mensagem && (
            <Notice tom={mensagem.tom === 'danger' ? 'danger' : 'info'} titulo={mensagem.tom === 'danger' ? 'Atenção' : undefined}>
              {mensagem.texto}
            </Notice>
          )}
        </div>

        <form onSubmit={salvarPerfil} className="card p-6 space-y-5" aria-label="Perfil">
          <h2 className="font-serif text-xl font-semibold text-ink">Perfil</h2>
          <div>
            <label htmlFor="nome" className="label">
              Nome
            </label>
            <input id="nome" maxLength={200} value={perfil.nome} onChange={e => setPerfil({ ...perfil, nome: e.target.value })} className="field" />
          </div>
          <div>
            <label htmlFor="profissao" className="label">
              Atuação
            </label>
            <select id="profissao" value={perfil.profissao} onChange={e => setPerfil({ ...perfil, profissao: e.target.value })} className="field">
              {PROFISSOES.map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="oab" className="label">
              OAB (declaratória)
            </label>
            <input id="oab" maxLength={30} value={perfil.oab} onChange={e => setPerfil({ ...perfil, oab: e.target.value })} className="field" />
            <p className="text-sm text-ink-mute mt-1.5">Informação declarada por você; o Ratione não a verifica.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tribunal" className="label">
                Tribunal padrão
              </label>
              <select id="tribunal" value={perfil.tribunal_padrao} onChange={e => setPerfil({ ...perfil, tribunal_padrao: e.target.value })} className="field">
                <option value="">Nenhum</option>
                {tribunais.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.sigla}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="uf" className="label">
                UF
              </label>
              <select id="uf" value={perfil.uf_padrao} onChange={e => setPerfil({ ...perfil, uf_padrao: e.target.value })} className="field">
                <option value="">Nenhuma</option>
                {UFS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={ocupado} className="btn-primary disabled:opacity-60">
            Salvar perfil
          </button>
        </form>

        <form onSubmit={trocarSenha} className="card p-6 space-y-5" aria-label="Alterar senha">
          <h2 className="font-serif text-xl font-semibold text-ink">Alterar senha</h2>
          <div>
            <label htmlFor="nova-senha" className="label">
              Nova senha
            </label>
            <input
              id="nova-senha"
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              className="field"
            />
          </div>
          <button type="submit" disabled={ocupado} className="btn-secondary disabled:opacity-60">
            Alterar senha
          </button>
        </form>

        <section className="space-y-4" aria-labelledby="dados">
          <h2 id="dados" className="font-serif text-xl font-semibold text-ink">
            Seus dados (LGPD)
          </h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            Você pode baixar tudo o que o Ratione guarda sobre você ou apagar seus registros salvos. A exclusão completa da conta pela própria
            tela ainda não está disponível; as regras de retenção e exclusão estão na{' '}
            <Link href="/privacidade" className="underline underline-offset-2">
              Política de privacidade
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportar} className="btn-secondary">
              <Download className="w-4 h-4" />
              Baixar meus dados
            </button>
            <button type="button" onClick={apagarItens} className="btn-secondary">
              Apagar meus registros salvos
            </button>
          </div>
        </section>

        <button type="button" onClick={sair} className="btn-secondary">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
