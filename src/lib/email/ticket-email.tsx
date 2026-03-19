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

type TicketInfo = {
  holderName: string;
  ticketTypeName: string;
  qrCode: string;
};

type TicketEmailProps = {
  eventName: string;
  eventDate: string;
  eventVenue: string;
  buyerName: string;
  producerName: string;
  producerLogoUrl?: string | null;
  primaryColor?: string;
  tickets: TicketInfo[];
};

export function TicketEmail({
  eventName,
  eventDate,
  eventVenue,
  buyerName,
  producerName,
  producerLogoUrl,
  primaryColor = "#6366f1",
  tickets,
}: TicketEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Tus entradas para {eventName}
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
            <Heading style={headerHeading}>Tus Entradas</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={greeting}>Hola {buyerName},</Text>

            <Text style={paragraph}>
              Tu compra fue confirmada. Aqui estan tus entradas para:
            </Text>

            <Section style={eventCard}>
              <Text style={eventNameStyle}>{eventName}</Text>
              <Text style={eventDetail}>{eventDate}</Text>
              <Text style={eventDetail}>{eventVenue}</Text>
            </Section>

            <Hr style={divider} />

            {tickets.map((ticket, i) => (
              <Section key={i} style={ticketCard}>
                <Text style={ticketHolder}>{ticket.holderName}</Text>
                <Text style={ticketType}>{ticket.ticketTypeName}</Text>
                <Img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qrCode)}`}
                  alt="QR Code"
                  width="200"
                  height="200"
                  style={qrImage}
                />
              </Section>
            ))}

            <Hr style={divider} />

            <Text style={paragraph}>
              Presenta el codigo QR en la entrada del evento. Cada codigo es
              unico y de uso unico.
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

export default TicketEmail;

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

const ticketCard = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "12px 0",
  textAlign: "center" as const,
};

const ticketHolder = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#1a1a1a",
  margin: "0 0 4px",
};

const ticketType = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 12px",
};

const qrImage = {
  margin: "0 auto",
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
