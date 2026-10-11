import Link from 'next/link';
import PageHeader from '../../components/PageHeader';
import { ContatoDoResponsavel, Destaque, Documento, LinhaDeVersao, Lista, Secao } from '../../components/Documento';
import { RESPONSAVEL } from '../../lib/legal';

export const metadata = { title: 'Termos de uso | Ratione' };

const link = 'text-brand-text underline underline-offset-2';

export default function TermosPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Transparência" title="Termos de uso" description="Condições para usar o Ratione durante o beta gratuito." />
      <Documento>
        <LinhaDeVersao />

        <Secao numero={1} titulo="Quem oferece o Ratione e como aceitar">
          <p>
            O Ratione é oferecido por <Destaque>{RESPONSAVEL.nome}</Destaque>, pessoa física, que responde por este serviço enquanto não houver
            pessoa jurídica. Contato: <ContatoDoResponsavel />.
          </p>
          <p>
            Ao criar a conta, você declara que leu estes Termos e a <Link href="/privacidade" className={link}>Política de privacidade</Link> e
            concorda com eles. Guardamos a versão dos Termos que você aceitou e o momento do aceite. Se não concordar, não crie a conta. O uso é destinado a maiores de
            18 anos com capacidade civil.
          </p>
        </Secao>

        <Secao numero={2} titulo="O que é o Ratione">
          <p>
            Um conjunto de ferramentas de apoio ao trabalho jurídico e ao estudo do Direito: <Destaque>PrazoZero</Destaque> (cálculo de prazos),{' '}
            <Destaque>NormaViva</Destaque> (consulta à redação de normas), <Destaque>TeseMap</Destaque> (mapa de precedentes) e{' '}
            <Destaque>Argumenta</Destaque> (análise de fundamentação). Cada ferramenta informa se está disponível, em prévia ou em demonstração; a
            situação de cada uma está em <Link href="/metodologia" className={link}>Metodologia e limitações</Link>. Hoje nenhuma ferramenta usa
            inteligência artificial.
          </p>
        </Secao>

        <Secao numero={3} titulo="O que o Ratione não é, e o que você precisa conferir">
          <p>
            O Ratione <Destaque>não presta serviços advocatícios</Destaque>, não emite parecer e não substitui a análise do profissional
            responsável. Os resultados são auxiliares.
          </p>
          <Lista>
            <li>
              <Destaque>A conferência da tempestividade de qualquer ato é sua.</Destaque> Confira a data no calendário do tribunal e nos atos
              normativos aplicáveis antes de contar com ela.
            </li>
            <li>
              O texto das normas e dos precedentes exibidos deve ser conferido na fonte oficial antes de ser citado em peças ou decisões.
            </li>
            <li>
              Feriados municipais e atos pontuais de cada tribunal não são considerados, salvo indicação expressa na ferramenta. O feriado local
              deve ser comprovado no ato de interposição do recurso (CPC, art. 1.003, § 6º).
            </li>
          </Lista>
        </Secao>

        <Secao numero={4} titulo="Beta gratuito">
          <p>
            Enquanto durar o beta, o uso é gratuito, sem garantia de funcionamento ininterrupto e sem compromisso de disponibilidade. Recursos
            podem mudar, ser suspensos ou deixar de existir; havendo mudança relevante, avisamos na plataforma e, quando houver conta, por e-mail.
            Se passarmos a cobrar, isso só vale para quem concordar com novas condições, informadas antes da contratação.
          </p>
        </Secao>

        <Secao numero={5} titulo="Conta e segurança">
          <Lista>
            <li>Informe dados verdadeiros e mantenha-os atualizados. A OAB é opcional e declaratória: não a verificamos.</li>
            <li>
              A conta é pessoal e intransferível. Você responde pela senha e pela atividade na conta; avise-nos logo em caso de uso não
              autorizado.
            </li>
            <li>Você pode excluir a conta quando quiser, em &ldquo;Minha conta&rdquo;. A exclusão remove os seus dados e não pode ser desfeita.</li>
          </Lista>
        </Secao>

        <Secao numero={6} titulo="Uso permitido">
          <p>É permitido o uso pessoal e profissional para fins lícitos. É proibido:</p>
          <Lista>
            <li>violar a lei ou direitos de terceiros;</li>
            <li>tentar acessar áreas, contas ou dados que não são seus;</li>
            <li>coletar dados do site de forma automatizada em massa, fazer engenharia reversa ou sobrecarregar o serviço;</li>
            <li>revender, sublicenciar ou compartilhar o seu acesso;</li>
            <li>usar o conteúdo para treinar modelos de inteligência artificial concorrentes.</li>
          </Lista>
          <p>Podemos aplicar limites razoáveis de uso para preservar a estabilidade do serviço.</p>
        </Secao>

        <Secao numero={7} titulo="O que você salva e escreve no Ratione">
          <p>
            Você continua titular do que salvar em &ldquo;Meu espaço&rdquo; e do nome que der a um aviso por e-mail. Você nos autoriza apenas a
            hospedar e exibir esse conteúdo para você, para prestar o serviço. Esses campos <Destaque>não são o lugar para nome de partes, número
            de processo ou dado de cliente</Destaque>: o que você escrever ali é guardado e, no caso do aviso, enviado por e-mail (ver a Política
            de privacidade). Você é responsável por não colocar nesses campos informação protegida por sigilo profissional ou segredo de justiça.
          </p>
        </Secao>

        <Secao numero={8} titulo="Avisos de prazo por e-mail">
          <p>
            O aviso por e-mail é uma conveniência, não uma garantia. Ele pode atrasar, não chegar (falha de e-mail, caixa de spam, endereço
            incorreto) ou ficar desatualizado se o calendário do tribunal mudar depois do seu cálculo. <Destaque>Não dispense a sua própria
            agenda de prazos</Destaque>; o aviso não substitui o controle do profissional.
          </p>
        </Secao>

        <Secao numero={9} titulo="Conteúdo jurídico e fontes">
          <p>
            Textos de leis, decretos, decisões e demais atos oficiais são de livre utilização (Lei 9.610/1998, art. 8º, IV); o Ratione os organiza
            e indica a fonte e a data da leitura. A organização, a curadoria, as relações entre precedentes, os cálculos, o código e a identidade
            visual são do responsável pelo serviço.
          </p>
          <p>
            Apesar do cuidado, pode haver erro, omissão ou defasagem. A data de verificação do calendário aparece no resultado. Se encontrar um
            erro, escreva para <ContatoDoResponsavel />.
          </p>
        </Secao>

        <Secao numero={10} titulo="Responsabilidade">
          <p>
            O Ratione é ferramenta de apoio. O responsável não responde por decisões ou atos praticados com base exclusiva nos resultados,
            incluindo perda de prazo, sem a conferência prevista no item 3, nem por indisponibilidade ou erro de fontes de terceiros (tribunais,
            órgãos públicos, provedores de hospedagem e de e-mail) fora do seu controle razoável.
          </p>
          <p>
            Nada nestes Termos exclui ou limita responsabilidade que a lei não permita excluir ou limitar, inclusive por dolo ou culpa grave e os
            direitos do consumidor, quando a relação for de consumo.
          </p>
        </Secao>

        <Secao numero={11} titulo="Suspensão e encerramento">
          <p>
            Podemos suspender ou encerrar contas em caso de violação destes Termos, fraude, uso abusivo ou ordem legal, com aviso prévio quando
            possível. Se o beta terminar ou o serviço for encerrado, avisaremos com antecedência razoável para você baixar os seus dados em
            &ldquo;Minha conta&rdquo;.
          </p>
        </Secao>

        <Secao numero={12} titulo="Alterações destes Termos">
          <p>
            Podemos alterar estes Termos. Mudanças relevantes serão comunicadas na plataforma e por e-mail, com antecedência razoável, e a versão e
            a data de vigência acima serão atualizadas. Se não concordar, você pode excluir a conta sem ônus.
          </p>
        </Secao>

        <Secao numero={13} titulo="Lei aplicável e foro">
          <p>
            Estes Termos são regidos pelas leis brasileiras. As controvérsias serão resolvidas no foro do domicílio do usuário, sem prejuízo de
            outro foro que a lei atribua. A nulidade de uma cláusula não afeta as demais.
          </p>
        </Secao>

        <Secao numero={14} titulo="Contato">
          <p>
            Dúvidas, pedidos e reclamações: <ContatoDoResponsavel />. Assuntos de dados pessoais: o mesmo endereço (ver a{' '}
            <Link href="/privacidade" className={link}>Política de privacidade</Link>).
          </p>
        </Secao>
      </Documento>
    </div>
  );
}
