#!/usr/bin/env python3
"""
Oráculo independente do PrazoZero.

Reimplementa as regras de contagem em outra linguagem, sem compartilhar código com o motor
TypeScript, e gera `cenarios.json`. O teste `cenarios.test.ts` confronta o motor com este gabarito.

Uso:  python oraculo.py   (regrava cenarios.json)

IMPORTANTE: este arquivo codifica a leitura das regras, não a validação jurídica. Cada cenário sai com
`validacao.status = "pendente"` até que o revisor jurídico confira fundamento e resultado.
"""
import json
from datetime import date, timedelta
from pathlib import Path

# Lei 5.010/1966, art. 62 (texto conferido no Planalto): Justiça Federal e tribunais que a aplicam.
# STF e STJ: confirmado nos atos de 2026 (Portaria STJ/GDG 1.010/2025; calendário STF 2026, Portaria GDG/STF 189/2025).
LEI_5010 = {"STF", "STJ", "TRF1", "TRF2", "TRF3", "TRF4", "TRF5", "TRF6"}
SUPERIORES_SEM_ATO = {"TST", "TSE"}  # citados no art. 62, sem ato próprio conferido: pendente
# Só tribunais estaduais: a Justiça Federal segue a Lei 5.010, art. 62, e não a tabela estadual.
UF_DO_TRIBUNAL = {"TJSP": "SP", "TJRJ": "RJ", "TJMG": "MG", "TJRS": "RS", "TJPR": "PR", "TJSC": "SC", "TJBA": "BA", "TJDF": "DF",
                  "TJGO": "GO", "TJPE": "PE", "TJCE": "CE", "TJAL": "AL", "TJES": "ES"}
FIXOS_VERIFICADOS = [(1, 1), (4, 21), (5, 1), (9, 7), (10, 12), (11, 2), (11, 15), (12, 25)]
# Pontos facultativos de 2026, idênticos nos atos de STF e STJ: (mês, dia, parcial)
PF_2026 = [(2, 18, True), (4, 20, False), (6, 4, False), (6, 5, False), (8, 10, False), (10, 30, False), (12, 7, False)]
# Pontos facultativos (decisão do revisor jurídico em 10/10/2026): não contam como dia sem expediente; viram alerta (dia pendente). Espelha PONTOS_FACULTATIVOS de eventos.ts.
PF = {("TJBA", d) for d in ["02-12", "02-13", "04-02", "04-20", "06-05", "06-22", "06-23", "07-03", "08-10", "12-07"]} \
    | {("TJDF", d) for d in ["04-20", "06-04", "06-05", "08-10", "10-30", "12-07"]} \
    | {("TJCE", d) for d in ["02-16", "02-17", "02-18", "03-19", "04-02", "04-03", "06-04", "06-05"]} \
    | {("TJES", d) for d in ["04-20", "06-04", "06-05", "08-10", "10-30", "12-07"]} \
    | {("TJGO", d) for d in ["04-20", "06-05"]} \
    | {("TJRJ", d) for d in ["02-13", "04-24", "06-05"]}

# Tribunal usado nos cenários que precisam de um calendário SEM ato lido (dias pendentes). Ao ler o ato dele, trocar por outro ainda sem ato
# (hoje nenhum: todos os tribunais estaduais cadastrados já têm ato lido, e por isso o exemplo é "sem tribunal informado", que mantém os mesmos dias pendentes) e acertar o mesmo tribunal em src/motor/relatorio.test.ts.
TRIBUNAL_SEM_ATO = None

ANOS_VERIFICADOS = {"STF": {2026}, "STJ": {2026}, "TJSP": {2026}, "TJMG": {2026}, "TJAL": {2026}, "TJPR": {2026}, "TJRS": {2026, 2027}, "TJBA": {2026}, "TJDF": {2026}, "TJSC": {2026}, "TJPE": {2026}, "TJCE": {2026}, "TJES": {2026}, "TJGO": {2026}}

# Calendário dos tribunais estaduais, 2026, transcrito dos atos (independente do eventos.ts):
#  TJSP: Provimento CSM 2.813/2025, art. 1º e 2º (e 30/10 em lugar de 28/10, conforme nota do próprio provimento)
#  TJMG: Portaria Conjunta 1.764/PR/2026, art. 1º; permanentes: Res. OE 458/2004, art. 1º
#  TJAL: Ato Normativo 03/2026 (DJE 28/01/2026, p. 7; 28/08 só em municípios: pendente); permanentes: Lei estadual 6.564/2005 consolidada, art. 36 e art. 37 (dezembro); pendente: art. 37, 23/06 a 01/07
TJSP_2026_NU = ["02-16", "02-17", "04-02", "04-03", "04-20", "06-04", "06-05", "07-09", "07-10", "10-30", "12-07", "12-08"]
TJSP_2026_RECESSO = [(1, 1, 1, 6), (12, 20, 12, 31)]
#  TJPR: Decreto Judiciário 621/2025, arts. 1º a 3º (art. 4º, feriados municipais, não entra: CPC, art. 1.003, § 6º); recesso coincide com o CPC, art. 220
#  TJRS: Ato 05/2025 OE (2026) e Ato 06/2026 OE (2027); Ato Conjunto 004/2026 (02/07/2026, falta de energia). Asterisco = feriado municipal de Porto Alegre:
#        02/02 não entra e Corpus Christi (04/06/2026 e 27/05/2027) fica pendente. Revolução Farroupilha (20/09) é regra anual já conferida.
#  TJBA: Decreto Judiciário 1050/2025, art. 5º (feriados e pontos facultativos, todos sem expediente; art. 8º prorroga os prazos) e Decreto Judiciário 944/2026
#        (29/06/2026, jogo da Seleção: prazos suspensos). Só entram os dias que não são feriado federal; 02/01 já está no recesso (CPC, art. 220).
#  TJDF (TJDFT): Portaria Conjunta 105/2025, art. 2º (feriados e pontos facultativos; art. 4º suspende o expediente; art. 5º prorroga os prazos).
#        Copa: Portaria Conjunta 48/2026 (alterada pela 53/2026): 29/06 ponto facultativo; 24/06 expediente das 9h às 16h (prazos que começam ou terminam no dia são prorrogados).
#        Fora: feriados federais da lista e 30/11 (só ofícios extrajudiciais, art. 3º).
#  TJSC: Resolução GP 1/2026 compilada (Anexo Único, só as linhas de todo o Estado; Dia do Funcionário Público em 28/10; 11/08 não é feriado) e
#        Resolução GP 31/2026 (Copa: 24/06 jogo às 19h, expediente das 10h às 17h, começo e vencimento postergados; 29/06 não consta de aviso do tribunal: fica de fora). Cinzas: expediente começa às 12h.
#  TJPE: Ato Conjunto 43/2025 (art. 1º e parágrafo único; Corpus Christi em 22/06, não em 04/06; 22 a 30/06 feriados forenses; 10/08 antecipado) e Atos 966 e 977/2026
#        (prazos suspensos de 11 a 15/05, PJe). Fora: 16/07 (municipal do Recife); 06/03 já é regra anual por lei estadual; janeiro e dezembro já no recesso (CPC, art. 220).
#  TJCE: Portaria 2924/2025, Anexo Único (feriados e pontos facultativos: dias sem expediente que impactam os prazos), Portaria 1169/2026 (05/06) e
#        Portarias 1401 e 1440/2026 (Copa: 24/06 das 8h às 15h; 29/06 das 8h às 12h). Cinzas: normal só a partir das 14h. 13/04 (Portaria 727/2026) vale só na Comarca de Fortaleza: pendente.
#  TJES: Ato Normativo 176/2026 (Anexo Único; feriados e pontos facultativos; Dia do Servidor em 30/10; Nossa Senhora da Penha em 13/04 conferida em 2026), Atos 124 e 130/2026
#        (prazos que venceram em 08/07 e 31/07 prorrogados, PJe) (os Atos 103 e 113/2026, da Copa, não confirmam efeito sobre prazos: ficam de fora).
#  TJGO: calendário oficial de 2026 (PDF de 13/01/2026; Carnaval 16 e 17/02 e Cinzas até as 12h; Semana Santa 01 a 03/04; 20/04 e 05/06 pontos facultativos; Corpus Christi 04/06;
#        28/10; 08/12), Decreto Judiciário 3079/2026 (29/06, 7h às 12h, prazos prorrogados) (o Decreto 2876/2026, de 19 e 24/06, não consta de ato lido: fica de fora).
TJGO_2026_NU = ["02-16", "02-17", "04-01", "04-02", "04-03", "04-20", "06-04", "06-05", "10-28", "12-08"]
TJGO_2026_PARCIAL = ["02-18", "06-29"]
TJES_2026_NU = ["02-16", "02-17", "02-18", "04-02", "04-03", "04-13", "04-20", "06-04", "06-05", "08-10", "08-11", "10-30", "12-07", "12-08"]
TJES_2026_PARCIAL = ["07-08", "07-31"]
TJCE_2026_NU = ["02-16", "02-17", "03-19", "03-25", "04-02", "04-03", "06-04", "06-05", "10-28", "12-08"]
TJCE_2026_PARCIAL = ["02-18", "06-24", "06-29"]
TJCE_2026_PENDENTE = ["04-13"]
TJPE_2026_NU = [("02-16", "02-16"), ("02-17", "02-17"), ("02-18", "02-18"), ("04-02", "04-03"), ("05-11", "05-15"), ("06-22", "06-22"), ("06-23", "06-30"),
                ("08-10", "08-10"), ("10-30", "10-30"), ("12-08", "12-08")]
TJSC_2026_NU = ["02-16", "02-17", "04-02", "04-03", "06-04", "10-28", "12-08"]
TJSC_2026_PARCIAL = ["02-18", "06-24"]
TJDF_2026_NU = ["02-16", "02-17", "02-18", "04-01", "04-02", "04-03", "04-20", "06-04", "06-05", "06-29", "08-10", "08-11", "10-30", "12-07", "12-08", "12-24", "12-31"]
TJDF_2026_PARCIAL = ["06-24"]
TJBA_2026_NU = ["02-12", "02-13", "02-16", "02-17", "02-18", "04-02", "04-03", "04-20", "06-04", "06-05", "06-22", "06-23", "06-24", "06-29", "07-02", "07-03",
                "08-10", "08-11", "10-30", "12-07", "12-08"]
TJRS_NU = {2026: ["02-16", "02-17", "04-03", "07-02", "12-08"], 2027: ["02-08", "02-09", "03-26", "12-08"]}
TJRS_CORPUS_PENDENTE = {2026: "06-04", 2027: "05-27"}
TJPR_2026_NU = ["02-16", "02-17", "04-02", "04-03", "04-20", "06-04", "06-05", "10-30", "12-18", "12-24", "12-31"]
TJMG_2026_NU = [("02-16", "02-18"), ("04-01", "04-03"), ("04-20", "04-20"), ("10-30", "10-30"), ("12-07", "12-07")]
TJMG_2026_PENDENTE = ["06-04", "06-05"]
# TJRJ 2026: informativo oficial (ocorrências de todo o Estado); sem selo, o ano ainda não terminou
TJRJ_2026_NU = ["02-05", "02-13", "02-16", "02-17", "02-18", "02-27", "03-27", "04-02", "04-03", "04-23", "04-24",
                "06-04", "06-05", "06-24", "06-29", "07-29", "08-07", "08-11", "09-04", "09-11"]
TJAL_2026_NU = ["04-20", "06-04", "06-05", "08-10", "08-11", "12-07", "12-08"]


def pascoa(ano: int) -> date:
    # Algoritmo gregoriano "anônimo" (formulação distinta da usada no motor)
    a, b, c = ano % 19, ano // 100, ano % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    mes = (h + l - 7 * m + 114) // 31
    dia = (h + l - 7 * m + 114) % 31 + 1
    return date(ano, mes, dia)


