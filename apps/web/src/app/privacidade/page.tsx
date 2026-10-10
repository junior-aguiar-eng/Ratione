import PageHeader from '../../components/PageHeader';

export const metadata = { title: 'Privacidade | Ratione' };

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Transparência" title="Privacidade" description="O que acontece com as informações que você usa no Ratione." />
      <div className="space-y-5 text-base text-ink-soft leading-relaxed">
        <p>
          O uso das ferramentas do Ratione exige uma conta (e-mail e senha). Os cálculos são feitos no seu navegador; os dados que você digita nas
          ferramentas não são enviados ao servidor, a menos que você escolha salvá-los.
        </p>
        <p>
          Com a conta, guardamos em servidor no Brasil (Supabase, região de São Paulo): seu e-mail e senha (a senha é guardada de forma
          criptografada, e nós não a vemos); o perfil que você preencher (nome, atuação, OAB declarada, tribunal e UF padrão); e os registros que
          você salvar em &ldquo;Meu espaço&rdquo; (título, descrição curta, módulo e data). Cada conta só acessa os próprios dados.
        </p>
        <p>
          Se você ativar o aviso por e-mail de um prazo, guardamos o nome que você deu ao aviso, o tribunal, a data do vencimento e quando o e-mail foi
          enviado. O e-mail é enviado por um prestador de serviço de e-mail (Resend), que recebe o seu endereço, o nome do aviso e a data; por isso, não escreva nome de partes nem número de processo no nome do aviso.
          Você cancela o aviso em &ldquo;Meu espaço&rdquo; a qualquer momento. Os e-mails de confirmação de conta e de nova senha saem pelo mesmo prestador.
        </p>
        <p>
          Você pode baixar seus dados, apagar seus registros salvos e avisos e excluir a conta por completo em &ldquo;Minha conta&rdquo; (LGPD, art. 18),
          informando a senha atual; a exclusão remove o cadastro, o perfil, os registros e os avisos e não pode ser desfeita. Esta página é um rascunho e passará por revisão jurídica antes do lançamento.
        </p>
        <p>
          Antes de qualquer funcionalidade que envolva envio de documentos, esta página será atualizada com as regras
          de armazenamento, retenção e exclusão.
        </p>
      </div>
    </div>
  );
}
