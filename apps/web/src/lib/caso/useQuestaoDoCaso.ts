import { useEffect, useState } from 'react';
import { lerQuestaoDoCaso } from './ligacao';
import { useCaso } from './memoria';

/**
 * A questão do caso pela qual a pessoa chegou a esta tela (`?caso=Q2`) e o caso em memória, juntos. `questao` só vem preenchida quando a análise
 * ainda está na memória desta aba e tem aquela questão; sem isso, nada do caso aparece na tela.
 */
export function useQuestaoDoCaso() {
  const caso = useCaso();
  const [questaoId, setQuestaoId] = useState<string | null>(null);

  useEffect(() => {
    setQuestaoId(lerQuestaoDoCaso(window.location.search));
  }, []);

  const questoes = caso?.resultados.questoes?.questoes;
  const posicao = questoes && questaoId ? questoes.findIndex(q => q.id === questaoId) : -1;
  if (!caso || !questoes || !questaoId || posicao < 0) return { caso: null, questao: null, posicao: -1 } as const;
  return { caso, questao: questoes[posicao], posicao } as const;
}