# Tabela estadual PROVISÓRIA (todos pendentes), transcrita de feriados.ts: dado, não lógica. O teste diferencial acusa se divergirem.
FERIADOS_ESTADUAIS_PENDENTES = {
    "SP": (7, 9, "Revolução Constitucionalista de 1932"),
    "RJ": (4, 23, "Dia de São Jorge"),
    "BA": (7, 2, "Independência da Bahia"),
    "CE": (3, 25, "Data Magna do Ceará (abolição no Estado)"),
    "PA": (8, 15, "Adesão do Grão-Pará à Independência"),
    "AM": (9, 5, "Elevação do Amazonas à Categoria de Província"),
    "MA": (7, 28, "Adesão do Maranhão à Independência"),
    "RN": (10, 3, "Mártires de Cunhaú e Uruuaçu"),
    "PB": (7, 26, "Homenagem à Memória de João Pessoa"),
    "AL": (9, 16, "Emancipação Política de Alagoas"),
    "SE": (7, 8, "Emancipação Política de Sergipe"),
    "PI": (10, 19, "Dia do Piauí"),
    "MT": (11, 20, "Consciência Negra Estadual (Histórico)"),
    "MS": (10, 11, "Criação do Estado de Mato Grosso do Sul"),
    "RO": (1, 4, "Criação do Estado de Rondônia"),
    "AC": (6, 15, "Aniversário do Estado do Acre"),
    "AP": (3, 19, "Dia de São José"),
    "RR": (10, 5, "Criação do Estado de Roraima"),
    "TO": (10, 5, "Criação do Estado do Tocantins"),
}


def calendario(ano: int, trib: str, uf: str, completo: bool):
    """Retorna (nao_util, parcial, nomes) do ano. `completo` inclui os dias ainda pendentes de conferência."""
    nao_util, parcial, nomes = set(), set(), {}
    # Calendário do ano lido por inteiro: o ato é a lista completa e a tabela provisória de dias pendentes não vale (espelha feriados.ts)
    coberto = ano in ANOS_VERIFICADOS.get(trib, set())

    def nu(d, verificado, nome):
        if verificado or (completo and not coberto):
            nao_util.add(d)
            nomes[d] = nome

    fixos = {(1, 1): "Confraternização Universal", (4, 21): "Tiradentes", (5, 1): "Dia do Trabalho", (9, 7): "Independência",
             (10, 12): "Nossa Senhora Aparecida", (11, 2): "Finados", (11, 15): "Proclamação da República", (12, 25): "Natal"}
    for (mes, dia), nome in fixos.items():
        nu(date(ano, mes, dia), True, nome)
    nu(date(ano, 11, 20), ano >= 2024, "Consciência Negra")

    p = pascoa(ano)
    aplica = trib in LEI_5010
    nu(p - timedelta(2), aplica, "Sexta-feira Santa")
    nu(p - timedelta(48), aplica, "Carnaval (segunda)")
    nu(p - timedelta(47), aplica, "Carnaval (terça)")
    nu(p + timedelta(60), False, "Corpus Christi")
    if completo and not coberto:
        parcial.add(p - timedelta(46))
        nomes[p - timedelta(46)] = "Quarta-feira de Cinzas (expediente parcial)"
    if aplica or trib in SUPERIORES_SEM_ATO:
        nu(p - timedelta(4), aplica, "Semana Santa (quarta)")
        nu(p - timedelta(3), aplica, "Semana Santa (quinta)")
        nu(date(ano, 8, 11), aplica, "11 de agosto (Lei 5.010, art. 62, IV)")
        nu(date(ano, 11, 1), aplica, "Todos os Santos (Lei 5.010, art. 62, IV)")
        nu(date(ano, 12, 8), aplica, "Dia da Justiça (Lei 5.010, art. 62, IV)")
        for dia in range(20, 32):
            nu(date(ano, 12, dia), aplica, "Recesso (Lei 5.010, art. 62, I)")
        for dia in range(2, 7):
            nu(date(ano, 1, dia), aplica, "Recesso (Lei 5.010, art. 62, I)")
    if ano == 2026 and trib in ("STF", "STJ"):
        for mes, dia, eh_parcial in PF_2026:
            d = date(ano, mes, dia)
            if eh_parcial:
                parcial.add(d)
                nomes[d] = "Quarta-feira de Cinzas (ponto facultativo até as 14h)"
            else:
                nao_util.add(d)
                nomes[d] = "Ponto facultativo (ato do tribunal)"
    def ev(d, verificado, nome):
        """Evento de tribunal: o pendente só entra no modo completo e nunca apaga um dia já conferido."""
        if not verificado and (d in nao_util or not completo):
            return
        nao_util.add(d)
        parcial.discard(d)
        nomes[d] = nome

    def dia(mmdd):
        m, dd = mmdd.split("-")
        return date(ano, int(m), int(dd))

    def intervalo(de, ate):
        d = de
        while d <= ate:
            yield d
            d += timedelta(1)

    if ano == 2026 and trib == "TJSP":
        for s in TJSP_2026_NU:
            ev(dia(s), True, "TJSP: " + s)
        for m1, d1, m2, d2 in TJSP_2026_RECESSO:
            for d in intervalo(date(ano, m1, d1), date(ano, m2, d2)):
                ev(d, True, "TJSP: recesso forense")
        parcial.add(dia("02-18"))
        nomes[dia("02-18")] = "Quarta-feira de Cinzas (TJSP: jornada começa 3 horas depois)"
    if ano == 2026 and trib == "TJPR":
        for s in TJPR_2026_NU:
            ev(dia(s), True, "TJPR: Decreto Judiciário 621/2025")
    if ano == 2026 and trib == "TJGO":
        for s in TJGO_2026_NU:
            ev(dia(s), ("TJGO", s) not in PF, "TJGO: calendário oficial de 2026")
        for s in TJGO_2026_PARCIAL:
            parcial.add(dia(s))
            nomes[dia(s)] = "TJGO: expediente parcial (Cinzas até as 12h; jogo da Seleção, Decreto 3079/2026)"
    if ano == 2026 and trib == "TJES":
        for s in TJES_2026_NU:
            ev(dia(s), ("TJES", s) not in PF, "TJES: Ato Normativo 176/2026")
        for s in TJES_2026_PARCIAL:
            parcial.add(dia(s))
            nomes[dia(s)] = "TJES: prazos prorrogados por falha do PJe (Atos 124 e 130/2026)"
    if ano == 2026 and trib == "TJCE":
        for s in TJCE_2026_NU:
            ev(dia(s), ("TJCE", s) not in PF, "TJCE: Portaria 2924/2025 e 1169/2026")
        for s in TJCE_2026_PARCIAL:
            if ("TJCE", s) in PF:
                if completo and dia(s) not in nao_util:
                    parcial.add(dia(s))
                    nomes[dia(s)] = "TJCE: ponto facultativo até as 14h (alerta)"
                continue
            parcial.add(dia(s))
            nomes[dia(s)] = "TJCE: expediente reduzido (Portarias 1401 e 1440/2026)"
        for s in TJCE_2026_PENDENTE:
            ev(dia(s), False, "TJCE: ponto facultativo só na Comarca de Fortaleza (Portaria 727/2026)")
    if ano == 2026 and trib == "TJPE":
        for de, ate in TJPE_2026_NU:
            for d in intervalo(dia(de), dia(ate)):
                ev(d, True, "TJPE: Ato Conjunto 43/2025 e Atos 966 e 977/2026")
    if ano == 2026 and trib == "TJSC":
        for s in TJSC_2026_NU:
            ev(dia(s), True, "TJSC: Resolução GP 1/2026")
        for s in TJSC_2026_PARCIAL:
            parcial.add(dia(s))
            nomes[dia(s)] = "TJSC: expediente parcial (Cinzas às 12h; jogo da Seleção, Res. GP 31/2026)"
    if ano == 2026 and trib == "TJDF":
        for s in TJDF_2026_NU:
            ev(dia(s), ("TJDF", s) not in PF, "TJDFT: Portaria Conjunta 105/2025 e 48/2026")
        for s in TJDF_2026_PARCIAL:
            parcial.add(dia(s))
            nomes[dia(s)] = "TJDFT: jogo da Seleção, expediente das 9h às 16h (Portaria Conjunta 48/2026)"
    if ano == 2026 and trib == "TJBA":
        for s in TJBA_2026_NU:
            ev(dia(s), ("TJBA", s) not in PF, "TJBA: Decreto Judiciário 1050/2025 e 944/2026")
    if ano == 2026 and trib == "TJMG":
        for de, ate in TJMG_2026_NU:
            for d in intervalo(dia(de), dia(ate)):
                ev(d, True, "TJMG: suspensão de expediente")
        for s in TJMG_2026_PENDENTE:
            ev(dia(s), False, "TJMG: depende da comarca")
    if trib == "TJMG":  # Res. OE 458/2004, art. 1º, III a V: permanente
        for off in (-48, -47, -46, -4, -3, -2):
            ev(p + timedelta(off), True, "TJMG: Carnaval/Semana Santa (Res. 458/2004)")
        ev(date(ano, 12, 8), True, "TJMG: Dia da Justiça (Res. 458/2004)")
    if ano == 2026 and trib == "TJRJ":
        for s in TJRJ_2026_NU:
            ev(dia(s), ("TJRJ", s) not in PF, "TJRJ: " + s)
    if ano == 2026 and trib == "TJAL":
        for s in TJAL_2026_NU:
            ev(dia(s), True, "TJAL: Ato Normativo 03/2026")
        ev(date(2026, 8, 28), False, "TJAL: 28/08 só nos municípios que preveem o feriado")
    # Feriados civis por lei estadual lidos (Lei 9.093/1995, art. 1º, II): valem em todo ano
    if trib == "TJPE":
        ev(date(ano, 3, 6), True, "TJPE: Data Magna (Lei estadual PE 16.241/2017, art. 49)")
    if trib == "TJRS":
        for s in TJRS_NU.get(ano, []):
            ev(dia(s), True, "TJRS: ato do Órgão Especial / Ato Conjunto 004/2026")
        if ano in TJRS_CORPUS_PENDENTE:
            ev(dia(TJRS_CORPUS_PENDENTE[ano]), False, "TJRS: Corpus Christi (feriado municipal de Porto Alegre; depende da comarca)")
        ev(date(ano, 9, 20), True, "TJRS: data magna (Constituição estadual, art. 6º; Decreto 36.180/1995)")
    if trib == "TJGO":
        ev(date(ano, 10, 24), True, "TJGO: pedra fundamental de Goiânia (Lei estadual GO 19.850/2017)")
    if trib == "TJES":  # Lei estadual 11.010/2019: texto não lido (pendente)
        ev(p + timedelta(8), False, "TJES: Nossa Senhora da Penha (Lei estadual ES 11.010/2019)")
    if trib == "TJAL":  # Lei estadual 6.564/2005 consolidada (até a Lei 8.850/2021), arts. 36 e 37
        for off in (-48, -47, -46, -4, -3, -2):
            ev(p + timedelta(off), True, "TJAL: Carnaval/Semana Santa (Lei 6.564/2005)")
        ev(date(ano, 8, 11), True, "TJAL: 11 de agosto (Lei 6.564/2005)")
        ev(date(ano, 12, 8), True, "TJAL: 8 de dezembro (Lei 6.564/2005)")
        for d in intervalo(date(ano, 6, 23), date(ano, 7, 1)):
            ev(d, False, "TJAL: feriados forenses de junho (Lei 6.564/2005, art. 37)")
        for d in intervalo(date(ano, 12, 20), date(ano, 12, 31)):
            ev(d, True, "TJAL: feriados forenses de dezembro (Lei 6.564/2005, art. 37)")
    if completo and not coberto and uf in FERIADOS_ESTADUAIS_PENDENTES:
        m, dd, nome = FERIADOS_ESTADUAIS_PENDENTES[uf]
        d = date(ano, m, dd)
        if d not in nao_util and d not in parcial:
            nao_util.add(d)
            nomes[d] = nome + " (estadual, pendente)"
    return nao_util, parcial, nomes


class Ctx:
    def __init__(self, trib, uf, regime, recesso, completo):
        self.trib, self.uf, self.regime, self.recesso, self.completo = trib, uf, regime, recesso, completo
        self._cache = {}

    def cal(self, ano):
        if ano not in self._cache:
            self._cache[ano] = calendario(ano, self.trib, self.uf, self.completo)
        return self._cache[ano]

    def em_suspensao(self, d):
        """STF e STJ: 20/12 a 31/01 e 02/07 a 31/07. Demais: 20/12 a 20/01 (CPC 220; CLT 775-A)."""
        if self.regime != "cpp_dias_corridos" and self.trib in ("STF", "STJ"):
            return (d.month == 12 and d.day >= 20) or d.month == 1 or (d.month == 7 and d.day >= 2)
        return (d.month == 12 and d.day >= 20) or (d.month == 1 and d.day <= 20)

    def fim_de_semana(self, d):
        return d.weekday() >= 5

    def util(self, d):
        """Dia útil para termo inicial/final (expediente parcial NÃO é útil)."""
        if self.fim_de_semana(d):
            return False
        if self.recesso and self.em_suspensao(d):
            return False
        nu, pa, _ = self.cal(d.year)
        return d not in nu and d not in pa

    def proximo_util(self, d):
        d += timedelta(1)
        while not self.util(d):
            d += timedelta(1)
        return d


