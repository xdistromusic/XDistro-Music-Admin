import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { AdminFinancialReport } from "@/types/admin";

const EMPTY_FINANCIALS_REPORT: AdminFinancialReport = {
  generatedAt: new Date().toISOString(),
  allTimeSubscriptions: 0,
  usersEverSubscribed: 0,
  renewalEventsCount: 0,
  mostSubscribedPlan: null,
  planDistribution: [],
  renewalsByPeriod: [],
};

export const getAdminFinancialsReport = async (): Promise<AdminFinancialReport> => {
  if (isAdminDataDummyEnabled()) {
    return EMPTY_FINANCIALS_REPORT;
  }

  const payload = await requestAdminJson<{ data?: AdminFinancialReport }>("/financials");
  return payload.data || EMPTY_FINANCIALS_REPORT;
};
