import PageHeader from '../../components/PageHeader';

export const metadata = { title: 'Privacidade | Ratione' };

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Transparência" title="Privacidade" description="O que acontece com as informações que você usa no Ratione." />
      <div className="space-y-5 text-base text-ink-soft leading-relaxed">
        <p>
          Nesta versão, o Ratione não exige cadastro e não envia os dados que você informa a nenhum servidor. Os
          cálculos são feitos no seu navegador.
        </p>
        <p>
          Os registros de &ldquo;Meu espaço&rdquo; ficam armazenados apenas neste navegador e neste dispositivo. Você
          pode removê-los a qualquer momento, e eles desaparecem se os dados do navegador forem limpos.
        </p>
        <p>
          Antes de qualquer funcionalidade que envolva envio de documentos, esta página será atualizada com as regras
          de armazenamento, retenção e exclusão.
        </p>
      </div>
    </div>
  );
}