def calcular(e: dict, completo: bool) -> dict:
    regime = e.get("regime", "cpc_dias_uteis")
    trib = e.get("tribunalId", "")
    uf = e.get("uf") or UF_DO_TRIBUNAL.get(trib, "")
    # Suspensão de 20/12 a 20/01 em todos os órgãos do Judiciário, inclusive no JEF (Res. CNJ 244/2016, art. 3º);
    # no CPP segue o art. 798-A, salvo réu preso, Maria da Penha ou medida urgente.
    recesso = e.get("suspensaoRecesso", regime != "cpp_dias_corridos" or not e.get("excecaoSuspensaoCriminal"))
    # JEF: sem prazo diferenciado para entes públicos (Leis 10.259/2001, art. 9º, e 12.153/2009, art. 7º)
    efetivo = e["diasPrazo"] * (2 if e.get("prazoEmDobro") and regime != "jef_dias_uteis" else 1)
    ctx = Ctx(trib, uf, regime, recesso, completo)

    evento = date.fromisoformat(e["dataEvento"])
    # DJe (CPC 224 §2º) e intimação eletrônica (CPC 231, V): o dia do começo é o dia útil seguinte
    pub = ctx.proximo_util(evento) if e["tipoEvento"] in ("disponibilizacao_dje", "intimacao_portal") else evento
    termo_inicial = ctx.proximo_util(pub)
    prorrogado = False

    rastro = {"fimsDeSemana": 0, "suspensaoDias": 0, "suspensaoDe": None, "suspensaoAte": None, "diasNaoUteis": []}

    def marca_suspensao(d):
        rastro["suspensaoDias"] += 1
        rastro["suspensaoDe"] = rastro["suspensaoDe"] or d.isoformat()
        rastro["suspensaoAte"] = d.isoformat()

    if regime == "cpp_dias_corridos":
        # CPP, art. 798-A: dias de 20/12 a 20/01 não contam (salvo exceção)
        contados, fim = 0, pub
        while contados < efetivo:
            fim += timedelta(1)
            if recesso and ctx.em_suspensao(fim):
                marca_suspensao(fim)
                continue
            contados += 1
        if not ctx.util(fim):
            prorrogado = True
            _, _, nomes_fim = ctx.cal(fim.year)
            rastro["diasNaoUteis"].append({"data": fim.isoformat(), "motivo": "vencimento em dia não útil (" + ("fim de semana" if ctx.fim_de_semana(fim) else nomes_fim.get(fim, "sem expediente")) + "), prorrogado (CPP, art. 798, § 3º)"})
            fim = ctx.proximo_util(fim)
    else:
        contados, d = 0, pub
        while True:
            d += timedelta(1)
            if ctx.fim_de_semana(d):
                rastro["fimsDeSemana"] += 1
                continue
            if recesso and ctx.em_suspensao(d):
                marca_suspensao(d)
                continue
            nu, pa, nomes_ano = ctx.cal(d.year)
            if d in nu:
                rastro["diasNaoUteis"].append({"data": d.isoformat(), "motivo": nomes_ano.get(d, "sem expediente")})
                continue
            if d in pa and (contados == 0 or contados + 1 == efetivo):
                if contados != 0 and contados + 1 == efetivo:
                    prorrogado = True
                rastro["diasNaoUteis"].append({"data": d.isoformat(), "motivo": nomes_ano.get(d, "expediente parcial") + (": protrai o dia do começo" if contados == 0 else ": protrai o vencimento (CPC, art. 224, § 1º)")})
                continue
            contados += 1
            if contados == efetivo:
                fim = d
                break

    anos = range(pub.year, fim.year + 1)
    verificado = trib in ANOS_VERIFICADOS and all(a in ANOS_VERIFICADOS[trib] for a in anos)
    return {
        "dataPublicacao": pub.isoformat(),
        "dataTermoInicial": termo_inicial.isoformat(),
        "dataVencimentoFinal": fim.isoformat(),
        "foiProrrogadoTermoFinal": prorrogado,
        "calendarioVerificado": verificado,
        "rastro": rastro,
    }


def entrada(data, tipo, dias, tribunal="TJSP", **kw):
    e = {"dataEvento": data, "tipoEvento": tipo, "diasPrazo": dias}
    if tribunal is not None:  # None = sem tribunal informado: nenhum calendário próprio, só os dias pendentes de qualquer foro
        e["tribunalId"] = tribunal
    e.update(kw)
    return e


# (id, categoria, descrição, fundamento, entrada)
C = []


def add(cid, cat, desc, fund, ent):
    C.append((cid, cat, desc, fund, ent))


CPC = "CPC, arts. 219 e 224, §§ 2º e 3º"
CAL_STF = "Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025)"
add("dje-sexta", "dje", "Disponibilização na sexta: publicação na segunda, contagem na terça", CPC,
    entrada("2026-03-13", "disponibilizacao_dje", 15, "STJ"))
add("dje-quinta", "dje", "Disponibilização na quinta: publicação na sexta", CPC,
    entrada("2026-03-12", "disponibilizacao_dje", 15, "STJ"))
add("dje-sabado", "dje", "Disponibilização no sábado: publicação na segunda", CPC,
    entrada("2026-03-14", "disponibilizacao_dje", 5))
add("dje-vespera-feriado", "feriado", "Disponibilização na segunda; terça é Tiradentes: publicação na quarta", CPC + "; Lei 10.607/2002",
    entrada("2026-04-20", "disponibilizacao_dje", 5))
add("dje-sexta-antes-feriado", "feriado", "Disponibilização na sexta; segunda útil; termo inicial na terça é Tiradentes", CPC + "; Lei 10.607/2002",
    entrada("2026-04-17", "disponibilizacao_dje", 5))
add("dje-tjsp-exemplo", "dje", "Apelação no TJSP: disponibilização 10/03/2026, 15 dias úteis", CPC,
    entrada("2026-03-10", "disponibilizacao_dje", 15, nomeAto="Apelação"))
add("publicacao-sabado", "dje", "Publicação em sábado: contagem inicia na segunda", CPC,
    entrada("2026-03-14", "publicacao", 5))
add("um-dia-sexta", "basico", "Prazo de 1 dia com publicação na sexta vence na segunda", CPC,
    entrada("2026-03-13", "publicacao", 1))
add("vence-antes-feriado", "feriado", "Prazo que termina antes do feriado não é afetado", CPC,
    entrada("2026-04-09", "publicacao", 5))
add("atravessa-tiradentes", "feriado", "Prazo atravessa Tiradentes (terça 21/04/2026)", CPC + "; Lei 10.607/2002",
    entrada("2026-04-14", "publicacao", 5))
add("atravessa-trabalho", "feriado", "Prazo atravessa 1º de maio (sexta)", CPC + "; Lei 10.607/2002",
    entrada("2026-04-29", "publicacao", 3))
add("atravessa-independencia", "feriado", "Prazo atravessa 7 de setembro (segunda)", CPC + "; Lei 10.607/2002",
    entrada("2026-09-03", "publicacao", 5))
add("atravessa-aparecida", "feriado", "Disponibilização 30/09/2026, 15 dias; 12/10 (segunda) não conta", CPC + "; Lei 6.802/1980",
    entrada("2026-09-30", "disponibilizacao_dje", 15, "STJ"))
add("finados", "feriado", "Prazo atravessa Finados (segunda 02/11/2026)", CPC + "; Lei 10.607/2002",
    entrada("2026-10-30", "publicacao", 2))
add("consciencia-negra-2026", "feriado", "Consciência Negra (sexta 20/11/2026) é feriado nacional desde 2024", CPC + "; Lei 14.759/2023",
    entrada("2026-11-18", "publicacao", 3))
add("consciencia-negra-2023", "feriado", "Em 2023 o 20/11 ainda não era nacional: depende de lei local (pendente)", "Lei 14.759/2023 (vigência a partir de 2024)",
    entrada("2023-11-17", "publicacao", 2))
add("recesso-15d", "recesso", "15 dias úteis atravessam o recesso de 20/12 a 20/01", "CPC, art. 220",
    entrada("2025-12-15", "publicacao", 15))
add("recesso-5d-sexta", "recesso", "Publicação na sexta 19/12/2025: contagem só retoma em 21/01/2026", "CPC, art. 220",
    entrada("2025-12-19", "publicacao", 5))
add("recesso-virada-ano", "recesso", "Publicação em 18/12/2026: virada de ano, retomada em 21/01/2027", "CPC, art. 220",
    entrada("2026-12-18", "publicacao", 5))
add("recesso-dje-dentro", "recesso", "Disponibilização dentro do recesso: publicação em 21/01/2026", "CPC, arts. 220 e 224, § 2º",
    entrada("2025-12-22", "disponibilizacao_dje", 5))
add("recesso-borda-20-jan", "recesso", "Publicação em 16/01/2026: 19 e 20/01 ainda são recesso", "CPC, art. 220",
    entrada("2026-01-16", "publicacao", 3))
add("recesso-1-dia", "recesso", "1 dia útil com publicação em 19/12/2025 vence em 21/01/2026", "CPC, art. 220",
    entrada("2025-12-19", "publicacao", 1))
add("recesso-desligado", "recesso", "Recesso desligado explicitamente (suspensaoRecesso=false)", "CPC, art. 220 (não aplicado)",
    entrada("2025-12-15", "publicacao", 5, suspensaoRecesso=False))
add("recesso-pre-dezembro", "recesso", "15 dias úteis a partir de 01/12/2025: o 15º dia cai após o recesso", "CPC, art. 220",
    entrada("2025-12-01", "publicacao", 15))
add("dobro-30d", "dobro", "Fazenda Pública: 15 dias em dobro (30 úteis)", "CPC, arts. 183 e 219",
    entrada("2026-03-02", "publicacao", 15, TRIBUNAL_SEM_ATO, prazoEmDobro=True))
add("dobro-recesso", "dobro", "Prazo em dobro atravessando o recesso", "CPC, arts. 183 e 220",
    entrada("2025-12-10", "publicacao", 10, prazoEmDobro=True))
add("bissexto-2024", "bissexto", "Fevereiro de 2024 (bissexto): 29/02 é dia útil", CPC,
    entrada("2024-02-27", "publicacao", 5))
add("bissexto-2028", "bissexto", "Fevereiro de 2028 (bissexto), Carnaval em 28 e 29/02", CPC,
    entrada("2028-02-25", "publicacao", 5))
add("clt-8d", "clt", "Recurso ordinário na CLT: 8 dias úteis (CLT, art. 895)", "CLT, art. 775",
    entrada("2026-03-04", "publicacao", 8, "TST", regime="clt_dias_uteis"))
add("cpp-5d-domingo", "cpp", "CPP: 5 dias corridos terminam no domingo, prorrogado para segunda", "CPP, art. 798, caput e § 3º",
    entrada("2026-03-10", "publicacao", 5, regime="cpp_dias_corridos"))
add("cpp-5d-sabado", "cpp", "CPP: 5 dias corridos terminam no sábado, prorrogado para segunda", "CPP, art. 798, caput e § 3º",
    entrada("2026-03-09", "publicacao", 5, regime="cpp_dias_corridos"))
add("cpp-5d-util", "cpp", "CPP: 5 dias corridos terminam em dia útil, sem prorrogação", "CPP, art. 798, caput",
    entrada("2026-03-04", "publicacao", 5, regime="cpp_dias_corridos"))
add("cpp-feriado", "cpp", "CPP: vencimento em Tiradentes, prorrogado para o dia útil seguinte", "CPP, art. 798, § 3º; Lei 10.607/2002",
    entrada("2026-04-16", "publicacao", 5, regime="cpp_dias_corridos"))
add("cpp-10d", "cpp", "CPP: 10 dias corridos atravessando fins de semana", "CPP, art. 798, caput",
    entrada("2026-03-02", "publicacao", 10, regime="cpp_dias_corridos"))
add("stf-sem-uf", "tribunal", "STF (sem UF): calendário 2026 verificado", "Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025); " + CPC,
    entrada("2026-09-03", "disponibilizacao_dje", 15, "STF"))

