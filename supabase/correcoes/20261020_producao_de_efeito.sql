-- Correção de dados do NormaViva (20/10/2026): a anotação "Produção de efeito(s)" do Planalto ficava colada ao texto.
-- O Planalto a escreve de duas formas: "(Produção de efeito)", entre parênteses, e "Produção de efeitos", como texto de link, sem parênteses.
-- Efeito (81 dispositivos em 8 normas: CF, CLT, Código Civil, Lei 11.101, CTN, ECA, Lei 8.213 e CTB):
--   1. tira a anotação do texto e a guarda em `anotacoes` (tipo `vigencia`);
--   2. marca como revogados 12 dispositivos que apareciam como vigentes só com esse texto (CTN arts. 86 a 89, 93 e 94; ECA art. 260, § 1º;
--      Lei 8.213 art. 17, § 6º; CF art. 166, §§ 14, IV, e 15, e ADCT art. 76, §§ 1º e 3º);
--   3. acompanha o texto e o hash da versão de cada um e o trecho das remissões que citavam a anotação.
-- As regras são as do parser corrigido (packages/normaviva/src/parser/dispositivos.ts): a forma sem parênteses só sai do FIM do texto e só quando o
-- dispositivo tem outra anotação, para nunca cortar texto de lei. O resultado é o de recarregar o corpus com o parser novo, sem apagar nada, exceto a
-- posição de `vigencia` dentro de `anotacoes` (a lista fica com ela no fim). Idempotente: depois de aplicada, nada mais casa.
-- Não cobre o CTN art. 95, que já vem do Planalto com o parágrafo único revogado colado na linha do artigo (defeito antigo do parser, à parte).
-- A última consulta confere o resultado (esperado: 0 dispositivos com a anotação no texto e 12 revogados corrigidos).

begin;

create temp table _producao_de_efeito on commit drop as
select d.id,
       d.texto as antigo,
       (regexp_match(d.texto, 'Produ[çc][ãa]o de efeitos?'))[1] as anotacao,
       -- 1) "(Produção de efeito)" vira espaço, 2) espaços repetidos viram um, 3) tira a forma sem parênteses do fim (só com outra anotação),
       -- 4) tira pontuação e espaço do começo, como o parser faz
       btrim(regexp_replace(
         case when jsonb_array_length(d.anotacoes) > 0
              then regexp_replace(btrim(regexp_replace(regexp_replace(d.texto, '\(\s*Produ[çc][ãa]o de efeitos?\s*\)', ' ', 'g'), '\s+', ' ', 'g')),
                                  '(^|\s)Produ[çc][ãa]o de efeitos?$', '')
              else btrim(regexp_replace(regexp_replace(d.texto, '\(\s*Produ[çc][ãa]o de efeitos?\s*\)', ' ', 'g'), '\s+', ' ', 'g'))
         end,
         '^[-–—:.\s]+', '')) as novo
from public.dispositivos d
where d.texto ~ 'Produ[çc][ãa]o de efeitos?';

update public.dispositivos d
set texto = p.novo,
    revogado = d.revogado or (p.novo = '' and exists (select 1 from jsonb_array_elements(d.anotacoes) a where a ->> 'tipo' = 'revogado')),
    anotacoes = d.anotacoes || jsonb_build_array(jsonb_build_object('tipo', 'vigencia', 'texto', p.anotacao))
from _producao_de_efeito p
where d.id = p.id and p.novo <> p.antigo;

update public.versoes_dispositivo v
set texto = p.novo,
    hash = encode(sha256(convert_to(p.novo, 'UTF8')), 'hex')
from _producao_de_efeito p
where v.dispositivo_id = p.id and v.texto = p.antigo and p.novo <> p.antigo;

-- Remissões: o trecho citado também trazia a anotação (só as remissões dos dispositivos limpos acima)
update public.relacoes r
set trecho = btrim(regexp_replace(
      btrim(regexp_replace(regexp_replace(r.trecho, '\(\s*Produ[çc][ãa]o de efeitos?\s*\)', ' ', 'g'), '\s+', ' ', 'g')),
      '(^|\s)Produ[çc][ãa]o de efeitos?$', ''))
where r.tipo = 'remete'
  and r.trecho ~ 'Produ[çc][ãa]o de efeitos?'
  and r.origem_id in (select id from _producao_de_efeito);

commit;

select
  (select count(*) from public.dispositivos where texto ~ 'Produ[çc][ãa]o de efeitos?') as com_anotacao_no_texto,
  (select count(*) from public.dispositivos d
     where d.revogado and d.texto = ''
       and exists (select 1 from jsonb_array_elements(d.anotacoes) x where x ->> 'texto' ~ '^Produ[çc][ãa]o de efeitos?$')) as revogados_corrigidos;
