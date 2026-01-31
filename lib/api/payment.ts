import apiClient from "./client";

export interface CreateOrderDto {
    amount: number;
    credits: number;
}

export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, any>;
    created_at: number;
}

export interface VerifyPaymentDto {
    orderId: string;
    paymentId: string;
    signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
}

export const paymentApi = {
    createOrder: async (dto: CreateOrderDto): Promise<RazorpayOrder> => {
        const response = await apiClient.post<RazorpayOrder>("/payment/create-order", dto);
        return response.data;
    },

    verifyPayment: async (dto: VerifyPaymentDto): Promise<VerifyPaymentResponse> => {
        const response = await apiClient.post<VerifyPaymentResponse>("/payment/verify", dto);
        return response.data;
    },
};