# Cenários que dependem de dias ainda pendentes de conferência: conservador mostra a data mais cedo.
PEND = "Dia pendente de conferência (METODO_CALENDARIO_FORENSE.md); ato do tribunal a confirmar"
add("carnaval-2026-conservador", "pendente", "Carnaval 2026 ignorado no modo conservador (data mais cedo)", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-13", "publicacao", 5, TRIBUNAL_SEM_ATO))
add("carnaval-2026-completo", "pendente", "Carnaval 2026 considerado; Quarta de Cinzas protrai o dia do começo", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-13", "publicacao", 5, TRIBUNAL_SEM_ATO, modo="completo"))
add("cinzas-meio-conservador", "pendente", "Quarta de Cinzas no meio do prazo (conservador)", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-12", "publicacao", 5, TRIBUNAL_SEM_ATO))
add("cinzas-meio-completo", "pendente", "Quarta de Cinzas no meio do prazo conta normalmente", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-12", "publicacao", 5, TRIBUNAL_SEM_ATO, modo="completo"))
add("cinzas-vencimento-conservador", "pendente", "Prazo de 4 dias; sem Carnaval vence na segunda 16/02", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-10", "publicacao", 4, TRIBUNAL_SEM_ATO))
add("cinzas-vencimento-completo", "pendente", "Prazo de 4 dias; vencimento cairia na Quarta de Cinzas e é protraído", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-10", "publicacao", 4, TRIBUNAL_SEM_ATO, modo="completo"))
add("carnaval-2028-completo", "pendente", "Carnaval 2028 em 28 e 29/02 (bissexto), Cinzas em 01/03", PEND + "; CPC, art. 224, § 1º",
    entrada("2028-02-25", "publicacao", 5, modo="completo"))
add("corpus-christi-conservador", "pendente", "Corpus Christi 2026 (04/06) ignorado no modo conservador", PEND,
    entrada("2026-06-02", "publicacao", 5, TRIBUNAL_SEM_ATO))
add("corpus-christi-completo", "pendente", "Corpus Christi 2026 considerado", PEND,
    entrada("2026-06-02", "publicacao", 5, TRIBUNAL_SEM_ATO, modo="completo"))
add("sexta-santa-conservador", "pendente", "Sexta-feira Santa 2026 (03/04) ignorada no modo conservador", PEND + "; Lei 9.093/1995, art. 2º",
    entrada("2026-04-01", "publicacao", 3, TRIBUNAL_SEM_ATO))
add("sexta-santa-completo", "pendente", "Sexta-feira Santa 2026 considerada (TJSP)", PEND + "; Lei 9.093/1995, art. 2º",
    entrada("2026-04-01", "publicacao", 3, TRIBUNAL_SEM_ATO, modo="completo"))
add("onze-agosto-tjsp-completo", "pendente", "11 de agosto não é feriado forense no TJSP", PEND,
    entrada("2026-08-07", "publicacao", 3, "TJSP", modo="completo"))
add("sp-9-julho-conservador", "pendente", "TJSP 2027 (sem provimento publicado): 9 de julho ignorado no modo conservador", PEND + "; lei estadual a conferir",
    entrada("2027-07-08", "publicacao", 5))
add("sp-9-julho-completo", "pendente", "TJSP 2027 (sem provimento publicado): 9 de julho considerado no modo completo", PEND + "; lei estadual a conferir",
    entrada("2027-07-08", "publicacao", 5, modo="completo"))
add("consciencia-negra-2023-completo", "pendente", "20/11/2023 considerado (lei local, pendente)", PEND,
    entrada("2023-11-17", "publicacao", 2, modo="completo"))
add("dobro-sexta-santa-completo", "pendente", "Prazo em dobro com Sexta-feira Santa considerada", PEND,
    entrada("2026-03-02", "publicacao", 15, TRIBUNAL_SEM_ATO, prazoEmDobro=True, modo="completo"))
add("cpp-sexta-santa-completo", "pendente", "CPP: vencimento na Sexta-feira Santa (completo) é prorrogado", PEND + "; CPP, art. 798, § 3º",
    entrada("2026-03-30", "publicacao", 4, TRIBUNAL_SEM_ATO, regime="cpp_dias_corridos", modo="completo"))

# ---- Calendário verificado (fontes primárias lidas em 07/10/2026) ----
P1010 = "Portaria STJ/GDG 1.010/2025"
add("stj-semana-santa-2026", "verificado", "STJ: Quarta, Quinta e Sexta Santas de 2026 não contam", P1010 + ", art. 1º, IV; Lei 5.010/1966, art. 62, II",
    entrada("2026-04-01", "publicacao", 3, "STJ"))
add("trf3-semana-santa-2026", "verificado", "TRF3: Semana Santa é feriado forense pela Lei 5.010 (Justiça Federal)", "Lei 5.010/1966, art. 62, II",
    entrada("2026-04-01", "publicacao", 3, "TRF3"))
add("tst-semana-santa-conservador", "pendente", "TST: art. 62 cita 'Tribunais Superiores', mas não há ato do TST conferido (conservador)", PEND + "; Lei 5.010/1966, art. 62, II",
    entrada("2026-04-01", "publicacao", 3, "TST"))
add("stj-onze-agosto-2026", "verificado", "STJ: 10/08 (ponto facultativo) e 11/08 (Lei 5.010, art. 62, IV) não contam", P1010 + ", art. 1º, X e XI",
    entrada("2026-08-07", "publicacao", 3, "STJ"))
add("stj-corpus-christi-2026", "verificado", "STJ: Corpus Christi e 05/06 sem expediente em 2026", P1010 + ", art. 1º, VIII e IX",
    entrada("2026-06-02", "publicacao", 5, "STJ"))
add("stf-corpus-christi-2026", "verificado", "STF: Corpus Christi e 05/06 sem expediente em 2026", CAL_STF,
    entrada("2026-06-02", "publicacao", 5, "STF"))
add("stj-cinzas-comeco-2026", "verificado", "STJ: Carnaval e Quarta de Cinzas (até 14h) protraem o dia do começo", P1010 + ", art. 1º, II e III; CPC, art. 224, § 1º",
    entrada("2026-02-13", "publicacao", 5, "STJ"))
add("stf-ponto-facultativo-30-out", "verificado", "STF: 30/10/2026 (transferência do Dia do Servidor) e Finados não contam", CAL_STF,
    entrada("2026-10-28", "publicacao", 2, "STF"))
add("stj-ferias-julho-5d", "verificado", "STJ: prazos suspensos de 2 a 31 de julho; retoma em 03/08", "LC 35/1979, art. 66, § 1º; RISTJ, arts. 81 e 106; Portaria STJ/GP 455/2026",
    entrada("2026-06-30", "publicacao", 5, "STJ"))
add("stj-ferias-julho-8d", "verificado", "STJ: após as férias de julho, 10/08 (PF) e 11/08 não contam", "LC 35/1979, art. 66, § 1º; " + P1010,
    entrada("2026-06-30", "publicacao", 8, "STJ"))
add("stf-ferias-julho-5d", "verificado", "STF: prazos não correm nas férias de julho", "LC 35/1979, art. 66, § 1º; RISTF, arts. 78 e 105",
    entrada("2026-06-30", "publicacao", 5, "STF"))
add("tjsp-sem-ferias-julho", "verificado", "TJSP não tem férias coletivas em julho (contraste com STJ/STF)", "CF, art. 93, XII (vedadas férias coletivas em 2º grau)",
    entrada("2026-06-30", "publicacao", 5, "TJSP"))
add("stj-recesso-ate-31-jan", "verificado", "STJ: prazos suspensos de 20/12 a 31/01 (não a 20/01) e Cinzas protrai o vencimento", "LC 35/1979, art. 66, § 1º; RISTJ, arts. 81 e 106; Portaria STJ/GP 941/2025",
    entrada("2025-12-15", "publicacao", 15, "STJ"))
add("stf-recesso-ate-31-jan", "verificado", "STF: prazos não correm de 20/12 a 31/01", "RISTF, arts. 78 e 105; LC 35/1979, art. 66, § 1º",
    entrada("2025-12-19", "publicacao", 2, "STF"))
add("clt-recesso-775a", "clt", "CLT: o recesso de 20/12 a 20/01 também suspende os prazos", "CLT, art. 775-A (Lei 13.545/2017)",
    entrada("2025-12-15", "publicacao", 8, "TST", regime="clt_dias_uteis"))
add("cpp-trf3-reu-preso", "cpp", "CPP, réu preso no TRF3: sem suspensão (art. 798-A, I); vencimento em 20/12 cai em feriado forense (Lei 5.010, art. 62, I) e vai a 07/01", "CPP, arts. 798, § 3º, e 798-A, I; Lei 5.010/1966, art. 62, I",
    entrada("2026-12-15", "publicacao", 5, "TRF3", regime="cpp_dias_corridos", excecaoSuspensaoCriminal=True))
add("cpp-tjsp-reu-preso", "cpp", "CPP, réu preso no TJSP: sem suspensão; vence no domingo 20/12 e, com 21 a 31/12 em recesso sem expediente, vai a 04/01/2027 (o recesso de 1º a 6/01/2027 ainda não está carregado: sem selo)", "CPP, arts. 798, § 3º, e 798-A, I",
    entrada("2026-12-15", "publicacao", 5, "TJSP", regime="cpp_dias_corridos", excecaoSuspensaoCriminal=True))
add("cpp-recesso-suspende", "cpp", "CPP: prazo de 5 dias que atravessa 20/12 fica suspenso até 20/01 e retoma em 21/01", "CPP, art. 798-A (Lei 14.365/2022)",
    entrada("2026-12-15", "publicacao", 5, "TJSP", regime="cpp_dias_corridos"))
add("cpp-recesso-10d", "cpp", "CPP: publicação em 19/12/2025, 10 dias corridos contados só depois de 20/01", "CPP, art. 798-A (Lei 14.365/2022)",
    entrada("2025-12-19", "publicacao", 10, "TJSP", regime="cpp_dias_corridos"))
add("cpp-recesso-trf3", "cpp", "CPP no TRF3: suspensão até 20/01; a retomada em 21/01 é dia útil, sem prorrogação", "CPP, art. 798-A; Lei 5.010/1966, art. 62, I",
    entrada("2026-12-15", "publicacao", 5, "TRF3", regime="cpp_dias_corridos"))
add("portal-segunda", "portal", "Intimação eletrônica: consulta na segunda; dia do começo na terça; contagem a partir de quarta", "CPC, arts. 224, caput, e 231, V; Lei 11.419/2006, art. 5º",
    entrada("2026-03-09", "intimacao_portal", 5))
add("portal-sexta", "portal", "Intimação eletrônica: consulta na sexta; dia do começo na segunda", "CPC, arts. 224, caput, e 231, V; Lei 11.419/2006, art. 5º",
    entrada("2026-03-13", "intimacao_portal", 5))
add("portal-sabado", "portal", "Intimação eletrônica: consulta no sábado; a intimação se realiza na segunda (dia do começo) e a contagem começa na terça (leitura A, validada)", "CPC, art. 231, V; Lei 11.419/2006, art. 5º, § 2º",
    entrada("2026-03-14", "intimacao_portal", 5))
add("portal-feriado", "portal", "Intimação eletrônica: consulta na véspera de Tiradentes; dia do começo é o dia útil seguinte", "CPC, art. 231, V; Lei 662/1949, art. 1º",
    entrada("2026-04-20", "intimacao_portal", 5))


# ---- JEF, MP, Defensoria e litisconsórcio (F2-07) ----
JEF = "Lei 9.099/1995, art. 12-A (dias úteis)"
add("jef-5d-embargos", "jef", "JEF: embargos de declaração em 5 dias úteis (Lei 9.099, art. 49)", JEF + "; art. 49",
    entrada("2026-03-10", "publicacao", 5, regime="jef_dias_uteis"))
add("jef-10d-recurso", "jef", "JEF: recurso inominado em 10 dias úteis (Lei 9.099, arts. 42 e 12-A)", JEF + "; art. 42",
    entrada("2026-03-10", "publicacao", 10, regime="jef_dias_uteis"))
add("jef-dobro-ignorado", "jef", "JEF: o prazo em dobro não é aplicado a ente público (Lei 10.259, art. 9º; Lei 12.153, art. 7º)", JEF + "; Lei 10.259/2001, art. 9º; Lei 12.153/2009, art. 7º",
    entrada("2026-03-10", "publicacao", 10, regime="jef_dias_uteis", prazoEmDobro=True))
add("jef-recesso", "jef", "JEF: a suspensão de 20/12 a 20/01 vale nos Juizados (Res. CNJ 244/2016, art. 3º)", "Res. CNJ 244/2016, art. 3º; CPC, art. 220; Lei 9.099/1995, art. 12-A",
    entrada("2025-12-15", "publicacao", 10, regime="jef_dias_uteis"))
add("jef-recesso-desligado", "jef", "JEF: suspensão desligada pelo usuário conta o recesso (resultado de quem opta por não suspender)", "Opção do usuário; ver Res. CNJ 244/2016, art. 3º",
    entrada("2025-12-15", "publicacao", 10, regime="jef_dias_uteis", suspensaoRecesso=False))
add("cpp-stj-ferias-julho", "cpp", "CPP no STJ: as férias de julho não suspendem prazo criminal; vencimento em domingo vai à segunda 06/07", "CPP, art. 798, caput e § 3º; Portaria STJ/GP 280/2023",
    entrada("2026-06-30", "publicacao", 5, "STJ", regime="cpp_dias_corridos"))
add("cpp-stf-ferias-janeiro", "cpp", "CPP no STF: depois de 20/01 o prazo criminal corre mesmo nas férias de janeiro", "CPP, arts. 798, caput, e 798-A; RISTF, art. 105; comunicado do STF (Portaria GDG 218/2024)",
    entrada("2026-01-22", "publicacao", 5, "STF", regime="cpp_dias_corridos"))
add("cpp-stj-recesso-798a", "cpp", "CPP no STJ: suspenso até 20/01 (não até 31/01); retoma em 21/01 e o vencimento de domingo vai à segunda", "CPP, art. 798-A; Portaria STJ/GP 584/2022",
    entrada("2025-12-19", "publicacao", 5, "STJ", regime="cpp_dias_corridos"))
add("dobro-mp-intimacao-pessoal", "dobro", "Ministério Público: 15 dias em dobro (30 úteis) a partir da intimação pessoal por carga", "CPC, arts. 180 e 183, § 1º",
    entrada("2026-03-10", "carga_ou_audiencia", 15, prazoEmDobro=True))
add("dobro-defensoria-embargos", "dobro", "Defensoria Pública: embargos de declaração em dobro (10 úteis)", "CPC, art. 186",
    entrada("2026-03-10", "carga_ou_audiencia", 5, prazoEmDobro=True))
add("litisconsorcio-sem-dobro", "dobro", "Litisconsortes com advogados distintos: o art. 229 gera aviso e não duplica o prazo", "CPC, art. 229 e § 2º (autos eletrônicos)",
    entrada("2026-03-10", "publicacao", 15, litisconsortesComAdvogadosDistintos=True))


# ---- Cenários para completar a suíte (F2-09): lacunas de CLT, STF/STJ, TRFs, CPP, JEF, portal e dobro ----
add("clt-ed-5d-feriado", "clt", "CLT: embargos de declaração em 5 dias úteis atravessando 7 de setembro", "CLT, arts. 775 e 897-A; Lei 662/1949, art. 1º",
    entrada("2026-09-03", "publicacao", 5, "TST", regime="clt_dias_uteis"))
add("clt-recesso-borda-20-jan", "clt", "CLT: publicação em 16/01/2026; 19 e 20/01 ainda são recesso e a contagem retoma em 21/01", "CLT, art. 775-A",
    entrada("2026-01-16", "publicacao", 3, "TST", regime="clt_dias_uteis"))
add("stj-dobro-ferias-julho", "dobro", "STJ: prazo em dobro (30 úteis) interrompido pelas férias de julho e por 10 e 11/08", "CPC, arts. 183 e 219; LC 35/1979, art. 66, § 1º; " + P1010,
    entrada("2026-06-26", "publicacao", 15, "STJ", prazoEmDobro=True))
add("stf-dje-ferias-janeiro", "verificado", "STF: disponibilização em 30/01/2026 (férias); publicação só em 02/02 e contagem a partir de 03/02", "RISTF, arts. 78 e 105; CPC, art. 224, § 2º; " + CAL_STF,
    entrada("2026-01-30", "disponibilizacao_dje", 5, "STF"))
add("stj-dje-semana-santa", "verificado", "STJ: disponibilização em 31/03/2026; 1 a 3/04 são feriados, publicação na segunda 06/04", "CPC, art. 224, § 2º; " + P1010 + ", art. 1º, IV",
    entrada("2026-03-31", "disponibilizacao_dje", 3, "STJ"))
add("trf3-carnaval-conservador", "pendente", "TRF3: Carnaval é feriado (Lei 5.010); Quarta de Cinzas ainda sem ato do TRF3 (conservador)", "Lei 5.010/1966, art. 62, III; " + PEND + " (Cinzas)",
    entrada("2026-02-13", "publicacao", 3, "TRF3"))
add("trf3-finados", "verificado", "TRF3: 2 de novembro (segunda) não conta", "Lei 662/1949, art. 1º",
    entrada("2026-10-30", "publicacao", 3, "TRF3"))
add("tjsp-8-dezembro", "feriado", "TJSP 2026: 7/12 (suspensão do expediente) e 8/12 (Dia da Justiça) não contam", "Provimento CSM 2.813/2025, art. 1º",
    entrada("2026-12-04", "publicacao", 3, "TJSP"))
add("stj-7-e-8-dezembro", "verificado", "STJ: 7/12 (ponto facultativo) e 8/12 (Dia da Justiça) não contam", P1010 + ", art. 1º, XVII e XVIII",
    entrada("2026-12-04", "publicacao", 3, "STJ"))
add("cpp-8d-sabado", "cpp", "CPP: 8 dias corridos vencem no sábado 14/03 e vão para a segunda 16/03", "CPP, art. 798, caput e § 3º",
    entrada("2026-03-06", "publicacao", 8, regime="cpp_dias_corridos"))
add("cpp-vence-aparecida", "cpp", "CPP: 3 dias corridos vencem em 12/10 (segunda, feriado) e vão para 13/10", "CPP, art. 798, § 3º; Lei 6.802/1980, art. 1º",
    entrada("2026-10-09", "publicacao", 3, regime="cpp_dias_corridos"))
add("jef-dje-sexta", "jef", "JEF: disponibilização na sexta 13/03, publicação na segunda, recurso inominado de 10 dias úteis", "Lei 9.099/1995, arts. 42 e 12-A; CPC, art. 224, § 2º",
    entrada("2026-03-13", "disponibilizacao_dje", 10, regime="jef_dias_uteis"))
add("portal-recesso", "portal", "Intimação eletrônica consultada em 19/12/2025: o dia do começo é 21/01/2026, depois do recesso", "CPC, arts. 220 e 231, V; Lei 11.419/2006, art. 5º",
    entrada("2025-12-19", "intimacao_portal", 5))
add("dobro-embargos-feriado", "dobro", "Fazenda: embargos de declaração em dobro (10 úteis) atravessando Tiradentes", "CPC, arts. 183 e 1.023",
    entrada("2026-04-14", "carga_ou_audiencia", 5, prazoEmDobro=True))
add("um-dia-vespera-feriado", "basico", "Prazo de 1 dia útil com publicação na quinta 30/04: sexta 1º/05 é feriado e vence na segunda 04/05", "CPC, art. 219; Lei 662/1949, art. 1º",
    entrada("2026-04-30", "publicacao", 1))


# ---- Calendários dos tribunais estaduais (F2-04): TJSP e TJMG com ato lido; TJAL parcial ----
PROV = "Provimento CSM 2.813/2025 (TJSP)"
PCTJMG = "Portaria Conjunta 1.764/PR/2026 (TJMG)"
add("tjsp-cinzas-2026", "verificado", "TJSP 2026: Carnaval (16 e 17/02) e Quarta de Cinzas com expediente parcial protraem o dia do começo", PROV + ", arts. 1º e 2º; CPC, art. 224, § 1º",
    entrada("2026-02-13", "publicacao", 3, "TJSP"))
add("tjsp-9-julho-2026", "verificado", "TJSP 2026: 9 de julho (Data Magna, Lei Estadual 9.497/1997) e 10/07 (suspensão) não contam", PROV + ", art. 1º",
    entrada("2026-07-08", "publicacao", 3, "TJSP"))
add("tjsp-semana-santa-2026", "verificado", "TJSP 2026: Endoenças (02/04) e Sexta-feira da Paixão (03/04) não contam", PROV + ", art. 1º",
    entrada("2026-04-01", "publicacao", 3, "TJSP"))
add("tjsp-dje-recesso-2026", "verificado", "TJSP: disponibilização em 18/12/2026; recesso até 20/01/2027; 2027 ainda sem provimento (sem selo)", PROV + ", art. 1º, § 1º; CPC, art. 220",
    entrada("2026-12-18", "disponibilizacao_dje", 5, "TJSP"))
add("tjmg-carnaval-2026", "verificado", "TJMG 2026: segunda, terça e quarta-feira de cinzas (16 a 18/02) suspensas por inteiro", PCTJMG + ", art. 1º, I; Res. OE 458/2004, art. 1º, III",
    entrada("2026-02-13", "publicacao", 3, "TJMG"))
add("tjmg-semana-santa-2026", "verificado", "TJMG 2026: quarta a sexta-feira da Semana Santa (01 a 03/04) suspensas", PCTJMG + ", art. 1º, II; Res. OE 458/2004, art. 1º, IV",
    entrada("2026-03-31", "publicacao", 3, "TJMG"))
add("tjmg-permanente-2028", "verificado", "TJMG 2028 (sem portaria anual): Carnaval de segunda a quarta (28/02 a 01/03) pela resolução permanente; sem selo", "Res. OE TJMG 458/2004, art. 1º, III",
    entrada("2028-02-25", "publicacao", 3, "TJMG"))
add("tjmg-corpus-christi-comarca", "pendente", "TJMG: 4 e 5/06 dependem da comarca (feriado municipal em Belo Horizonte e em outras): pendente", PCTJMG + ", art. 1º, IV; " + PEND,
    entrada("2026-06-02", "publicacao", 3, "TJMG"))
add("tjal-atos-2026", "verificado", "TJAL 2026: 20/04 (Tiradentes, suspensão) e 21/04 não contam", "Ato Normativo TJAL 03/2026 (notícia oficial do tribunal)",
    entrada("2026-04-16", "publicacao", 3, "TJAL"))
add("tjal-junho-art37-pendente", "pendente", "TJAL: o art. 37 da Lei 6.564/2005 (feriados forenses de 23/06 a 01/07) ainda não teve a vigência confirmada: data alternativa grande", "Lei estadual AL 6.564/2005, art. 37; " + PEND,
    entrada("2026-06-19", "publicacao", 5, "TJAL"))


# ---- TJRJ 2026 (F2-04): informativo oficial, sem selo ----
INFRJ = "TJRJ, informativo de suspensão de prazos 2026 (cita o ato)"
add("tjrj-carnaval-2026", "pendente", "TJRJ 2026: 13/02 é ponto facultativo (alerta: o modo conservador conta o dia, o completo não); Carnaval (16 a 18/02) não conta", INFRJ + "; Ato Executivo 20/2026; Lei 10.633/2024, art. 83, III",
    entrada("2026-02-12", "publicacao", 3, "TJRJ"))
add("tjrj-sao-jorge-2026", "pendente", "TJRJ 2026: 23/04 (São Jorge, feriado estadual) não conta; 24/04 é ponto facultativo (alerta)", INFRJ + "; Lei estadual 5.198/2008; Ato Executivo 79/2026",
    entrada("2026-04-22", "publicacao", 3, "TJRJ"))
add("tjrj-copa-2026", "verificado", "TJRJ 2026: jogos da Copa em 24/06 (prazos suspensos) e 29/06 (expediente e prazos) não contam", INFRJ + "; Atos Executivos 96 e 103/2026",
    entrada("2026-06-23", "publicacao", 3, "TJRJ"))

# ---- Feriados estaduais por lei (F2-05): PE, RS e GO com norma lida; ES, PR e DF corrigidos ----
LEIEST = "Lei 9.093/1995, art. 1º, II; CPC, art. 216"
add("tjpe-data-magna", "verificado", "TJPE: 6 de março (Data Magna, Lei estadual PE 16.241/2017, art. 49) não conta em nenhum ano", LEIEST + "; Lei PE 16.241/2017, art. 49",
    entrada("2026-03-05", "publicacao", 3, "TJPE"))
add("tjrs-20-setembro", "verificado", "TJRS: 20 de setembro (data magna, Constituição estadual, art. 6º; Decreto 36.180/1995) não conta", LEIEST + "; Decreto RS 36.180/1995",
    entrada("2027-09-17", "publicacao", 3, "TJRS"))
add("tjgo-24-outubro", "verificado", "TJGO: 24 de outubro (pedra fundamental de Goiânia, feriado estadual) não conta", LEIEST + "; Lei GO 19.850/2017, art. 1º",
    entrada("2028-10-23", "publicacao", 3, "TJGO"))
add("tjes-penha-pendente", "pendente", "TJES: Nossa Senhora da Penha (segunda após a oitava da Páscoa, Lei ES 11.010/2019, texto não lido): só data alternativa", LEIEST + "; " + PEND,
    entrada("2027-04-02", "publicacao", 3, "TJES"))
# TJPR 2026: Decreto Judiciário 621/2025 lido por inteiro (arts. 1º a 3º). Estes cenários nascem pendentes de validação do revisor.
TJPR = "Decreto Judiciário TJPR 621/2025 (lido em 10/10/2026); CPC, arts. 219 e 224"
add("tjpr-2026-carnaval", "verificado", "TJPR 2026: 16/02 (suspensão) e 17/02 (Carnaval) não contam; vence 23/02", TJPR + ", arts. 1º e 2º",
    entrada("2026-02-12", "publicacao", 5, "TJPR"))
add("tjpr-2026-corpus-christi", "verificado", "TJPR 2026: 04/06 (Corpus Christi) e 05/06 (suspensão) não contam", TJPR + ", arts. 1º e 2º",
    entrada("2026-06-02", "publicacao", 5, "TJPR"))
add("tjpr-2026-dia-servidor", "verificado", "TJPR 2026: 30/10 (Dia do Funcionário Público, transferido de 28/10) e Finados (02/11) não contam", TJPR + ", art. 1º",
    entrada("2026-10-28", "publicacao", 2, "TJPR"))
# TJRS 2026: Ato 05/2025 OE e Ato Conjunto 004/2026 (lidos em 10/10/2026). Nascem pendentes de validação do revisor.
TJRS = "Ato 05/2025 do Órgão Especial do TJRS (lido em 10/10/2026); CPC, arts. 219 e 224"
add("tjrs-2026-carnaval", "verificado", "TJRS 2026: 16/02 e 17/02 (Carnaval) não contam; vence 23/02", TJRS,
    entrada("2026-02-12", "publicacao", 5, "TJRS"))
add("tjrs-2026-dia-da-justica", "verificado", "TJRS 2026: 08/12 (Dia da Justiça) não conta", TJRS,
    entrada("2026-12-04", "publicacao", 3, "TJRS"))
add("tjrs-2026-ato-conjunto-energia", "verificado", "TJRS: 02/07/2026 teve os prazos suspensos (falta de energia); não conta", "Ato Conjunto 004/2026 (P e CGJ), art. 1º (lido em 10/10/2026); CPC, arts. 219 e 224",
    entrada("2026-07-01", "publicacao", 2, "TJRS"))
add("tjrs-2026-corpus-christi-conservador", "pendente", "TJRS: Corpus Christi (04/06/2026) é feriado municipal de Porto Alegre; ignorado no modo conservador", TJRS + " (asterisco: feriado municipal)",
    entrada("2026-06-02", "publicacao", 5, "TJRS"))
add("tjrs-2026-corpus-christi-completo", "pendente", "TJRS: Corpus Christi (04/06/2026) considerado no modo completo", TJRS + " (asterisco: feriado municipal)",
    entrada("2026-06-02", "publicacao", 5, "TJRS", modo="completo"))
# TJBA 2026: Decreto Judiciário 1050/2025 (lido por inteiro) e 944/2026. Nascem pendentes de validação do revisor.
TJBA = "Decreto Judiciário TJBA 1050/2025, arts. 5º e 8º (lido em 10/10/2026); CPC, arts. 219 e 224"
add("tjba-2026-carnaval", "pendente", "TJBA 2026: 12 e 13/02 são pontos facultativos (alerta: o modo conservador conta os dias, o completo não); 16, 17 e 18/02 (Carnaval e Cinzas) não contam", TJBA,
    entrada("2026-02-10", "publicacao", 5, "TJBA"))
add("tjba-2026-sao-joao", "pendente", "TJBA 2026: 22 e 23/06 são pontos facultativos (alerta); 24/06 (São João) e 29/06 (Copa, Decreto 944/2026) não contam", TJBA,
    entrada("2026-06-19", "publicacao", 3, "TJBA"))
add("tjba-2026-independencia-da-bahia", "pendente", "TJBA 2026: 02/07 (Independência da Bahia) não conta; 03/07 é ponto facultativo (alerta)", TJBA,
    entrada("2026-07-01", "publicacao", 3, "TJBA"))
add("tjba-2026-copa-29-junho", "verificado", "TJBA: 29/06/2026 teve os prazos suspensos (jogo da Seleção na Copa); não conta", "Decreto Judiciário TJBA 944/2026, art. 3º (lido em 10/10/2026); CPC, arts. 219 e 224",
    entrada("2026-06-26", "publicacao", 2, "TJBA"))
# TJDF (TJDFT) 2026: Portarias Conjuntas 105/2025 e 48/2026 (lidas em 10/10/2026). Nascem pendentes de validação do revisor.
TJDFT = "Portaria Conjunta TJDFT 105/2025, arts. 2º, 4º e 5º (lida em 10/10/2026); CPC, arts. 219 e 224"
add("tjdf-2026-carnaval", "verificado", "TJDFT 2026: 16, 17 e 18/02 (Carnaval e Quarta-feira de Cinzas) não contam; vence 24/02", TJDFT,
    entrada("2026-02-12", "publicacao", 5, "TJDF"))
add("tjdf-2026-semana-santa", "verificado", "TJDFT 2026: 01 a 03/04 (Semana Santa) não contam", TJDFT,
    entrada("2026-03-31", "publicacao", 2, "TJDF"))
add("tjdf-2026-ponto-facultativo-20-abril", "pendente", "TJDFT 2026: 20/04 é ponto facultativo (alerta); 21/04 (Tiradentes) não conta", TJDFT,
    entrada("2026-04-16", "publicacao", 3, "TJDF"))
add("tjdf-2026-copa-24-junho", "verificado", "TJDFT: prazo que termina em 24/06/2026 (jogo da Seleção, expediente das 9h às 16h) é prorrogado para o primeiro dia útil", "Portaria Conjunta TJDFT 48/2026, arts. 1º, IV, e 2º (lida em 10/10/2026); CPC, arts. 219 e 224",
    entrada("2026-06-17", "publicacao", 5, "TJDF"))
add("tjdf-2026-copa-29-junho", "verificado", "TJDFT: 29/06/2026 (ponto facultativo no jogo das 14h) não conta", "Portaria Conjunta TJDFT 48/2026, art. 1º, I (redação da Portaria Conjunta 53/2026); CPC, arts. 219 e 224",
    entrada("2026-06-26", "publicacao", 2, "TJDF"))
# TJSC 2026: Resolução GP 1/2026 (compilada) e Resolução GP 31/2026 (lidas em 10/10/2026). Nascem pendentes de validação do revisor.
TJSC = "Resolução GP TJSC 1/2026, Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224"
add("tjsc-2026-carnaval", "verificado", "TJSC 2026: 16 e 17/02 (Carnaval) não contam; a Quarta-feira de Cinzas conta no meio do prazo", TJSC,
    entrada("2026-02-12", "publicacao", 5, "TJSC"))
add("tjsc-2026-cinzas-vencimento", "verificado", "TJSC 2026: prazo que termina na Quarta-feira de Cinzas (expediente a partir das 12h) é protraído para o dia seguinte", TJSC + "; Resolução GP 13/2022 (citada na notícia oficial de 13/02/2026)",
    entrada("2026-02-12", "publicacao", 2, "TJSC"))
add("tjsc-2026-corpus-christi", "verificado", "TJSC 2026: 04/06 (Corpus Christi) não conta; 05/06 conta (não há emenda)", TJSC,
    entrada("2026-06-02", "publicacao", 5, "TJSC"))
add("tjsc-2026-copa-24-junho", "verificado", "TJSC: prazo que termina em 24/06/2026 (jogo às 19h, expediente das 10h às 17h) é postergado para o primeiro dia útil", "Resolução GP TJSC 31/2026, arts. 1º, VI, e 2º (lida em 10/10/2026); CPC, art. 224, § 1º",
    entrada("2026-06-17", "publicacao", 5, "TJSC"))
add("tjsc-2026-dia-funcionario-publico", "verificado", "TJSC 2026: 28/10 (Dia do Funcionário Público, sem transferência para 30/10) não conta", TJSC,
    entrada("2026-10-26", "publicacao", 3, "TJSC"))
add("tjsc-2026-dia-da-justica", "verificado", "TJSC 2026: 08/12 (Dia da Justiça, efeitos forenses) não conta", TJSC,
    entrada("2026-12-04", "publicacao", 3, "TJSC"))
# TJPE 2026: Ato Conjunto 43/2025 e Atos 966 e 977/2026 (lidos em 10/10/2026). Nascem pendentes de validação do revisor.
TJPE = "Ato Conjunto TJPE 43/2025, art. 1º e parágrafo único (lido em 10/10/2026); CPC, arts. 219 e 224"
add("tjpe-2026-carnaval", "verificado", "TJPE 2026: 16, 17 e 18/02 (Carnaval e Cinzas) não contam; vence 24/02", TJPE,
    entrada("2026-02-12", "publicacao", 5, "TJPE"))
add("tjpe-2026-corpus-christi-transferido", "verificado", "TJPE 2026: Corpus Christi foi transferido para 22/06; 04/06 conta como dia útil", TJPE,
    entrada("2026-06-02", "publicacao", 3, "TJPE"))
add("tjpe-2026-sao-joao", "verificado", "TJPE 2026: 22 a 26/06 e 29 e 30/06 (Corpus Christi, São João e feriados forenses de junho) não contam", TJPE,
    entrada("2026-06-19", "publicacao", 3, "TJPE"))
add("tjpe-2026-dez-de-agosto", "verificado", "TJPE 2026: 10/08 (Dia dos Cursos Jurídicos, antecipado de 11/08) não conta; 11/08 conta", TJPE,
    entrada("2026-08-07", "publicacao", 2, "TJPE"))
add("tjpe-2026-dia-servidor", "verificado", "TJPE 2026: 30/10 (Dia do Servidor, transferido de 28/10) e Finados (02/11) não contam", TJPE,
    entrada("2026-10-28", "publicacao", 2, "TJPE"))
add("tjpe-2026-pje-maio", "verificado", "TJPE: prazos suspensos de 11 a 15/05/2026 por instabilidade do PJe", "Atos TJPE 966/2026 e 977/2026, art. 1º (lidos em 10/10/2026); CPC, arts. 219 e 224",
    entrada("2026-05-08", "publicacao", 3, "TJPE"))
# TJCE 2026: Portaria 2924/2025 e Portarias 1169, 1401 e 1440/2026 (lidas em 10/10/2026). Nascem pendentes de validação do revisor.
TJCE = "Portaria TJCE 2924/2025, art. 1º e Anexo Único (lida em 10/10/2026); CPC, arts. 219 e 224"
add("tjce-2026-carnaval", "pendente", "TJCE 2026: 16 e 17/02 (Carnaval, ponto facultativo) e a Quarta-feira de Cinzas (ponto facultativo até as 14h) são alertas", TJCE,
    entrada("2026-02-12", "publicacao", 5, "TJCE"))
add("tjce-2026-cinzas-vencimento", "pendente", "TJCE 2026: prazo que termina na Quarta-feira de Cinzas (ponto facultativo até as 14h): alerta de prorrogação", TJCE,
    entrada("2026-02-12", "publicacao", 2, "TJCE"))
add("tjce-2026-sao-jose-data-magna", "pendente", "TJCE 2026: 19/03 (São José) é ponto facultativo (alerta); 25/03 (Data Magna do Ceará) não conta", TJCE,
    entrada("2026-03-17", "publicacao", 6, "TJCE"))
add("tjce-2026-corpus-christi", "pendente", "TJCE 2026: 04/06 (Corpus Christi) e 05/06 são pontos facultativos (alertas)", TJCE + "; Portaria TJCE 1169/2026, art. 1º",
    entrada("2026-06-02", "publicacao", 3, "TJCE"))
add("tjce-2026-copa-24-junho", "verificado", "TJCE: prazo que termina em 24/06/2026 (expediente único das 8h às 15h) é prorrogado para o primeiro dia útil", "Portaria TJCE 1401/2026, art. 1º (lida em 10/10/2026); CPC, art. 224, § 1º",
    entrada("2026-06-17", "publicacao", 5, "TJCE"))
add("tjce-2026-copa-29-junho", "verificado", "TJCE: o começo do prazo em 29/06/2026 (expediente único das 8h às 12h) é postergado", "Portaria TJCE 1440/2026, art. 1º (lida em 10/10/2026); CPC, art. 224, § 1º",
    entrada("2026-06-26", "publicacao", 2, "TJCE"))
add("tjce-2026-dia-servidor", "verificado", "TJCE 2026: 28/10 (Dia do Servidor Público Estadual, sem transferência) não conta", TJCE,
    entrada("2026-10-26", "publicacao", 3, "TJCE"))
add("tjce-2026-fortaleza-13-abril-conservador", "pendente", "TJCE: 13/04/2026 (ponto facultativo só na Comarca de Fortaleza) ignorado no modo conservador", "Portaria TJCE 727/2026, art. 1º; depende da comarca; CPC, arts. 219 e 224",
    entrada("2026-04-09", "publicacao", 3, "TJCE"))
add("tjce-2026-fortaleza-13-abril-completo", "pendente", "TJCE: 13/04/2026 considerado no modo completo", "Portaria TJCE 727/2026, art. 1º; depende da comarca; CPC, arts. 219 e 224",
    entrada("2026-04-09", "publicacao", 3, "TJCE", modo="completo"))
# TJES 2026: Ato Normativo 176/2026 e Atos 103, 113, 124 e 130/2026 (lidos em 10/10/2026). Nascem pendentes de validação do revisor.
TJES = "Ato Normativo TJES 176/2026, Anexo Único (lido em 10/10/2026); CPC, arts. 219 e 224"
add("tjes-2026-carnaval", "verificado", "TJES 2026: 16, 17 e 18/02 (Carnaval e Quarta-feira de Cinzas) não contam; vence 24/02", TJES,
    entrada("2026-02-12", "publicacao", 5, "TJES"))
add("tjes-2026-nossa-senhora-da-penha", "verificado", "TJES 2026: 13/04 (Nossa Senhora da Penha, Lei estadual 11.010/2019) não conta", TJES,
    entrada("2026-04-09", "publicacao", 3, "TJES"))
add("tjes-2026-ponto-facultativo-20-abril", "pendente", "TJES 2026: 20/04 é ponto facultativo (alerta); 21/04 (Tiradentes) não conta", TJES,
    entrada("2026-04-16", "publicacao", 3, "TJES"))
add("tjes-2026-dia-servidor", "pendente", "TJES 2026: o Dia do Servidor foi transferido para 30/10 como ponto facultativo (alerta); 28/10 conta; Finados (02/11) não conta", TJES + "; considerandos do Ato 176/2026",
    entrada("2026-10-27", "publicacao", 3, "TJES"))
add("tjes-2026-dia-da-justica", "pendente", "TJES 2026: 07/12 é ponto facultativo (alerta); 08/12 (Dia da Justiça) não conta", TJES,
    entrada("2026-12-04", "publicacao", 3, "TJES"))
add("tjes-2026-pje-8-julho", "verificado", "TJES: prazo que vence em 08/07/2026 (indisponibilidade do PJe) é prorrogado para o primeiro dia útil", "Ato Normativo TJES 124/2026, art. 1º (lido em 10/10/2026); CNJ, Res. 185/2014, art. 11",
    entrada("2026-07-01", "publicacao", 5, "TJES"))
# TJGO 2026: calendário oficial (PDF de 13/01/2026) e Decreto Judiciário 3079/2026 (lidos em 10/10/2026). Nascem pendentes de validação do revisor.
TJGO = "Calendário oficial TJGO 2026, Regimento Interno art. 123 (lido em 10/10/2026); CPC, arts. 219 e 224"
add("tjgo-2026-carnaval", "verificado", "TJGO 2026: 16 e 17/02 (Carnaval) não contam; a Quarta-feira de Cinzas (feriado até as 12h) conta no meio do prazo", TJGO,
    entrada("2026-02-12", "publicacao", 5, "TJGO"))
add("tjgo-2026-cinzas-vencimento", "verificado", "TJGO 2026: prazo que termina na Quarta-feira de Cinzas (feriado até as 12h) é protraído para o dia seguinte", TJGO,
    entrada("2026-02-12", "publicacao", 2, "TJGO"))
add("tjgo-2026-semana-santa", "verificado", "TJGO 2026: 01 a 03/04 (Semana Santa, de quarta a sexta-feira) não contam", TJGO,
    entrada("2026-03-31", "publicacao", 2, "TJGO"))
add("tjgo-2026-ponto-facultativo-20-abril", "pendente", "TJGO 2026: 20/04 é ponto facultativo (alerta); 21/04 (Tiradentes) não conta", TJGO,
    entrada("2026-04-16", "publicacao", 3, "TJGO"))
add("tjgo-2026-corpus-christi", "pendente", "TJGO 2026: 04/06 (Corpus Christi) não conta; 05/06 é ponto facultativo (alerta)", TJGO,
    entrada("2026-06-02", "publicacao", 3, "TJGO"))
add("tjgo-2026-copa-29-junho", "verificado", "TJGO: o começo do prazo em 29/06/2026 (expediente das 7h às 12h) é postergado", "Decreto Judiciário TJGO 3079/2026, arts. 1º e 2º (lido em 10/10/2026); CPC, art. 224, § 1º",
    entrada("2026-06-26", "publicacao", 2, "TJGO"))
add("tjgo-2026-dia-servidor", "verificado", "TJGO 2026: 28/10 (Dia do Servidor Público, feriado estadual, sem transferência) não conta", TJGO,
    entrada("2026-10-26", "publicacao", 3, "TJGO"))
add("tjpr-19-dezembro-nao-feriado", "verificado", "TJPR: 19 de dezembro não é feriado civil (Lei estadual PR 18.384/2014, art. 1º); sem decreto lido, conta como dia útil", "Lei PR 18.384/2014, art. 1º; Decreto Judiciário TJPR 759/2018",
    entrada("2025-12-18", "publicacao", 1, "TJPR"))
add("tjdf-dia-evangelico-util", "verificado", "TJDF: 30 de novembro (Dia do Evangélico, lei distrital) conta como dia útil: o TJDFT é órgão federal", "Lei 9.093/1995, art. 1º; aviso do TJDFT de 26/11/2020",
    entrada("2026-11-27", "publicacao", 2, "TJDF"))

def validacoes_existentes(destino):
    """Lê as validações já registradas em cenarios.json para que regenerar o gabarito nunca as apague."""
    if not destino.exists():
        return {}
    try:
        return {c["id"]: c["validacao"] for c in json.loads(destino.read_text(encoding="utf-8"))}
    except Exception:
        return {}


def gerar(preservar=None):
    preservar = preservar or {}
    saida = []
    for cid, cat, desc, fund, ent in C:
        modo = ent.get("modo", "conservador")
        principal = calcular(ent, completo=(modo == "completo"))
        item = {
            "id": cid,
            "categoria": cat,
            "descricao": desc,
            "fundamento": fund,
            "entrada": ent,
            "esperado": principal,
            "validacao": preservar.get(cid, {"status": "pendente", "por": None, "em": None}),
        }
        if modo == "conservador":
            completo = calcular(ent, completo=True)
            item["alternativaEsperada"] = (
                completo["dataVencimentoFinal"]
                if completo["dataVencimentoFinal"] != principal["dataVencimentoFinal"]
                else None
            )
        saida.append(item)
    return saida


DIAS_SEMANA = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"]
ROTULO_TIPO = {"disponibilizacao_dje": "disponibilização no DJe", "publicacao": "publicação", "intimacao_portal": "consulta à intimação eletrônica",
               "carga_ou_audiencia": "ciência pessoal (carga ou audiência)", "manual": "início manual"}
ROTULO_REGIME = {"cpc_dias_uteis": "CPC, dias úteis", "clt_dias_uteis": "CLT, dias úteis", "cpp_dias_corridos": "CPP, dias corridos", "jef_dias_uteis": "JEF, dias úteis"}
ROTULO_CAT = {"basico": "Contagem básica", "dje": "Disponibilização no DJe", "feriado": "Feriados nacionais", "recesso": "Recesso e suspensão de prazos",
              "dobro": "Prazo em dobro", "bissexto": "Ano bissexto", "clt": "CLT", "cpp": "CPP (prazos criminais)", "jef": "Juizados Especiais",
              "portal": "Intimação eletrônica", "tribunal": "Tribunais superiores", "verificado": "Calendário verificado (tribunais com ato lido)",
              "pendente": "Dias ainda pendentes de conferência"}


def br(iso):
    d = date.fromisoformat(iso)
    return f"{d.strftime('%d/%m/%Y')} ({DIAS_SEMANA[d.weekday()]})"


NOTA_CAT = {
    "verificado": "O calendário do tribunal foi lido no ato oficial. O que se valida é a **regra de contagem** e se o dia citado realmente não conta.",
    "pendente": "Cada caso mostra a data com o dia ainda **não conferido** no ato do tribunal. Valide a contagem **supondo que o dia conta como sem expediente**; se ele é mesmo dia sem expediente naquele tribunal é o que falta conferir, não é dúvida de contagem. A coluna *Alternativa* mostra a outra data possível.",
    "portal": "Intimação eletrônica (CPC, art. 231, V; Lei 11.419, art. 5º). Consulta em dia não útil: a intimação se realiza no primeiro dia útil seguinte (Lei 11.419, art. 5º, § 2º), que é o dia do começo, e a contagem começa no dia seguinte (leitura A, validada pelo revisor em 07/10/2026).",
    "cpp": "Prazos criminais: dias corridos (CPP, art. 798) e suspensão de 20/12 a 20/01 (art. 798-A), salvo réu preso, Maria da Penha ou medida urgente.",
    "recesso": "Suspensão de 20/12 a 20/01 (CPC, art. 220): nenhum dia conta, nem fim de semana.",
}


def gerar_pendentes(cenarios):
    """Lista compacta, numerada de 1 a N, só dos cenários ainda não validados."""
    pend = [c for c in cenarios if c["validacao"]["status"] != "validado"]
    L = []
    L.append("# RATIONE — CENÁRIOS PENDENTES DE VALIDAÇÃO")
    L.append("")
    L.append("> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite à mão.** Lista os cenários ainda não validados, " + ("numerados de 1 a " + str(len(pend)) if pend else "nenhum no momento") + ". Detalhe de cada um (fundamento e contagem completa): `REVISAO_CENARIOS.md`, pelo identificador.")
    L.append(f"> Total: **{len(cenarios)}** cenários · validados: **{len(cenarios) - len(pend)}** · pendentes: **{len(pend)}**")
    L.append("")
    if not pend:
        L.append("**Não há cenário pendente: os " + str(len(cenarios)) + " cenários foram validados pelo revisor jurídico.** O registro de cada validação (quem e quando) está em `cenarios.json` e em `REVISAO_CENARIOS.md`.")
        L.append("")
        L.append("Quando uma regra ou um calendário mudar, o oráculo gera novos cenários e esta lista volta a aparecer, com os pendentes numerados.")
        return chr(10).join(L) + chr(10)
    L.append("## Como responder")
    L.append("")
    L.append("Basta dizer, por número, o que está certo e o que está errado. Exemplos: *\"1 a 20 certos\"*; *\"7 errado: o certo é 14/03, porque …\"*. "
             "Eu registro as respostas no gabarito e corrijo o motor onde você discordar. **Dica:** responda por grupo; a mesma regra se repete dentro do grupo.")
    L.append("")
    L.append("Convenções: o **dia do começo não conta** e o do vencimento conta (CPC, art. 224); em dias úteis, sábados, domingos, feriados e dias sem expediente não contam (arts. 216 e 219). "
             "Pela intimação no Diário, a publicação é o primeiro dia útil depois da disponibilização, e a contagem começa no dia útil seguinte (art. 224, §§ 2º e 3º).")
    L.append("")
    por_cat = {}
    for c in pend:
        por_cat.setdefault(c["categoria"], []).append(c)
    L.append("## Resumo")
    L.append("")
    L.append("| Grupo | Números | Cenários |")
    L.append("|---|---|---|")
    n = 0
    faixas = {}
    for cat, itens in por_cat.items():
        faixas[cat] = (n + 1, n + len(itens))
        n += len(itens)
        L.append(f"| {ROTULO_CAT.get(cat, cat)} | {faixas[cat][0]} a {faixas[cat][1]} | {len(itens)} |")
    L.append("")
    n = 0
    for cat, itens in por_cat.items():
        L.append(f"## {ROTULO_CAT.get(cat, cat)} ({faixas[cat][0]} a {faixas[cat][1]})")
        L.append("")
        if cat in NOTA_CAT:
            L.append(f"*{NOTA_CAT[cat]}*")
            L.append("")
        L.append("| Nº | Caso | Dados | Sistema diz | Dias que não contaram |")
        L.append("|---|---|---|---|---|")
        for c in itens:
            n += 1
            e, x = c["entrada"], c["esperado"]
            opcoes = []
            if e.get("prazoEmDobro"): opcoes.append("em dobro")
            if e.get("litisconsortesComAdvogadosDistintos"): opcoes.append("litisconsortes (só aviso)")
            if e.get("excecaoSuspensaoCriminal"): opcoes.append("réu preso/exceção do art. 798-A")
            if e.get("suspensaoRecesso") is not None: opcoes.append("suspensão " + ("ligada" if e["suspensaoRecesso"] else "desligada"))
            modo = e.get("modo", "conservador")
            dados = f"{ROTULO_TIPO[e['tipoEvento']]} em {br(e['dataEvento'])}; {e['diasPrazo']} dias ({ROTULO_REGIME[e.get('regime', 'cpc_dias_uteis')]}); {e.get('tribunalId', 'sem tribunal')}; modo {modo}" + ("; " + ", ".join(opcoes) if opcoes else "")
            diz = f"**{br(x['dataVencimentoFinal'])}**" + (" (prorrogado)" if x["foiProrrogadoTermoFinal"] else "")
            alt = c.get("alternativaEsperada")
            if alt:
                diz += f"<br>Alternativa: {br(alt)}"
            r = x["rastro"]
            partes = []
            if r["fimsDeSemana"]: partes.append(f"{r['fimsDeSemana']} sáb./dom.")
            if r["suspensaoDias"]: partes.append(f"suspensão {date.fromisoformat(r['suspensaoDe']).strftime('%d/%m')} a {date.fromisoformat(r['suspensaoAte']).strftime('%d/%m/%Y')}")
            for d in r["diasNaoUteis"]:
                partes.append(f"{date.fromisoformat(d['data']).strftime('%d/%m')} {d['motivo']}")
            caso = f"`{c['id']}`<br>{c['descricao']}".replace("|", "/")
            L.append(f"| {n} | {caso} | {dados} | {diz} | {'; '.join(partes).replace('|', '/') if partes else 'só o dia do começo'} |")
        L.append("")
    return "\n".join(L) + "\n"


def gerar_revisao(cenarios):
    por_cat = {}
    for c in cenarios:
        por_cat.setdefault(c["categoria"], []).append(c)
    validados = sum(1 for c in cenarios if c["validacao"]["status"] == "validado")
    L = []
    L.append("# RATIONE — REVISÃO DOS CENÁRIOS DO PRAZOZERO")
    L.append("")
    L.append("> **Gerado por `packages/prazozero/cenarios/oraculo.py`. Não edite este arquivo à mão:** a validação é registrada em `cenarios.json` (campo `validacao`) e este documento é regenerado.")
    L.append(f"> Cenários: **{len(cenarios)}** · validados: **{validados}** · pendentes: **{len(cenarios) - validados}**")
    L.append("")
    L.append("## Como revisar")
    L.append("")
    L.append("Para cada cenário: refaça a contagem com a lei na mão e confira (1) o **fundamento**, (2) a **data de publicação e o início da contagem** e (3) o **vencimento**. "
             "O item *Como foi contado* lista os dias que o cálculo excluiu e por quê; fins de semana e a suspensão de 20/12 a 20/01 vêm agregados.")
    L.append("")
    L.append("**Para registrar a validação**, no `cenarios.json` troque, no cenário conferido, `\"validacao\": {\"status\": \"pendente\", \"por\": null, \"em\": null}` por "
             "`{\"status\": \"validado\", \"por\": \"seu nome\", \"em\": \"AAAA-MM-DD\"}`. Se discordar, anote o motivo no próprio cenário e me avise; o resultado esperado é do oráculo, não é verdade jurídica até você conferir.")
    L.append("")
    L.append("**Convenções.** *Modo conservador*: só dias com base verificada (data mais cedo). *Modo completo*: inclui os dias ainda pendentes. "
             "*Alternativa*: data que valeria se os dias pendentes fossem confirmados. *Dia do começo*: o dia excluído da contagem (CPC, art. 224, caput).")
    L.append("")
    L.append("## O que esta suíte não cobre")
    L.append("")
    L.append("- **Indisponibilidade do sistema** (CPC, art. 224, § 1º, parte final): o motor não modela; é preciso o ato do tribunal.")
    L.append("- **Feriados estaduais e municipais**: TJSP, TJMG e TJRJ (2026) têm ato lido e PE, RS e GO têm feriado estadual lido em lei; a tabela estadual dos demais segue pendente e feriado municipal nunca é calculado (CPC, art. 1.003, § 6º).")
    L.append("- **Calendário fora de 2026** (os tribunais só divulgam o ano seguinte no fim do ano) e **TJRS, TJPR, TJSC, TJBA, TJDF, TJGO, TJPE, TJCE, TJES e TRFs** além da Lei 5.010 e dos feriados nacionais; **TJRJ** só até 12/10/2026 e sem selo (informativo oficial; os atos não foram lidos); **TJAL** com selo, mas o recesso de 23/06 a 01/07 (art. 37 da Lei 6.564/2005) e o 28/08 (só em alguns municípios) ficam pendentes.")
    L.append("- **Prazos criminais nas férias de STF e STJ**: coberto apenas pelo que os comunicados oficiais dizem (seguem o CPP, art. 798); a Portaria GDG 218/2024 do STF não foi lida, só o comunicado.")
    L.append("")
    L.append("## Resumo")
    L.append("")
    L.append("| Grupo | Cenários |")
    L.append("|---|---|")
    for cat, itens in por_cat.items():
        L.append(f"| {ROTULO_CAT.get(cat, cat)} | {len(itens)} |")
    L.append("")
    n = 0
    for cat, itens in por_cat.items():
        L.append(f"## {ROTULO_CAT.get(cat, cat)}")
        L.append("")
        for c in itens:
            n += 1
            e, x = c["entrada"], c["esperado"]
            opcoes = []
            if e.get("prazoEmDobro"): opcoes.append("prazo em dobro")
            if e.get("litisconsortesComAdvogadosDistintos"): opcoes.append("litisconsortes com advogados distintos (aviso)")
            if e.get("excecaoSuspensaoCriminal"): opcoes.append("exceção do CPP, art. 798-A (réu preso/Maria da Penha/urgência)")
            if e.get("suspensaoRecesso") is not None: opcoes.append("suspensão " + ("ligada" if e["suspensaoRecesso"] else "desligada") + " pelo usuário")
            modo = e.get("modo", "conservador")
            L.append(f"### {n}. `{c['id']}`")
            L.append("")
            L.append(f"**{c['descricao']}**")
            L.append("")
            L.append(f"- **Entrada:** {ROTULO_TIPO[e['tipoEvento']]} em **{br(e['dataEvento'])}** · prazo de **{e['diasPrazo']} dias** ({ROTULO_REGIME[e.get('regime', 'cpc_dias_uteis')]}) · tribunal **{e.get('tribunalId', '')}** · modo {modo}" + (" · " + "; ".join(opcoes) if opcoes else ""))
            L.append(f"- **Publicação / dia do começo:** {br(x['dataPublicacao'])} · **início da contagem:** {br(x['dataTermoInicial'])}")
            L.append(f"- **Vencimento esperado:** **{br(x['dataVencimentoFinal'])}**" + (" · prorrogado" if x["foiProrrogadoTermoFinal"] else ""))
            alt = c.get("alternativaEsperada")
            if alt:
                L.append(f"- **Alternativa (se os dias pendentes forem confirmados):** {br(alt)}")
            r = x["rastro"]
            partes = []
            if r["fimsDeSemana"]: partes.append(f"{r['fimsDeSemana']} sábados/domingos")
            if r["suspensaoDias"]: partes.append(f"suspensão de {r['suspensaoDias']} dias ({date.fromisoformat(r['suspensaoDe']).strftime('%d/%m/%Y')} a {date.fromisoformat(r['suspensaoAte']).strftime('%d/%m/%Y')})")
            for d in r["diasNaoUteis"]:
                partes.append(f"{date.fromisoformat(d['data']).strftime('%d/%m/%Y')} {d['motivo']}")
            L.append("- **Como foi contado (dias excluídos):** " + ("; ".join(partes) if partes else "nenhum além do dia do começo"))
            L.append(f"- **Fundamento:** {c['fundamento']}")
            L.append(f"- **Calendário do tribunal verificado:** {'sim' if x['calendarioVerificado'] else 'não'}")
            v = c["validacao"]
            if v["status"] == "validado":
                L.append(f"- **Validação jurídica:** ☑ validado por {v['por']} em {v['em']}")
            else:
                L.append("- **Validação jurídica:** ☐ confere  ☐ diverge · Observações: ______________________ · Revisor: __________ · Data: ___/___/____")
            L.append("")
    return "\n".join(L) + "\n"


def gerar_aleatorios(n=600, semente=20261007):
    """Entradas pseudoaleatórias (semente fixa) com o resultado do oráculo: o teste compara motor e oráculo em todas."""
    import random
    r = random.Random(semente)
    tribunais = ["STF", "STJ", "TST", "TRF1", "TRF3", "TJSP", "TJMG", "TJRJ", "TJAL", "TJPR", "TJDF", "TJPE", "TJRS", "TJGO", "TJES", "TJCE", None]
    regimes = ["cpc_dias_uteis", "clt_dias_uteis", "jef_dias_uteis", "cpp_dias_corridos"]
    tipos = ["disponibilizacao_dje", "publicacao", "intimacao_portal", "carga_ou_audiencia"]
    saida = []
    for i in range(n):
        ano = 2024 + r.randrange(5)
        e = {
            "dataEvento": (date(ano, 1, 1) + timedelta(r.randrange(365))).isoformat(),
            "tipoEvento": r.choice(tipos),
            "diasPrazo": r.choice([1, 2, 5, 8, 10, 15, 30]),
            "regime": r.choice(regimes),
            "prazoEmDobro": r.random() < 0.2,
            "excecaoSuspensaoCriminal": r.random() < 0.3,
        }
        trib = r.choice(tribunais)
        if trib:
            e["tribunalId"] = trib
        principal = calcular(e, completo=False)
        completo = calcular(e, completo=True)
        saida.append({
            "id": f"aleatorio-{i + 1:04d}",
            "entrada": e,
            "esperado": {k: principal[k] for k in ("dataPublicacao", "dataTermoInicial", "dataVencimentoFinal", "foiProrrogadoTermoFinal", "calendarioVerificado")},
            "alternativaEsperada": completo["dataVencimentoFinal"] if completo["dataVencimentoFinal"] != principal["dataVencimentoFinal"] else None,
        })
    return saida


if __name__ == "__main__":
    # Checagem da Páscoa contra datas conhecidas antes de gerar qualquer gabarito
    conhecidas = {2023: (4, 9), 2024: (3, 31), 2025: (4, 20), 2026: (4, 5), 2027: (3, 28), 2028: (4, 16), 2029: (4, 1), 2030: (4, 21)}
    for ano, (m, d) in conhecidas.items():
        assert pascoa(ano) == date(ano, m, d), f"Páscoa {ano} divergente"
    destino = Path(__file__).with_name("cenarios.json")
    cenarios = gerar(validacoes_existentes(destino))
    destino.write_text(json.dumps(cenarios, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    doc = Path(__file__).resolve().parents[3] / "docs" / "produto" / "REVISAO_CENARIOS.md"
    doc.write_text(gerar_revisao(cenarios), encoding="utf-8", newline="\n")
    aleatorios = Path(__file__).with_name("cenarios_aleatorios.json")
    aleatorios.write_text(json.dumps(gerar_aleatorios(), ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    pend = doc.with_name("VALIDACAO_PENDENTES.md")
    pend.write_text(gerar_pendentes(cenarios), encoding="utf-8", newline="\n")
    print(f"{len(cenarios)} cenários gravados em {destino.name} e {doc.name}; {aleatorios.name} atualizado")
