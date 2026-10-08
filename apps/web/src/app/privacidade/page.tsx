import PageHeader from '../../components/PageHeader';

export const metadata = { title: 'Privacidade | Ratione' };

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Transparência" title="Privacidade" description="O que acontece com as informações que você usa no Ratione." />
      <div className="space-y-5 text-base text-ink-soft leading-relaxed">
        <p>
          O Ratione não exige cadastro. Sem conta, os cálculos são feitos no seu navegador, os dados que você informa não são enviados a nenhum
          servidor e os registros de &ldquo;Meu espaço&rdquo; ficam apenas neste navegador e neste dispositivo (e desaparecem se os dados do
          navegador forem limpos).
        </p>
        <p>
          Se você criar uma conta, passamos a guardar, em servidor no Brasil (Supabase, região de São Paulo): seu e-mail e senha (a senha é guardada
          de forma criptografada, e nós não a vemos); o perfil que você preencher (nome, atuação, OAB declarada, tribunal e UF padrão); e os
          registros que você salvar em &ldquo;Meu espaço&rdquo; (título, descrição curta, módulo e data). Os dados digitados nos cálculos não são
          enviados, só o que você escolhe salvar. Cada conta só acessa os próprios dados.
        </p>
        <p>
          Você pode baixar seus dados e apagar seus registros salvos em &ldquo;Minha conta&rdquo; (LGPD, art. 18). A exclusão completa da conta pela
          tela ainda não está disponível. Esta página é um rascunho e passará por revisão jurídica antes do lançamento.
        </p>
        <p>
          Antes de qualquer funcionalidade que envolva envio de documentos, esta página será atualizada com as regras
          de armazenamento, retenção e exclusão.
        </p>
      </div>
    </div>
  );
}
