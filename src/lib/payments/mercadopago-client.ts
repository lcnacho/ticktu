import type {
  PaymentAdapter,
  CreatePreferenceParams,
  CreatePreferenceResult,
  ProcessRefundParams,
  ProcessRefundResult,
  CheckPaymentParams,
  CheckPaymentResult,
} from "./types";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!;
const MP_API_URL = "https://api.mercadopago.com";

async function mpFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${MP_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MercadoPago API error ${res.status}: ${body}`);
  }
  return res.json();
}

export const mercadopagoAdapter: PaymentAdapter = {
  async createPreference(
    params: CreatePreferenceParams,
  ): Promise<CreatePreferenceResult> {
    const data = await mpFetch("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify({
        items: params.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice / 100,
          currency_id: item.currency,
        })),
        payer: { email: params.buyerEmail },
        external_reference: params.externalReference,
        back_urls: {
          success: params.callbackUrls.success,
          failure: params.callbackUrls.failure,
          pending: params.callbackUrls.pending,
        },
        auto_return: "approved",
      }),
    });

    return {
      preferenceId: data.id,
      initPoint: data.init_point,
    };
  },

  async processRefund(
    params: ProcessRefundParams,
  ): Promise<ProcessRefundResult> {
    const data = await mpFetch(
      `/v1/payments/${params.paymentId}/refunds`,
      {
        method: "POST",
        body: JSON.stringify({ amount: params.amount / 100 }),
      },
    );

    return {
      refundId: String(data.id),
      status: data.status === "approved" ? "approved" : "rejected",
    };
  },

  async checkPaymentStatus(
    params: CheckPaymentParams,
  ): Promise<CheckPaymentResult> {
    const data = await mpFetch(
      `/checkout/preferences/${params.preferenceId}`,
    );

    // Check associated payments
    const payments = data.payment_methods_allowed ?? [];
    const lastPayment = payments[payments.length - 1];

    return {
      status: lastPayment?.status ?? "pending",
      paymentId: lastPayment?.id ? String(lastPayment.id) : null,
    };
  },
};
