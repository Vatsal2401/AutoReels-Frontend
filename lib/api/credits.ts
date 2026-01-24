import apiClient from "./client";

export interface CreditBalance {
  balance: number;
}

export interface CreditInfo {
  balance: number;
  is_premium: boolean;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: "purchase" | "deduction" | "refund" | "bonus" | "expiration";
  amount: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface TransactionHistory {
  transactions: CreditTransaction[];
}

export interface PurchaseCreditsDto {
  amount: number;
}

export interface PurchaseCreditsResponse {
  message: string;
  transaction: CreditTransaction;
  balance: number;
}

export const creditsApi = {
  getBalance: async (): Promise<CreditBalance> => {
    const response = await apiClient.get<CreditBalance>("/credits/balance");
    return response.data;
  },

  getCreditInfo: async (): Promise<CreditInfo> => {
    const response = await apiClient.get<CreditInfo>("/credits/me");
    return response.data;
  },

  getHistory: async (limit?: number, offset?: number): Promise<TransactionHistory> => {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    
    const response = await apiClient.get<TransactionHistory>(
      `/credits/history?${params.toString()}`
    );
    return response.data;
  },

  purchaseCredits: async (dto: PurchaseCreditsDto): Promise<PurchaseCreditsResponse> => {
    const response = await apiClient.post<PurchaseCreditsResponse>(
      "/credits/purchase",
      dto
    );
    return response.data;
  },
};
