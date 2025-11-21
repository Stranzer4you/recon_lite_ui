export interface TransactionResponse {
  id: number;
  description: string;
  amount: number;
  source: string;
  status: string;
  createdAt: string;
}