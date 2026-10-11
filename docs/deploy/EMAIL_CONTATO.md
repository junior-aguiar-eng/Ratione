# E-mail de contato: contato@nexojuris.ia.br

As páginas de Termos e Privacidade apontam `contato@nexojuris.ia.br` como canal do titular de dados (LGPD, art. 9º). Hoje o domínio **não recebe e-mail** (sem MX; conferido em 11/10/2026). O remetente atual, `nao-responda@nexojuris.ia.br`, só **envia** pelo Resend.

Desenho escolhido: **receber** com encaminhamento gratuito (ImprovMX) para o Gmail e **responder como `contato@`** pelo Gmail usando o Resend, que já está verificado para o domínio. Custo zero. Não exige mexer em nada que já funciona (login, confirmação de conta, avisos de prazo).

> **Estado (11/10/2026):** recebimento **feito e testado** (DNS no Registro.br, ImprovMX ativo, mensagem de teste do Hotmail chegou ao Gmail). **Falta só o passo 3** (responder como `contato@` pelo Gmail), que usa uma chave secreta do Resend e fica com o responsável. Região de envio do Resend conferida: São Paulo (`sa-east-1`); chaves existentes: `ratione-lembretes`, `ratione-supabase-smtp` e `Supabase Integration` (o nome `gmail-contato` está livre).
>
> Quem faz: você. Criar conta no ImprovMX e editar o DNS no Registro.br são ações suas. Os valores abaixo são os que o ImprovMX documenta; **confira no painel dele**, que mostra os registros atuais.

## 1. ImprovMX (receber)

1. Em https://improvmx.com, crie a conta (plano gratuito) e adicione o domínio `nexojuris.ia.br`.
2. Crie o alias **`contato`** apontando para o seu Gmail.
3. O painel mostra o que falta no DNS e confirma quando estiver certo.

## 2. DNS no Registro.br (Configurar zona DNS, modo avançado)

Registros na raiz do domínio `nexojuris.ia.br` (a raiz hoje **não tem** MX nem TXT, então nada conflita):

| Tipo | Nome | Valor | Prioridade |
|---|---|---|---|
| MX | `@` (raiz) | `mx1.improvmx.com` | 10 |
| MX | `@` (raiz) | `mx2.improvmx.com` | 20 |
| TXT | `@` (raiz) | `v=spf1 include:spf.improvmx.com ~all` | |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contato@nexojuris.ia.br` | |

- Só pode existir **um** TXT de SPF na raiz. Se um dia outro serviço precisar de SPF na raiz, junte os `include:` na mesma linha.
- O envio pelo Resend usa o subdomínio `send.` e a chave DKIM `resend._domainkey`; esses registros **não mudam**.
- O `_dmarc` com `p=none` só observa (não rejeita nada). Subir para `quarantine` depois, se os relatórios estiverem limpos.

## 3. Responder como contato@ pelo Gmail (enviar)

1. No Resend (*API Keys*), crie uma chave **nova** só para isso: permissão **Sending access**, restrita ao domínio `nexojuris.ia.br`, nome `gmail-contato`. **Não reaproveite** a chave do SMTP do Supabase nem a dos lembretes: assim cada uma pode ser revogada sem afetar as outras.
2. No Gmail: *Configurações → Contas e importação → Enviar e-mail como → Adicionar outro endereço de e-mail*:
   - Nome: `Ratione`; e-mail: `contato@nexojuris.ia.br`; deixe marcado "Tratar como um alias".
   - Servidor SMTP: `smtp.resend.com`; porta `465`; SSL; usuário `resend`; senha = a chave `gmail-contato`.
3. O Gmail envia um código de confirmação para `contato@nexojuris.ia.br`; ele chega no próprio Gmail pelo encaminhamento (por isso o passo 1 vem antes). Digite o código.
4. Em *Ao responder uma mensagem*, deixe "Responder do mesmo endereço para o qual a mensagem foi enviada".

A chave fica guardada nas configurações do Gmail. Se o Gmail for comprometido, revogue `gmail-contato` no Resend.

## 4. Teste (feche o item)

1. De outro e-mail (por exemplo, o Hotmail), envie uma mensagem para `contato@nexojuris.ia.br`. Deve chegar no Gmail em segundos.
2. Responda pelo Gmail escolhendo `contato@` como remetente. No Hotmail, abra *Ver origem da mensagem* e confira `spf=pass`, `dkim=pass` e `dmarc=pass`.
3. Se o `spf` falhar, o remetente real é o Resend (`send.`) e o que vale é o `dkim=pass` alinhado ao domínio; o DMARC passa por DKIM.

## Depois de funcionando

- A **Política de privacidade já cita o ImprovMX** como prestador de encaminhamento (ele vê o endereço e o texto de quem escreve ao canal do titular). Se trocar de serviço, atualize o item 3 da página e a `AUDITORIA_BETA.md`.
- Pedidos de titulares chegam num e-mail comum: registre cada um (data e resposta) e responda em até 15 dias, como a página promete.
- Confirmar no ImprovMX/DPA onde as mensagens são processadas (pode ser fora do Brasil): mesmo ponto de transferência internacional já listado na auditoria.
