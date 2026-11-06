import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import AnaliseDecisao from './AnaliseDecisao';
import { buttonVariants } from '@/components/ui/button';

export default function ArgumentaPage() {
  return (
    <div>
      <div className="print:hidden">
      <PageHeader
        eyebrow="Argumenta"
        title="Análise da decisão"
        description="Veja como a decisão foi construída: estrutura, questões, conclusões e fundamentos, com acesso aos trechos originais."
        actions={
          <Link href="/prazozero" className={buttonVariants()}>
            Calcular prazo recursal
          </Link>
        }
      />
      </div>

      <AnaliseDecisao />
    </div>
  );
}
