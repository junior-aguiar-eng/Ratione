# POLÍTICA DE PRIVACIDADE — RATIONE

**Versão:** [VERSAO] · **Vigência:** [DATA_VIGENCIA]

> RASCUNHO PARA REVISÃO DO ADVOGADO RESPONSÁVEL. Fundamento: Lei 13.709/2018 (LGPD).
> **Atualizado em 25/10/2026 conforme o código e os documentos do produto** (`docs/produto/PLANOS_E_COBRANCA.md`, `docs/produto/ARGUMENTA.md`, `docs/produto/IA_TAREFAS.md`). Itens marcados **[CONFIRMAR]** dependem de decisão ou de conferência do responsável; **[FUTURO]** descreve o que ainda não está no ar (cobrança, envio de arquivos).

---

## 1. Quem somos
**Controlador (dados de conta e cobrança):** [NOME_RESPONSAVEL], [CPF_OU_CNPJ], [ENDERECO].
**Canal do titular / Encarregado:** [EMAIL_PRIVACIDADE].

## 2. Nossos papéis
| Situação | Nosso papel | Observação |
|---|---|---|
| Dados da sua conta, uso da Plataforma e cobrança | **Controlador** | Definimos finalidades e meios |
| **Documentos e dados que você envia** para análise (ex.: decisões e peças, com dados de partes) | **Operador** | **Você é o controlador** desses dados; tratamos somente para prestar o serviço, conforme suas instruções. Hoje o texto enviado à IA é tratado só de forma **transitória**, sem armazenamento **[CONFIRMAR o enquadramento]** |

## 3. Dados que tratamos
| Categoria | Exemplos | Origem |
|---|---|---|
| Cadastro | Nome, e-mail, senha (armazenada em *hash*), profissão, OAB (opcional), preferências | Você |
| Uso | Cálculos, normas e teses salvas, histórico, configurações | Você / Plataforma |
| Uso de IA | Plano da conta e, por análise ou explicação: ferramenta, data e hora, resultado, tokens, custo, hash do texto enviado, quantidade de parágrafos e nome opcional da análise. **Sem o texto nem o resultado** | Plataforma |
| Conteúdo enviado | Texto de decisão colado para análise por IA, que **pode conter dados pessoais de terceiros**; hoje é pseudonimizado no navegador e **não é guardado**. Arquivos enviados **[FUTURO]** | Você |
| Pagamento | Plano, status, histórico de cobranças, últimos dígitos e bandeira do cartão (tokens do operador) | Operador de pagamento |
| Técnicos | IP, dispositivo, navegador, registros de acesso, erros | Automático |
| Comunicação | Mensagens de suporte e relatos de erro | Você |

**Não coletamos** intencionalmente dados pessoais sensíveis para fins próprios. Documentos enviados por você **podem** conter tais dados; ver itens 2 e 7.

## 4. Finalidades e bases legais (LGPD, art. 7º)
| Finalidade | Base legal |
|---|---|
| Criar e manter a conta; prestar as ferramentas | Execução de contrato (inc. V) |
| Cobrança, emissão de documento fiscal, prevenção de fraude | Execução de contrato; obrigação legal (inc. II); legítimo interesse (inc. IX) |
| Segurança, auditoria e prevenção a abuso | Legítimo interesse (inc. IX) |
| Cota do plano, controle de custo e histórico de uso de IA | Execução de contrato (inc. V) |
| Administração do serviço: totais de uso e custo, lista de contas com e-mail parcialmente oculto, suspensão e reativação (com registro) | Legítimo interesse (inc. IX) **[CONFIRMAR]** |
| Alertas de prazo e comunicações do serviço | Execução de contrato |
| Comunicações de novidades e marketing | **Consentimento** (inc. I), revogável |
| Análises estatísticas e melhoria do produto (agregadas) | Legítimo interesse (inc. IX), com **minimização**; analytics não essencial só com consentimento |
| Cumprimento de ordem legal ou judicial | Obrigação legal (inc. II) |
| Defesa em processos | Exercício regular de direitos (inc. VI) |

## 5. Compartilhamento (operadores e fornecedores)
Compartilhamos dados **somente na medida necessária** com:
- **Banco de dados e login:** Supabase (São Paulo).
- **Hospedagem:** Google Cloud, Cloud Run (São Paulo); registros técnicos por 30 dias, em localização global.
- **E-mail transacional:** Resend. **Encaminhamento do e-mail de contato:** ImprovMX.
- **Provedor de IA** (somente quando você usa recursos de IA): **Anthropic**, conforme a **Política de Uso de IA**. Google e OpenAI **não** são usados.
- **Pagamentos [FUTURO]:** Mercado Pago, quando a cobrança for ligada.
- **Autoridades**, quando exigido por lei.

