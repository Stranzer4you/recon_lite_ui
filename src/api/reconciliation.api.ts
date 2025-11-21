import http from "./http";

export interface ReconciliationHistory {
  id: number;
  matchedCount: number;
  unmatchedCount: number;
  rawCount: number;
  createdAt: string;
}

export const getReconciliationHistory = async (): Promise<ReconciliationHistory[] | null> => {
  try {
    const res = await http.get("/reconciliation/history");
    if (res.status === 200) return res.data.data;
    return [];
  } catch (err) {
    console.error("Error fetching reconciliation history:", err);
    return null;
  }
};
