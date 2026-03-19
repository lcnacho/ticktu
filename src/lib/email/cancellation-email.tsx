import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type CancellationEmailProps = {
  eventName: string;
  eventDate: string;
  eventVenue: string;
  buyerName: string;
  producerName: string;
  producerLogoUrl?: string | null;
  primaryColor?: string;
  refundAmount?: string;
  currency?: string;
};

export function CancellationEmail({
  eventName,
  eventDate,
  eventVenue,
  buyerName,
  producerName,
  producerLogoUrl,
  primaryColor = "#6366f1",
  refundAmount,
  currency = "UYU",
}: CancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Evento cancelado: {eventName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {producerLogoUrl && (
            <Section style={logoSection}>
              <Img
                src={producerLogoUrl}
                alt={producerName}
                width="120"
                height="40"
                style={logo}
              />
            </Section>
          )}

          <Section
            style={{
              ...headerSection,
              backgroundColor: primaryColor,
            }}
          >
            <Heading style={headerHeading}>Evento Cancelado</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={greeting}>Hola {buyerName},</Text>

            <Text style={paragraph}>
              Lamentamos informarte que el siguiente evento ha sido cancelado:
            </Text>

            <Section style={eventCard}>
              <Text style={eventNameStyle}>{eventName}</Text>
              <Text style={eventDetail}>{eventDate}</Text>
              <Text style={eventDetail}>{eventVenue}</Text>
            </Section>

            {refundAmount && (
              <>
                <Hr style={divider} />
                <Text style={paragraph}>
                  Se procesara un reembolso por{" "}
                  <strong>
                    {currency} {refundAmount}
                  </strong>{" "}
                  a tu metodo de pago original. El reembolso puede demorar entre
                  5 y 10 dias habiles en reflejarse en tu cuenta.
                </Text>
              </>
            )}

            <Hr style={divider} />

            <Text style={paragraph}>
              Si tenes alguna consulta, por favor contacta directamente a{" "}
              <strong>{producerName}</strong>.
            </Text>

            <Text style={footer}>
              Este email fue enviado por {producerName} a traves de Ticktu.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default CancellationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const logoSection = {
  padding: "24px 24px 0",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const headerSection = {
  padding: "24px",
  textAlign: "center" as const,
};

const headerHeading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const contentSection = {
  padding: "24px",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#1a1a1a",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#4a4a4a",
};

const eventCard = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};

const eventNameStyle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#1a1a1a",
  margin: "0 0 4px",
};

const eventDetail = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 2px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
  marginTop: "24px",
};
