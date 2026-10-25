# POLÍTICA DE USO DE INTELIGÊNCIA ARTIFICIAL — RATIONE

**Versão:** [VERSAO] · **Vigência:** [DATA_VIGENCIA]

> RASCUNHO PARA REVISÃO DO ADVOGADO RESPONSÁVEL. Conferir as recomendações vigentes da OAB sobre IA generativa na prática jurídica.
> **Atualizado em 25/10/2026 conforme o código e os documentos do produto** (`docs/produto/PLANOS_E_COBRANCA.md`, `docs/produto/ARGUMENTA.md`, `docs/produto/IA_TAREFAS.md`). Itens marcados **[CONFIRMAR]** dependem de decisão ou de conferência do responsável; **[FUTURO]** descreve o que ainda não está no ar (cobrança, envio de arquivos).

---

## 1. Princípios
1. **O Ratione não é uma plataforma exclusivamente de IA.** Cálculo de prazos, consulta à redação de normas, navegação por precedentes e exportações **não dependem de IA**.
2. A IA é **opcional, identificada e medida**.
3. **A IA não calcula prazos e não decide a vigência de normas.**
4. **O profissional é o responsável final** por qualquer uso do resultado.

## 2. Onde usamos IA
| Recurso | IA? | Natureza |
|---|---|---|
| PrazoZero: cálculo, calendário, memória, `.ics`, PDF | **Não** | Regras e calendário versionados |
| NormaViva: consulta, linha do tempo, diff | **Não** | Dados oficiais com fonte |
| NormaViva: "Explicar dispositivo" | **Sim, ao clicar** | Explicação **identificada** como gerada por IA; só o texto do dispositivo (lei, público) vai ao modelo |
| TeseMap: precedentes e relações | **Não** (exibição) | Relações **validadas por pessoa** |
| Argumenta: análise de decisão colada | **Sim, ao clicar** | Estrutura, questões, conclusões e fundamentos **sugeridos**, com o **parágrafo de origem**. Fragilidades, mapa de argumentos e estratégias **[FUTURO]** |
| Argumenta: selo das citações | **Não** | Conferência por código contra o NormaViva e o TeseMap (item 5) |

O PrazoZero **não** tem recurso de IA: a "leitura de intimação" prevista em versões anteriores desta minuta não existe.

## 3. Provedor e modelos
Hoje o único provedor de IA é a **Anthropic (Claude)**, por API, chamada pelo servidor (a chave nunca vai ao navegador). Cada recurso é uma **tarefa fechada**: instruções, formato de saída e conferência fixos em código; o usuário não conversa com o modelo nem escolhe modelo. O catálogo das tarefas e do modelo de cada uma está em `docs/produto/IA_TAREFAS.md`. Outros provedores (Google, OpenAI) **não** são usados; se forem adotados, esta política e a de Privacidade serão atualizadas **antes**.

