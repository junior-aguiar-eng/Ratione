import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import GrafoMinimoVitrine from '../../components/GrafoMinimoVitrine';

/**
 * Reserva do /tesemap quando o banco não responde (sem Supabase configurado, sem as tabelas ou sem dados): mostra o grafo mínimo validado, que vem
 * do repositório, em vez de uma prévia digitada à mão.
 */
export default function ReservaTeseMap() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="TeseMap" title="Mapa da tese" description="Precedentes com a tese firmada, a fonte oficial e as relações conferidas entre eles." />
      <Notice tom="warn" titulo="Base do TeseMap indisponível no momento">
        A pesquisa nos precedentes do STJ e do STF volta assim que a conexão com o banco for restabelecida. Abaixo, o mapa do Tema 1.076/STJ, que acompanha o
        sistema e tem as mesmas relações validadas.
      </Notice>
      <GrafoMinimoVitrine />
    </div>
  );
}
