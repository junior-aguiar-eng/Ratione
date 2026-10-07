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
UF_DO_TRIBUNAL = {"TJSP": "SP", "TRF3": "SP", "TJRJ": "RJ", "TJMG": "MG"}
FIXOS_VERIFICADOS = [(1, 1), (4, 21), (5, 1), (9, 7), (10, 12), (11, 2), (11, 15), (12, 25)]
# Pontos facultativos de 2026, idênticos nos atos de STF e STJ: (mês, dia, parcial)
PF_2026 = [(2, 18, True), (4, 20, False), (6, 4, False), (6, 5, False), (8, 10, False), (10, 30, False), (12, 7, False)]
ANOS_VERIFICADOS = {"STF": {2026}, "STJ": {2026}}


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


def calendario(ano: int, trib: str, uf: str, completo: bool):
    """Retorna (nao_util, parcial, nomes) do ano. `completo` inclui os dias ainda pendentes de conferência."""
    nao_util, parcial, nomes = set(), set(), {}

    def nu(d, verificado, nome):
        if verificado or completo:
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
    if completo:
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
    if uf == "SP" and completo:
        nao_util.add(date(ano, 7, 9))
        nomes[date(ano, 7, 9)] = "Revolução Constitucionalista (estadual, pendente)"
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
    return {"dataEvento": data, "tipoEvento": tipo, "diasPrazo": dias, "tribunalId": tribunal, **kw}


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
    entrada("2026-03-02", "publicacao", 15, prazoEmDobro=True))
add("dobro-recesso", "dobro", "Prazo em dobro atravessando o recesso", "CPC, arts. 183 e 220",
    entrada("2025-12-10", "publicacao", 10, prazoEmDobro=True))
add("bissexto-2024", "bissexto", "Fevereiro de 2024 (bissexto): 29/02 é dia útil", CPC,
    entrada("2024-02-27", "publicacao", 5))
add("bissexto-2028", "bissexto", "Fevereiro de 2028 (bissexto), Carnaval em 28 e 29/02", CPC,
    entrada("2028-02-25", "publicacao", 5))
add("clt-8d", "clt", "Embargos na CLT: 8 dias úteis", "CLT, art. 775",
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
    entrada("2026-02-13", "publicacao", 5))
add("carnaval-2026-completo", "pendente", "Carnaval 2026 considerado; Quarta de Cinzas protrai o dia do começo", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-13", "publicacao", 5, modo="completo"))
add("cinzas-meio-conservador", "pendente", "Quarta de Cinzas no meio do prazo (conservador)", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-12", "publicacao", 5))
add("cinzas-meio-completo", "pendente", "Quarta de Cinzas no meio do prazo conta normalmente", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-12", "publicacao", 5, modo="completo"))
add("cinzas-vencimento-conservador", "pendente", "Prazo de 4 dias; sem Carnaval vence na segunda 16/02", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-10", "publicacao", 4))
add("cinzas-vencimento-completo", "pendente", "Prazo de 4 dias; vencimento cairia na Quarta de Cinzas e é protraído", PEND + "; CPC, art. 224, § 1º",
    entrada("2026-02-10", "publicacao", 4, modo="completo"))
add("carnaval-2028-completo", "pendente", "Carnaval 2028 em 28 e 29/02 (bissexto), Cinzas em 01/03", PEND + "; CPC, art. 224, § 1º",
    entrada("2028-02-25", "publicacao", 5, modo="completo"))
add("corpus-christi-conservador", "pendente", "Corpus Christi 2026 (04/06) ignorado no modo conservador", PEND,
    entrada("2026-06-02", "publicacao", 5))
add("corpus-christi-completo", "pendente", "Corpus Christi 2026 considerado", PEND,
    entrada("2026-06-02", "publicacao", 5, modo="completo"))
add("sexta-santa-conservador", "pendente", "Sexta-feira Santa 2026 (03/04) ignorada no modo conservador", PEND + "; Lei 9.093/1995, art. 2º",
    entrada("2026-04-01", "publicacao", 3))
add("sexta-santa-completo", "pendente", "Sexta-feira Santa 2026 considerada (TJSP)", PEND + "; Lei 9.093/1995, art. 2º",
    entrada("2026-04-01", "publicacao", 3, modo="completo"))
add("onze-agosto-tjsp-completo", "pendente", "11 de agosto não é feriado forense no TJSP", PEND,
    entrada("2026-08-07", "publicacao", 3, "TJSP", modo="completo"))
add("sp-9-julho-conservador", "pendente", "9 de julho ignorado no modo conservador", PEND + "; lei estadual a conferir",
    entrada("2026-07-08", "publicacao", 5))
add("sp-9-julho-completo", "pendente", "9 de julho considerado em SP", PEND + "; lei estadual a conferir",
    entrada("2026-07-08", "publicacao", 5, modo="completo"))
add("consciencia-negra-2023-completo", "pendente", "20/11/2023 considerado (lei local, pendente)", PEND,
    entrada("2023-11-17", "publicacao", 2, modo="completo"))
add("dobro-sexta-santa-completo", "pendente", "Prazo em dobro com Sexta-feira Santa considerada", PEND,
    entrada("2026-03-02", "publicacao", 15, prazoEmDobro=True, modo="completo"))
add("cpp-sexta-santa-completo", "pendente", "CPP: vencimento na Sexta-feira Santa (completo) é prorrogado", PEND + "; CPP, art. 798, § 3º",
    entrada("2026-03-30", "publicacao", 4, regime="cpp_dias_corridos", modo="completo"))

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
add("cpp-tjsp-reu-preso", "cpp", "CPP, réu preso no TJSP: sem suspensão; vencimento de domingo vai à segunda 21/12", "CPP, arts. 798, § 3º, e 798-A, I",
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
add("portal-sabado", "portal", "Intimação eletrônica: consulta no sábado (leitura literal do art. 231, V; ver nota de revisão)", "CPC, art. 231, V; Lei 11.419/2006, art. 5º, § 2º",
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
add("tjsp-8-dezembro", "feriado", "TJSP: 8 de dezembro não é feriado forense (a Lei 5.010 vale para a Justiça Federal)", "Lei 5.010/1966, art. 62 (Justiça Federal); sem ato do TJSP",
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
              "portal": "Intimação eletrônica", "tribunal": "Tribunais superiores", "verificado": "Calendário verificado (STF, STJ, TRFs)",
              "pendente": "Dias ainda pendentes de conferência"}


def br(iso):
    d = date.fromisoformat(iso)
    return f"{d.strftime('%d/%m/%Y')} ({DIAS_SEMANA[d.weekday()]})"


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
    L.append("- **Feriados estaduais e municipais**: só aparecem como pendentes (SP, 9 de julho) e o município nunca é calculado (CPC, art. 1.003, § 6º).")
    L.append("- **Calendário de STF e STJ fora de 2026**, e de TRFs e TJs além da Lei 5.010 e dos feriados nacionais.")
    L.append("- **Calendário de TRFs e TJs** além da Lei 5.010 e dos feriados nacionais (portarias anuais de cada tribunal).")
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
    print(f"{len(cenarios)} cenários gravados em {destino.name} e {doc.name}")
