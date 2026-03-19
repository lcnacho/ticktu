export type PaymentItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  currency: string;
};

export type CreatePreferenceParams = {
  orderId: string;
  items: PaymentItem[];
  buyerEmail: string;
  callbackUrls: {
    success: string;
    failure: string;
    pending: string;
  };
  externalReference: string;
};

export type CreatePreferenceResult = {
  preferenceId: string;
  initPoint: string;
};

export type ProcessRefundParams = {
  paymentId: string;
  amount: number;
};

export type ProcessRefundResult = {
  refundId: string;
  status: "approved" | "rejected";
};

export type CheckPaymentParams = {
  preferenceId: string;
};

export type CheckPaymentResult = {
  status: "approved" | "pending" | "rejected" | "cancelled";
  paymentId: string | null;
};

export interface PaymentAdapter {
  createPreference(
    params: CreatePreferenceParams,
  ): Promise<CreatePreferenceResult>;
  processRefund(params: ProcessRefundParams): Promise<ProcessRefundResult>;
  checkPaymentStatus(params: CheckPaymentParams): Promise<CheckPaymentResult>;
}
