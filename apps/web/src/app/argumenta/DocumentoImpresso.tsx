import type { DocumentoDaAnalise } from '../../lib/argumenta/documento';

/**
 * F5-09: a análise como folha de papel. Fica escondida na tela e só aparece ao imprimir ("Salvar como PDF"), no lugar da interface; lê o mesmo
 * documento que o Word, e por isso os dois dizem o mesmo. Estilo fixo em preto sobre branco, sem as cores nem os botões da tela.
 */
export default function DocumentoImpresso({ documento: d }: { documento: DocumentoDaAnalise }) {
  return (
    <article className="hidden print:block text-black font-serif text-[11pt] leading-snug" data-testid="documento-impresso">
      <h1 className="text-2xl font-bold">{d.titulo}</h1>
      <p className="text-sm text-neutral-600 mb-3">Gerada em {d.geradoEm}</p>
      {d.avisos.map((a, i) => (
        <p key={i} className="text-xs italic text-neutral-600 mb-1">
          {a}
        </p>
      ))}

      <h2 className="text-lg font-bold mt-5 mb-1">Visão geral</h2>
      <p>
        <strong>Tipo:</strong> {d.tipo}
      </p>
      <p>
        <strong>Resultado:</strong> {d.resultado}
      </p>
      <p className="mt-1">{d.resumo}</p>

      {d.pedidos.length > 0 && (
        <>
          <h3 className="text-base font-bold mt-4 mb-1">Pedidos</h3>
          <ul className="list-disc pl-5">
            {d.pedidos.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {d.questoes.length > 0 && <h2 className="text-lg font-bold mt-5 mb-1">Questões e fundamentos</h2>}
      {d.questoes.map((q, i) => (
        <section key={i} className="mt-4 break-inside-avoid-page">
          <h3 className="text-base font-bold">{q.cabecalho}</h3>
          <p>
            <strong>Situação:</strong> {q.resultado}
          </p>
          <p className="font-semibold mt-1">{q.enunciado}</p>
          <p>
            <strong>Conclusão:</strong> {q.conclusao}
          </p>
          {q.fundamentos === null ? (
            <p className="italic text-neutral-600 mt-1">Os fundamentos desta questão não foram identificados nesta análise.</p>
          ) : q.fundamentos.length === 0 ? (
            <p className="italic text-neutral-600 mt-1">Nenhum fundamento identificado para esta questão.</p>
          ) : (
            <ul className="list-disc pl-5 mt-1">
              {q.fundamentos.map((f, k) => (
                <li key={k} className="mb-1">
                  <strong>{f.rotulo}:</strong> {f.descricao}
                  {f.citacao && <div className="text-sm">{f.citacao}</div>}
                  {f.conferencia && <div className="text-xs italic text-neutral-600">{f.conferencia}</div>}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