Não há ferramenta de monitoramento de erros de terceiros nem de estatística de uso. **Não vendemos dados pessoais.**

## 6. Transferência internacional (LGPD, art. 33)
Alguns fornecedores armazenam ou processam dados **fora do Brasil**. Adotamos os mecanismos previstos em lei, como **cláusulas contratuais padrão** e contratos com garantias adequadas, conforme a regulamentação da **ANPD**. [DETALHAR por provedor]

## 7. Documentos enviados e recursos de IA
- Antes do envio ao provedor de IA, a **pseudonimização é feita no seu navegador**: identificadores formatados (CPF, CNPJ, RG, OAB, e-mail, telefone, CEP, endereço, número de processo) e nomes de partes e advogados indicados por rótulos viram marcadores; o servidor **recusa** o envio se ainda detectar dado pessoal. Ela **reduz, mas não elimina** riscos: **não pega todo nome** no meio do texto.
- O texto enviado e o resultado **não ficam guardados**. Guardamos só o registro de uso (item 3).
- Sobre treino e retenção pelo provedor, ver o item 4 da **Política de Uso de IA**. **[CONFIRMAR no console e nos termos da conta]**
- **Você** deve ter base legal para enviar dados de terceiros e **não deve enviar** documentos em segredo de justiça ou sob sigilo sem autorização.
- Não registramos o **conteúdo integral** dos documentos em logs.

## 8. Retenção
| Dado | Prazo |
|---|---|
| Conta e itens salvos | Enquanto a conta estiver ativa; exclusão em até [30] dias após o pedido |
| **Registro de uso de IA e histórico de análises** | Enquanto a conta existir; removidos com a exclusão da conta. Hoje não há prazo menor |
| Registro das ações administrativas (suspensão e reativação) | Mantido sem a identificação da conta quando ela é excluída **[CONFIRMAR]** |
| **Documentos enviados e textos extraídos** | Até [X] dias (padrão curto) ou até você excluir |
| Cobrança e documentos fiscais | **Prazos legais fiscais e tributários** |
| Registros de acesso | **Prazo legal aplicável** (Marco Civil da Internet) |
| Backups | Até [X] dias após a exclusão |

## 9. Seus direitos (LGPD, art. 18)
Você pode, a qualquer tempo e mediante requisição a [EMAIL_PRIVACIDADE]: confirmar a existência de tratamento; **acessar**; **corrigir**; **anonimizar, bloquear ou eliminar**; pedir **portabilidade**; obter informação sobre **compartilhamento**; saber das consequências de **não consentir**; **revogar o consentimento**; **opor-se** a tratamento em desconformidade; e **peticionar à ANPD**.
Na Plataforma você pode **exportar seus dados** (hoje: perfil, registros salvos, avisos e aceites dos Termos) e **excluir a conta**. **[LACUNA]** O histórico de análises e o registro de uso de IA ainda **não** entram na exportação; consulte-os em "Meu uso". Respondemos em até [15] dias. Quando atuamos como **operador**, encaminhamos o pedido ao **controlador** (você ou o titular, conforme o caso).

## 10. Segurança
Adotamos medidas técnicas e organizacionais, incluindo: **criptografia em trânsito e em repouso**, controle de acesso por usuário (isolamento de dados), senhas com *hash*, **segredos fora do código**, monitoramento, **backups** e revisão de dependências. Nenhum sistema é totalmente imune; em caso de **incidente relevante**, comunicaremos a **ANPD** e os titulares nos termos da LGPD (art. 48).

## 11. Crianças e adolescentes
A Plataforma é destinada a **maiores de 18 anos**. Não coletamos intencionalmente dados de menores.

## 12. Decisões automatizadas
Não tomamos decisões **exclusivamente automatizadas** que afetem seus direitos (LGPD, art. 20). Resultados de IA são **sugestões** sujeitas à sua revisão.

## 13. Cookies
Ver **Política de Cookies**.

## 14. Alterações
Alterações relevantes serão comunicadas com antecedência razoável por e-mail e na Plataforma.

## 15. Contato
[EMAIL_PRIVACIDADE] · [ENDERECO]
