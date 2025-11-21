import http from "./http";

export type Rule = {
  id: number;
  ruleName: string;
  ruleType: string;
  priority: number;
  isActive: boolean;
  description: string;
  ruleValue?: string | null;
  createdAt: string;
};

export const getAllRules = async (filters?: {
  isActive?: boolean;
  ruleType?: string;
  priority?: number;
}): Promise<Rule[]> => {
  try {
    const res = await http.get("/rules", { params: filters });
    return res.data.data?.rules || [];
  } catch (err) {
    console.error("Error fetching rules:", err);
    return [];
  }
};

export const getRuleById = async (id: number): Promise<Rule | null> => {
  try {
    const res = await http.get(`/rules/${id}`);
    return res.data.data || null;
  } catch (err) {
    console.error("Error fetching rule by ID:", err);
    return null;
  }
};

export const createRule = async (payload: Omit<Rule, "id" | "createdAt">) => {
  try {
    const res = await http.post("/rules", payload);
    return res.data.data;
  } catch (err) {
    console.error("Error creating rule:", err);
    throw err;
  }
};

export const updateRuleById = async (id: number, payload: Omit<Rule, "id" | "createdAt">) => {
  try {
    const res = await http.put(`/rules/${id}`, payload);
    return res.data.data;
  } catch (err) {
    console.error("Error updating rule:", err);
    throw err;
  }
};

export const updateRuleStatus = async (id: number, isActive: boolean) => {
  try {
    await http.patch(`/rules/${id}?isActive=${isActive}`);
  } catch (err) {
    console.error("Error toggling rule status:", err);
    throw err;
  }
};
