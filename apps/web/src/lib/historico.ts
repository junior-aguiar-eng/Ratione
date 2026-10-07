export type ModuloHistorico = 'Argumenta' | 'NormaViva' | 'TeseMap' | 'PrazoZero';
export type TipoHistorico = 'decisao' | 'norma' | 'tese' | 'prazo';

export interface RegistroHistorico {
  id: string;
  modulo: ModuloHistorico;
  tipo: TipoHistorico;
  titulo: string;
  detalhe?: string;
  url: string;
  criadoEm: string; // ISO completo
}

const CHAVE = 'ratione_historico_recente';
const LIMITE = 100;

export function lerHistorico(): RegistroHistorico[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return [];
    const dados = JSON.parse(bruto);
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function salvarRegistro(r: Omit<RegistroHistorico, 'id' | 'criadoEm'>): void {
  try {
    const registro: RegistroHistorico = {
      ...r,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      criadoEm: new Date().toISOString()
    };
    localStorage.setItem(CHAVE, JSON.stringify([registro, ...lerHistorico()].slice(0, LIMITE)));
  } catch {
    // armazenamento indisponível: ignorar
  }
}

export function removerRegistro(id: string): RegistroHistorico[] {
  const restantes = lerHistorico().filter(r => r.id !== id);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(restantes));
  } catch {
    // ignorar
  }
  return restantes;
}