## 4. Seus dados e a IA
- **Pseudonimização no navegador, antes do envio.** Na análise de decisões, identificadores formatados (CPF, CNPJ, RG, OAB, e-mail, telefone, CEP, endereço e número de processo) e nomes de partes e advogados **indicados por rótulos** ("Autor:", "em face de") são trocados por marcadores. A tabela de troca fica só na sua tela. O servidor roda a mesma detecção e **recusa** o envio se ainda restar dado pessoal. **Limite:** a detecção é por padrões e **não pega todo nome** no meio do texto; a tela mostra o que será enviado e aceita outros nomes a ocultar.
- **Sem guarda do conteúdo.** O texto enviado e o resultado da análise **não ficam guardados**; a análise some ao sair da página. Guardamos só o **registro de uso**: tarefa, data, resultado, tokens, custo, um código (hash) do texto, a quantidade de parágrafos e o nome opcional que você der à análise. **Sem logs de conteúdo integral.**
- **NormaViva:** só o texto do dispositivo de lei vai ao modelo; nenhum dado do usuário. As explicações são guardadas em cache compartilhado, por dispositivo.
- **Treino e retenção pelo provedor [CONFIRMAR].** O Ratione **não** usa o conteúdo para treinar modelos. Pelo que a Anthropic informa publicamente (conferido em 25/10/2026): (i) o conteúdo enviado por API sob os **Commercial Terms** não é usado para treinar modelos por padrão; (ii) a página "API and data retention" diz que o conteúdo das conversas (prompts e respostas) **não é retido por padrão**, exceto nos modelos que ela chama de **Covered Models**, que exigem retenção de 30 dias (na data da conferência, a lista trazia Claude Fable 5.1, Mythos 5.1, Fable 5 e Mythos 5, e **não** o Haiku 5.5 usado hoje); (iii) outro artigo de privacidade da Anthropic fala em exclusão automática em até 30 dias, com exceções (fiscalização da política de uso e exigências legais). As páginas divergem em data e em detalhe. **Confirmar no console e nos termos da conta do Ratione** qual regime se aplica, e registrar o resultado aqui. Fontes: `platform.claude.com/docs/en/manage-claude/api-and-data-retention`; `privacy.claude.com/en/articles/7996866` (retenção, comercial); `privacy.claude.com/en/articles/7996862` (DPA).
- **DPA e transferência internacional.** A Anthropic informa que o seu **DPA, com Cláusulas Contratuais Padrão**, é incorporado automaticamente aos Commercial Terms (aceitar os termos é aceitar o DPA). Pelo resumo da página da Anthropic, ele cobre as cláusulas da UE e os adendos do Reino Unido e da Suíça; **não li o texto do DPA** e não confirmei se há mecanismo específico para a LGPD ou para a regulamentação da ANPD. O tratamento pode ocorrer fora do Brasil (LGPD, art. 33). **[CONFIRMAR o mecanismo e a região]**
- **Você decide o que enviar.** Não envie documentos em **segredo de justiça**, nem dados de clientes sem **base legal e autorização**.

## 5. Limites e riscos
- A IA **pode errar, omitir ou inventar** informações (inclusive citações). Todo resultado traz o aviso de que foi **gerado por inteligência artificial** e deve ser conferido.
- O resultado traz o **parágrafo de origem** de cada ponto, para conferência no texto da decisão.
- **Selo das citações (Argumenta).** Cada citação de norma ou precedente é conferida **por código** contra as bases do NormaViva e do TeseMap e recebe **Encontrada na base**, **Não localizada na base** ou **Fora da base** (norma ou tribunal que a base não cobre, ou ação de controle concentrado sem mérito julgado). O selo diz só se a citação **existe na base**: não atesta que esteja correta nem que o precedente diga o que a decisão afirma. Doutrina, recursos específicos e citações sem norma identificada ficam **sem selo**. Só a citação, e não o texto da decisão, é consultada, pelo navegador.
- Resultados **não constituem parecer ou aconselhamento jurídico**.

## 6. Uso responsável pelo usuário
- Confira **sempre** a fonte oficial antes de usar em peças, decisões ou pareceres.
- Atenda aos **deveres éticos** da sua profissão (sigilo, competência, boa-fé e dever de informar o cliente, conforme as regras da OAB aplicáveis).
- **Não use** a IA para finalidades ilícitas, fraude ou para gerar conteúdo que viole direitos de terceiros.

## 7. Cota e limites
O uso de IA é medido por **análises e explicações**, conforme a cota do plano (ver Termos, item 9), e não por créditos. **Falha do sistema, recusa do modelo ou saída descartada não consomem a cota** (estorno automático). Há limites técnicos (tamanho da decisão, requisições) e o gasto de IA do plano Gratuito sai de um fundo mensal próprio que, se acabar, pausa só o Gratuito.

## 8. Melhoria contínua e governança
- **Avaliação.** Há ferramentas para medir a extração estrutural (dispositivo, questões e citações) contra um corpus de decisões públicas com gabarito conferido pelo revisor jurídico (`packages/argumenta/corpus/LEIA-ME.md`). O corpus ainda está em formação; até lá, **não há métrica publicada** de acerto. Trocar de modelo ou de instruções deve passar por essa avaliação.
- As instruções de cada tarefa têm **versão**; mudanças são registradas no catálogo.
- Revisamos esta política quando houver mudança relevante de provedor, modelo ou legislação. **[FUTURO]** Botão para relatar erros em cada resultado.

## 9. Contato
[EMAIL_CONTATO] · [EMAIL_PRIVACIDADE]
