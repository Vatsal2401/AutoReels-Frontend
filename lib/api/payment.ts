import apiClient from "./client";

export interface CreateOrderDto {
    planId: string;
}

export interface CreditPlan {
    id: string;
    name: string;
    credits: number;
    price: number;
    displayPrice: number;
    currency: string;
    symbol: string;
    tag?: string;
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
    getPlans: async (): Promise<CreditPlan[]> => {
        const response = await apiClient.get<CreditPlan[]>("/payment/plans");
        return response.data;
    },

    getPublicPlans: async (): Promise<CreditPlan[]> => {
        const response = await apiClient.get<CreditPlan[]>("/payment/plans/public");
        return response.data;
    },

    createOrder: async (dto: CreateOrderDto): Promise<RazorpayOrder> => {
        const response = await apiClient.post<RazorpayOrder>("/payment/create-order", dto);
        return response.data;
    },

    verifyPayment: async (dto: VerifyPaymentDto): Promise<VerifyPaymentResponse> => {
        const response = await apiClient.post<VerifyPaymentResponse>("/payment/verify", dto);
        return response.data;
    },
};
