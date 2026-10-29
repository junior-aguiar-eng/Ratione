#!/usr/bin/env python3
"""
Gera `src/calendario/trts-dados.ts` a partir de `trts-2026.json`, a fonte única dos calendários dos Tribunais Regionais do Trabalho.

Uso:  python gerar_trts.py   (o oraculo.py também a chama ao regravar o gabarito)

O JSON é lido por este gerador (para o motor) e pelo oráculo (para o gabarito): os dois partem do mesmo dado e discordam só se a REGRA
for diferente. Quem confere se o DADO está certo é o revisor, pelos cenários. Cada item de `dias` é
[intervalo "AAAA-MM-DD" ou "AAAA-MM-DD/AAAA-MM-DD", nome, opções], com as opções `pf` (ponto facultativo que só alerta), `parcial`
(expediente parcial), `fonte` e `fund` (para um dia que vem de outro ato).
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
JSON = Path(__file__).with_name("trts-2026.json")
SAIDA = RAIZ / "src" / "calendario" / "trts-dados.ts"
ANO = 2026


def carregar():
    return json.loads(JSON.read_text(encoding="utf-8"))


def intervalo(spec: str):
    ini, _, fim = spec.partition("/")
    return ini, fim or ini


def gerar() -> str:
    fontes, eventos, pf, cobertura = {}, [], {}, {}
    for t in carregar():
        trib, base = t["id"], t["fontes"][0]["chave"]
        for f in t["fontes"]:
            fontes[f["chave"]] = {k: f[k] for k in ("ato", "url", "lido", "lidoEm")}
        for item in t["dias"]:
            spec, nome, *resto = item
            opcoes = resto[0] if resto else {}
            ini, fim = intervalo(spec)
            eventos.append(
                {
                    "tribunais": [trib],
                    "inicio": ini,
                    "fim": fim,
                    "nome": nome,
                    "efeito": "expediente_parcial" if opcoes.get("parcial") else "nao_util",
                    "verificacao": "ato_do_tribunal",
                    "fundamento": opcoes.get("fund", t["fund"]),
                    "fonte": opcoes.get("fonte", base),
                }
            )
            if opcoes.get("pf"):
                pf.setdefault(trib, []).append(ini)
        # `semSelo`: só parte do calendário foi lida; os dias lidos valem, mas o tribunal não ganha o selo de calendário conferido
        if not t.get("semSelo"):
            cobertura[trib] = {"anos": [ANO], "fontes": [f["chave"] for f in t["fontes"]]}

    def j(x):
        return json.dumps(x, ensure_ascii=False, indent=2)

    return (
        "// GERADO por `cenarios/gerar_trts.py` a partir de `cenarios/trts-2026.json`. Não edite à mão: altere o JSON e rode o gerador.\n"
        "import type { EfeitoEvento, FonteCalendario, VerificacaoEvento } from './eventos';\n\n"
        "/** Fontes dos calendários dos Tribunais Regionais do Trabalho (um ato por entrada). */\n"
        f"export const FONTES_TRTS = {j(fontes)} satisfies Record<string, FonteCalendario>;\n\n"
        "export interface EventoDeTRT {\n"
        "  tribunais: string[];\n  inicio: string;\n  fim: string;\n  nome: string;\n  efeito: EfeitoEvento;\n  verificacao: VerificacaoEvento;\n"
        "  fundamento: string;\n  fonte: keyof typeof FONTES_TRTS;\n}\n\n"
        f"export const EVENTOS_TRTS: EventoDeTRT[] = {j(eventos)};\n\n"
        "/** Pontos facultativos que só alertam (o ato não diz que não haverá expediente). */\n"
        f"export const PONTOS_FACULTATIVOS_TRTS: Record<string, string[]> = {j(pf)};\n\n"
        "export const COBERTURA_TRTS: Record<string, { anos: number[]; fontes: Array<keyof typeof FONTES_TRTS> }> = "
        f"{j(cobertura)};\n"
    )


if __name__ == "__main__":
    SAIDA.write_text(gerar(), encoding="utf-8", newline="\n")
    print(f"{SAIDA.name} gravado")
