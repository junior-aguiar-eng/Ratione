import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import { ContatoDoResponsavel, Destaque, Documento, LinhaDeVersao, Lista, Secao } from '../../components/Documento';
import { RESPONSAVEL } from '../../lib/legal';

export const metadata = { title: 'Privacidade | Ratione' };

const link = 'text-brand-text underline underline-offset-2';

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Transparência" title="Privacidade" description="O que o Ratione guarda sobre você, por quê, com quem e como apagar." />
      <Documento>
        <LinhaDeVersao />

        <Secao numero={1} titulo="Quem é o responsável">
          <p>
            O controlador dos dados pessoais é <Destaque>{RESPONSAVEL.nome}</Destaque>, pessoa física, responsável pelo Ratione. Ainda não há
            encarregado designado: o canal para qualquer pedido sobre dados pessoais é <ContatoDoResponsavel />. Base legal: Lei 13.709/2018
            (LGPD).
          </p>
        </Secao>

        <Secao numero={2} titulo="O que guardamos e para quê">
          <p>
            Os cálculos do PrazoZero são feitos no seu navegador: o que você digita nas ferramentas não vai ao servidor, a menos que você
            escolha salvar (item abaixo). O uso exige uma conta. Com ela, guardamos:
          </p>
          <Lista>
            <li>
              <Destaque>Conta:</Destaque> e-mail e senha. A senha é guardada de forma criptografada (hash) e nós não a vemos. Para criar e manter
              a conta e permitir o acesso (execução de contrato, LGPD, art. 7º, V). Também guardamos a versão dos Termos que você aceitou.
            </li>
            <li>
              <Destaque>Perfil (opcional):</Destaque> nome, atuação, número da OAB (declaratório, não verificado), tribunal e UF padrão. Para
              preencher as ferramentas por você; você pode deixar em branco ou apagar.
            </li>
            <li>
              <Destaque>Registros em &ldquo;Meu espaço&rdquo;:</Destaque> título, descrição curta, ferramenta, link interno e data do que você
              salvar. O título pode trazer texto que você digitou (por exemplo, o nome de um ato); <Destaque>não escreva nome de partes, número
              de processo nem dado de cliente</Destaque>.
            </li>
            <li>
              <Destaque>Avisos por e-mail:</Destaque> o nome que você deu ao aviso, o tribunal, a data do vencimento, quais avisos escolheu
              (3 dias e 1 dia antes) e quando cada e-mail foi enviado. Para enviar o aviso que você pediu.
            </li>
            <li>
              <Destaque>Registros técnicos de acesso:</Destaque> endereço IP, navegador, data, hora e endereço da página acessada, mantidos pelos
              serviços de hospedagem e de login para segurança e para investigar erros (legítimo interesse, art. 7º, IX). Nossos próprios
              registros de erro não incluem corpo de requisição, cookies, e-mail, senha, token nem texto digitado por você.
            </li>
          </Lista>
          <p>
            Não usamos ferramentas de estatística de uso nem de publicidade, não colocamos serviços de terceiros que rastreiam você e não vendemos
            dados pessoais. Hoje nenhuma ferramenta usa inteligência artificial e não tomamos decisões automatizadas sobre você.
          </p>
        </Secao>

        <Secao numero={3} titulo="Com quem compartilhamos">
          <p>Só com os prestadores necessários para o serviço funcionar (operadores):</p>
          <Lista>
            <li>
              <Destaque>Supabase</Destaque> (banco de dados e login): região de São Paulo. Guarda a conta, o perfil, os registros e os avisos.
            </li>
            <li>
              <Destaque>Google Cloud</Destaque> (hospedagem do site): servidor em São Paulo. Os registros técnicos de acesso, mantidos por 30 dias,
              ficam em localização global do Google Cloud, que pode ser fora do Brasil.
            </li>
            <li>
              <Destaque>Resend</Destaque> (envio de e-mail): recebe o seu endereço, o assunto e o texto da mensagem para entregar os e-mails de
              confirmação de conta, de nova senha e dos avisos de prazo (o texto do aviso traz o nome que você deu a ele). Pode processar dados
              fora do Brasil.
            </li>
            <li>Autoridades, quando a lei exigir.</li>
          </Lista>
          <p>
            Quando há tratamento fora do Brasil, ele ocorre nos termos do art. 33 da LGPD, com as garantias contratuais oferecidas por esses
            prestadores.
          </p>
        </Secao>

        <Secao numero={4} titulo="Por quanto tempo guardamos">
          <Lista>
            <li>Conta, perfil, registros e avisos: enquanto você não os apagar nem excluir a conta.</li>
            <li>
              Excluir a conta remove, de uma vez, o cadastro, o perfil, os registros e os avisos. Cópias de segurança do prestador de banco de dados
              podem manter os dados por um período limitado depois disso.
            </li>
            <li>Registros técnicos de acesso do Google Cloud: 30 dias. Registros de login e de e-mail seguem o prazo de cada prestador.</li>
          </Lista>
        </Secao>

        <Secao numero={5} titulo="Seus direitos e como exercê-los">
          <p>A LGPD (art. 18) garante, entre outros, confirmação do tratamento, acesso, correção, eliminação, portabilidade e informação sobre compartilhamento. Em &ldquo;Minha conta&rdquo; você pode, sem falar com ninguém:</p>
          <Lista>
            <li>corrigir o perfil e trocar a senha;</li>
            <li>baixar todos os seus dados;</li>
            <li>apagar os registros salvos e os avisos;</li>
            <li>excluir a conta por completo (pede a senha atual e não pode ser desfeito).</li>
          </Lista>
          <p>
            Para qualquer outro pedido, escreva para <ContatoDoResponsavel />; respondemos em até 15 dias. Você também pode reclamar à
            Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </Secao>

        <Secao numero={6} titulo="Segurança">
          <p>
            A conexão com o site é protegida por HTTPS. Cada conta só acessa os próprios dados: o isolamento é feito no banco de dados e testado
            automaticamente. As chaves de acesso aos serviços ficam fora do código. Nenhum sistema é totalmente imune; em caso de incidente
            relevante, comunicaremos você e a ANPD nos termos da LGPD (art. 48).
          </p>
        </Secao>

        <Secao numero={7} titulo="Cookies e armazenamento no seu navegador" id="cookies">
          <p>Usamos só o que o site precisa para funcionar. Nada serve a publicidade ou a medição de uso.</p>
          <Lista>
            <li>
              <Destaque>Cookie de sessão do login</Destaque> (do Supabase, com nome começando por <code>sb-</code>): mantém você conectado até você
              sair. Essencial; sem ele não há como entrar.
            </li>
            <li>
              <Destaque><code>ratione_tema</code></Destaque>: lembra se você escolheu o tema claro ou escuro. Fica neste navegador até você limpar.
            </li>
            <li>
              <Destaque><code>ratione_historico_recente</code></Destaque>: itens que foram salvos neste navegador antes de você ter conta. Se você
              aceitar, eles passam para a conta e são apagados daqui.
            </li>
          </Lista>
          <p>
            Como não usamos cookies de medição nem de publicidade, não há banner de consentimento. Você pode bloquear ou apagar cookies e o
            armazenamento local nas configurações do navegador, mas sem o cookie de sessão não é possível manter o login. As fontes de letra são
            servidas pelo próprio site.
          </p>
        </Secao>

        <Secao numero={8} titulo="Crianças e adolescentes">
          <p>O Ratione é destinado a maiores de 18 anos. Não coletamos dados de menores de propósito; se souber de algum caso, avise.</p>
        </Secao>

        <Secao numero={9} titulo="Mudanças nesta política">
          <p>
            Antes de lançar qualquer funcionalidade que envolva envio de documentos, inteligência artificial ou cobrança, esta política será
            atualizada com as novas regras (armazenamento, retenção, exclusão e prestadores). Mudanças relevantes serão comunicadas na plataforma
            e por e-mail, e a versão e a data acima serão atualizadas. Os <Link href="/termos" className={link}>Termos de uso</Link> também
            se aplicam.
          </p>
        </Secao>
      </Documento>
    </div>
  );
}
