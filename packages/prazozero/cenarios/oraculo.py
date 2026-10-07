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
    """Retorna (nao_util, parcial) do ano. `completo` inclui os dias ainda pendentes de conferência."""
    nao_util, parcial = set(), set()

    def nu(d, verificado):
        if verificado or completo:
            nao_util.add(d)

    for mes, dia in FIXOS_VERIFICADOS:
        nao_util.add(date(ano, mes, dia))
    nu(date(ano, 11, 20), ano >= 2024)

    p = pascoa(ano)
    aplica = trib in LEI_5010
    nu(p - timedelta(2), aplica)            # Sexta-feira Santa
    nu(p - timedelta(48), aplica)           # Carnaval, segunda
    nu(p - timedelta(47), aplica)           # Carnaval, terça
    nu(p + timedelta(60), False)            # Corpus Christi
    if completo:
        parcial.add(p - timedelta(46))      # Quarta-feira de Cinzas
    if aplica or trib in SUPERIORES_SEM_ATO:
        nu(p - timedelta(4), aplica)
        nu(p - timedelta(3), aplica)
        nu(date(ano, 8, 11), aplica)
        nu(date(ano, 11, 1), aplica)
        nu(date(ano, 12, 8), aplica)
        for dia in range(20, 32):
            nu(date(ano, 12, dia), aplica)  # recesso, art. 62, I
        for dia in range(2, 7):
            nu(date(ano, 1, dia), aplica)
    if ano == 2026 and trib in ("STF", "STJ"):
        for mes, dia, eh_parcial in PF_2026:
            d = date(ano, mes, dia)
            if eh_parcial:
                parcial.add(d)
            else:
                nao_util.add(d)
    if uf == "SP" and completo:
        nao_util.add(date(ano, 7, 9))
    return nao_util, parcial


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
        if self.trib in ("STF", "STJ"):
            return (d.month == 12 and d.day >= 20) or d.month == 1 or (d.month == 7 and d.day >= 2)
        return (d.month == 12 and d.day >= 20) or (d.month == 1 and d.day <= 20)

    def fim_de_semana(self, d):
        return d.weekday() >= 5

    def util(self, d):
        """Dia útil para termo inicial/final (expediente parcial NÃO é útil)."""
        if self.fim_de_semana(d):
            return False
        if self.recesso and self.regime in ("cpc_dias_uteis", "clt_dias_uteis") and self.em_suspensao(d):
            return False
        nu, pa = self.cal(d.year)
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
    recesso = e.get("suspensaoRecesso", regime in ("cpc_dias_uteis", "clt_dias_uteis"))
    efetivo = e["diasPrazo"] * (2 if e.get("prazoEmDobro") else 1)
    ctx = Ctx(trib, uf, regime, recesso, completo)

    evento = date.fromisoformat(e["dataEvento"])
    # DJe (CPC 224 §2º) e intimação eletrônica (CPC 231, V): o dia do começo é o dia útil seguinte
    pub = ctx.proximo_util(evento) if e["tipoEvento"] in ("disponibilizacao_dje", "intimacao_portal") else evento
    termo_inicial = ctx.proximo_util(pub)
    prorrogado = False

    if regime == "cpp_dias_corridos":
        fim = pub + timedelta(efetivo)
        if not ctx.util(fim):
            prorrogado = True
            fim = ctx.proximo_util(fim)
    else:
        contados, d = 0, pub
        while True:
            d += timedelta(1)
            if ctx.fim_de_semana(d):
                continue
            if recesso and ctx.em_suspensao(d):
                continue
            nu, pa = ctx.cal(d.year)
            if d in nu:
                continue
            if d in pa and (contados == 0 or contados + 1 == efetivo):
                if contados != 0 and contados + 1 == efetivo:
                    prorrogado = True
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
add("cpp-trf3-recesso", "cpp", "CPP no TRF3: vencimento em 20/12 cai em feriado forense (Lei 5.010, art. 62, I) e vai a 07/01", "CPP, art. 798, § 3º; Lei 5.010/1966, art. 62, I",
    entrada("2026-12-15", "publicacao", 5, "TRF3", regime="cpp_dias_corridos"))
add("cpp-tjsp-fim-ano", "cpp", "CPP no TJSP: sem recesso federal, vencimento de domingo vai à segunda 21/12", "CPP, art. 798, § 3º",
    entrada("2026-12-15", "publicacao", 5, "TJSP", regime="cpp_dias_corridos"))
add("portal-segunda", "portal", "Intimação eletrônica: consulta na segunda; dia do começo na terça; contagem a partir de quarta", "CPC, arts. 224, caput, e 231, V; Lei 11.419/2006, art. 5º",
    entrada("2026-03-09", "intimacao_portal", 5))
add("portal-sexta", "portal", "Intimação eletrônica: consulta na sexta; dia do começo na segunda", "CPC, arts. 224, caput, e 231, V; Lei 11.419/2006, art. 5º",
    entrada("2026-03-13", "intimacao_portal", 5))
add("portal-sabado", "portal", "Intimação eletrônica: consulta no sábado (leitura literal do art. 231, V; ver nota de revisão)", "CPC, art. 231, V; Lei 11.419/2006, art. 5º, § 2º",
    entrada("2026-03-14", "intimacao_portal", 5))
add("portal-feriado", "portal", "Intimação eletrônica: consulta na véspera de Tiradentes; dia do começo é o dia útil seguinte", "CPC, art. 231, V; Lei 662/1949, art. 1º",
    entrada("2026-04-20", "intimacao_portal", 5))


def gerar():
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
            "validacao": {"status": "pendente", "por": None, "em": None},
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


if __name__ == "__main__":
    # Checagem da Páscoa contra datas conhecidas antes de gerar qualquer gabarito
    conhecidas = {2023: (4, 9), 2024: (3, 31), 2025: (4, 20), 2026: (4, 5), 2027: (3, 28), 2028: (4, 16), 2029: (4, 1), 2030: (4, 21)}
    for ano, (m, d) in conhecidas.items():
        assert pascoa(ano) == date(ano, m, d), f"Páscoa {ano} divergente"
    cenarios = gerar()
    destino = Path(__file__).with_name("cenarios.json")
    destino.write_text(json.dumps(cenarios, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(cenarios)} cenários gravados em {destino.name}")
