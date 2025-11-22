import http from "./http";


export const getAllTransactions = async (
  pageNumber: number,
  pageSize: number,
  filters?: { status?: string; source?: "BANK" | "SYSTEM" }
): Promise<any> => {
  try {
    const params: any = { pageNumber, pageSize, ...filters };
    const res = await http.get("/transactions", { params });
    if (res?.status === 200 || res?.status === 201) return res?.data;
    return {};
  } catch (e) {
    console.error(e);
    return null;
  }
};



export const deleteTransactionById = async (id: number): Promise<boolean> => {
  try {
    const res = await http.delete(`/transactions/${id}`);

    return res?.status === 200 || res?.status === 204;
  } catch (e) {
    console.error("Delete API failed:", e);
    return false;
  }
};


export const createTransaction = async (payload: any): Promise<any> => {
  try {
    const res = await http.post("/transactions", payload);
    return res;
  } catch (e) {
    console.error(e);
    throw e;
  }
};


export const getTransactionById = async (id: number) => {
  try {
    const res = await http.get(`/transactions/${id}`);
    if (res.status === 200 && res.data?.data) {
      return res.data.data;
    }
    console.log("response in the api ",res);
    return null;
  } catch (err) {
    console.error("Error fetching transaction by id:", err);
    return null;
  }
};


export const updateTransactionById = async (id: number, payload: { description: string; amount: number; source: "BANK" | "SYSTEM" }) => {
  try {
    const res = await http.put(`/transactions/${id}`, payload);
    return res.status === 200;
  } catch (err) {
    console.error("Error updating transaction:", err);
    return false;
  }
};


export const reconcileTransactions = async () => {
  try {
    const res = await http.post("/transactions/reconcile");
    return res.status === 200;
  } catch (err) {
    console.error("Reconcile API failed:", err);
    return false;
  }
};
