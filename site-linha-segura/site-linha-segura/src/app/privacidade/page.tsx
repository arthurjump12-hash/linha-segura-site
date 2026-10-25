import { PageHero } from "@/components/PageHero";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Política de privacidade",
  description: "Como a Linha Segura coleta, usa e protege dados pessoais enviados pelo site, conforme a LGPD.",
  path: "/privacidade",
});

const updated = "outubro de 2026";

export default function PrivacidadePage() {
  const { contact, owner, name } = siteConfig;
  return (
    <>
      <PageHero crumbs={[{ href: "/privacidade", label: "Privacidade" }]} title="Política de privacidade" lead={`Última atualização: ${updated}.`} />
      <section className="section pt-12">
        <div className="container-site">
          <article className="prose-site max-w-3xl">
            <p>
              Esta política explica como a {name} trata os dados pessoais enviados por este site, em conformidade com a Lei Geral de Proteção
              de Dados (Lei nº 13.709/2018).
            </p>

            <h2>1. Quem é o responsável</h2>
            <p>
              O responsável pelo tratamento dos dados é a {name}, representada por {owner}. Contato: WhatsApp {contact.whatsappDisplay}
              {contact.email ? ` ou e-mail ${contact.email}` : ""}.
            </p>

            <h2>2. Quais dados coletamos</h2>
            <ul>
              <li>Dados informados no formulário: nome, empresa, telefone, e-mail, tipo de solução e mensagem.</li>
              <li>Dados de mensagens enviadas pelo WhatsApp, quando você escolhe esse canal.</li>
              <li>Dados técnicos básicos de acesso registrados pela hospedagem, como endereço IP e navegador, para segurança do site.</li>
            </ul>
            <p>Este site não usa cookies de publicidade nem ferramentas de rastreamento de terceiros.</p>

            <h2>3. Para que usamos</h2>
            <ul>
              <li>Responder ao seu contato e preparar propostas.</li>
              <li>Agendar visitas e diagnósticos técnicos.</li>
              <li>Cumprir obrigações legais e proteger o site contra uso indevido.</li>
            </ul>
            <p>
              A base legal é o seu consentimento, informado no formulário, e os procedimentos preliminares a um contrato solicitados por
              você.
            </p>

            <h2>4. Compartilhamento</h2>
            <p>
              Não vendemos dados. Eles podem ser processados por fornecedores necessários ao funcionamento do site, como hospedagem e envio
              de e-mail, que atuam sob nossas instruções.
            </p>

            <h2>5. Por quanto tempo guardamos</h2>
            <p>
              Mantemos os dados pelo tempo necessário para atender sua solicitação e cumprir obrigações legais. Depois disso, eles são
              excluídos ou anonimizados.
            </p>

            <h2>6. Imagens e projetos de visão computacional</h2>
            <p>
              Projetos que utilizam imagens de câmeras são feitos somente com autorização do responsável pelo local e com medidas de
              proteção de dados. Imagens identificáveis de pessoas ou clientes não são publicadas neste site sem permissão.
            </p>

            <h2>7. Seus direitos</h2>
            <p>
              Você pode pedir a confirmação do tratamento, o acesso, a correção, a exclusão dos seus dados ou revogar o consentimento a
              qualquer momento pelos canais de contato acima.
            </p>

            <h2>8. Alterações</h2>
            <p>Esta política pode ser atualizada. A data da última versão fica no topo da página.</p>
          </article>
        </div>
      </section>
    </>
  );
}
