# Política de segurança

## Como relatar uma vulnerabilidade

**Não abra uma issue pública** para falha de segurança. Use o relato privado do GitHub:

1. Abra a aba **Security** deste repositório.
2. Clique em **Report a vulnerability** ([relato privado](https://github.com/junior-aguiar-eng/Ratione/security/advisories/new)).
3. Descreva o que encontrou, como reproduzir e o possível impacto. Não inclua dado pessoal de terceiros nem acesse contas que não sejam suas.

O relato fica visível só para o responsável pelo projeto.

## O que esperar

- O Ratione é mantido por uma pessoa, em horário comercial. Procuro confirmar o recebimento em até **7 dias** e dar um retorno sobre a avaliação em até **30 dias**.
- Se o relato for válido, a correção é publicada e o relato pode ser divulgado depois dela, com o crédito a quem encontrou, se a pessoa quiser.
- Não há programa de recompensa.

## O que vale testar

- O site público (`https://ratione.nexojuris.ia.br`) e o código deste repositório.
- Contas **próprias**, criadas por você. Não teste contra dados ou contas de outras pessoas.
- Fora do escopo: ataques de negação de serviço, engenharia social, testes físicos e falhas em serviços de terceiros (Supabase, Google Cloud, Anthropic, Mercado Pago), que devem ser relatadas a eles.

## Como o projeto se protege

O que existe hoje está descrito no código e na documentação: isolamento por usuário com segurança por linha no banco (testada automaticamente), validação de sessão no servidor, cabeçalhos de segurança HTTP, segredos fora do repositório (Secret Manager), varredura de segredos e atualização automática de dependências vulneráveis no GitHub. O desenho de privacidade do Argumenta está no [relatório de impacto](docs/juridico/RIPD_ARGUMENTA.md).
