'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { cardClasses } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  const avisoRef = useRef<HTMLDivElement>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  // Confirmação na própria página: `window.confirm` é bloqueado em navegadores embutidos e devolve "cancelar" sem mostrar nada
  const [confirmando, setConfirmando] = useState<'itens' | 'conta' | null>(null);

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

  // O aviso fica no topo da página: sem rolar até ele, quem age num formulário mais abaixo não vê o resultado
  const aviso = (tom: 'info' | 'danger', texto: string) => {
    setMensagem({ tom, texto });
    requestAnimationFrame(() => avisoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

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
    const [{ data: perfilBd }, { data: itens }, { data: avisos }] = await Promise.all([
      sb.from('perfis').select('*').eq('id', usuario.id).maybeSingle(),
      sb.from('itens_salvos').select('*').order('criado_em', { ascending: false }),
      sb.from('lembretes_prazo').select('*').order('vencimento', { ascending: true })
    ]);
    const conteudo = JSON.stringify(
      { exportadoEm: new Date().toISOString(), email: usuario.email, perfil: perfilBd, itensSalvos: itens, avisosPorEmail: avisos },
      null,
      2
    );
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
    setConfirmando(null);
    const [itens, avisos] = await Promise.all([
      sb.from('itens_salvos').delete().eq('usuario_id', usuario.id),
      sb.from('lembretes_prazo').delete().eq('usuario_id', usuario.id)
    ]);
    if (itens.error || avisos.error) aviso('danger', 'Não foi possível apagar tudo. Tente de novo.');
    else aviso('info', 'Todos os registros salvos e os avisos por e-mail da conta foram apagados.');
  };

  const excluirConta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmando !== 'conta') return setConfirmando('conta');
    setConfirmando(null);
    setOcupado(true);
    try {
      const resp = await fetch('/api/conta/excluir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: senhaExclusao })
      });
      if (resp.ok) {
        await obterSupabase()?.auth.signOut({ scope: 'local' }).catch(() => undefined);
        router.replace('/');
        return;
      }
      const corpo = (await resp.json().catch(() => null)) as { mensagem?: string } | null;
      aviso('danger', corpo?.mensagem ?? 'Não foi possível excluir a conta. Tente de novo em instantes.');
    } catch {
      aviso('danger', 'Sem conexão com o servidor. Nada foi apagado.');
    } finally {
      setOcupado(false);
      setSenhaExclusao('');
    }
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
        <div ref={avisoRef} aria-live="polite">
          {mensagem && (
            <Notice tom={mensagem.tom === 'danger' ? 'danger' : 'info'} titulo={mensagem.tom === 'danger' ? 'Atenção' : undefined}>
              {mensagem.texto}
            </Notice>
          )}
        </div>

        <form onSubmit={salvarPerfil} className={cn(cardClasses, 'p-6 space-y-5')} aria-label="Perfil">
          <h2 className="font-serif text-xl font-semibold text-ink">Perfil</h2>
          <div>
            <Label htmlFor="nome">
              Nome
            </Label>
            <Input id="nome" maxLength={200} value={perfil.nome} onChange={e => setPerfil({ ...perfil, nome: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="profissao">
              Atuação
            </Label>
            <NativeSelect id="profissao" value={perfil.profissao} onChange={e => setPerfil({ ...perfil, profissao: e.target.value })}>
              {PROFISSOES.map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="oab">
              OAB (declaratória)
            </Label>
            <Input id="oab" maxLength={30} value={perfil.oab} onChange={e => setPerfil({ ...perfil, oab: e.target.value })} />
            <p className="text-sm text-ink-mute mt-1.5">Informação declarada por você; o Ratione não a verifica.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tribunal">
                Tribunal padrão
              </Label>
              <NativeSelect id="tribunal" value={perfil.tribunal_padrao} onChange={e => setPerfil({ ...perfil, tribunal_padrao: e.target.value })}>
                <option value="">Nenhum</option>
                {tribunais.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.sigla}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="uf">
                UF
              </Label>
              <NativeSelect id="uf" value={perfil.uf_padrao} onChange={e => setPerfil({ ...perfil, uf_padrao: e.target.value })}>
                <option value="">Nenhuma</option>
                {UFS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <Button type="submit" disabled={ocupado}>
            Salvar perfil
          </Button>
        </form>

        <form onSubmit={trocarSenha} className={cn(cardClasses, 'p-6 space-y-5')} aria-label="Alterar senha">
          <h2 className="font-serif text-xl font-semibold text-ink">Alterar senha</h2>
          <div>
            <Label htmlFor="nova-senha">
              Nova senha
            </Label>
            <Input
              id="nova-senha"
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
            />
          </div>
          <Button variant="secondary" type="submit" disabled={ocupado}>
            Alterar senha
          </Button>
        </form>

        <section className="space-y-4" aria-labelledby="dados">
          <h2 id="dados" className="font-serif text-xl font-semibold text-ink">
            Seus dados (LGPD)
          </h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            Você pode baixar tudo o que o Ratione guarda sobre você, apagar seus registros salvos ou excluir a conta por completo. As regras de
            retenção e exclusão estão na{' '}
            <Link href="/privacidade" className="underline underline-offset-2">
              Política de privacidade
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" type="button" onClick={exportar}>
              <Download className="w-4 h-4" />
              Baixar meus dados
            </Button>
            <Button variant="secondary" type="button" onClick={() => setConfirmando('itens')}>
              Apagar meus registros e avisos
            </Button>
          </div>
          {confirmando === 'itens' && (
            <Notice tom="danger" titulo="Apagar todos os registros salvos e os avisos por e-mail da conta?">
              <p>Isso não pode ser desfeito.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button type="button" onClick={apagarItens}>
                  Sim, apagar os registros
                </Button>
                <Button variant="secondary" type="button" onClick={() => setConfirmando(null)}>
                  Cancelar
                </Button>
              </div>
            </Notice>
          )}
        </section>

        <form onSubmit={excluirConta} className={cn(cardClasses, 'p-6 space-y-5')} aria-label="Excluir conta">
          <h2 className="font-serif text-xl font-semibold text-ink">Excluir conta</h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            Apaga a sua conta, o perfil e todos os registros salvos, sem possibilidade de recuperação. Baixe seus dados antes, se quiser guardá-los.
            Para confirmar, informe a senha atual.
          </p>
          <div>
            <Label htmlFor="senha-exclusao">
              Senha atual
            </Label>
            <Input
              id="senha-exclusao"
              type="password"
              required
              autoComplete="current-password"
              value={senhaExclusao}
              onChange={e => setSenhaExclusao(e.target.value)}
            />
          </div>
          {confirmando === 'conta' ? (
            <Notice tom="danger" titulo="Excluir a conta e todos os dados associados a ela?">
              <p>Isso não pode ser desfeito.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button type="submit" disabled={ocupado}>
                  Sim, excluir definitivamente
                </Button>
                <Button variant="secondary" type="button" onClick={() => setConfirmando(null)}>
                  Cancelar
                </Button>
              </div>
            </Notice>
          ) : (
            <Button variant="secondary" type="submit" disabled={ocupado || senhaExclusao.length === 0}>
              Excluir minha conta
            </Button>
          )}
        </form>

        <Button variant="secondary" type="button" onClick={sair}>
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
