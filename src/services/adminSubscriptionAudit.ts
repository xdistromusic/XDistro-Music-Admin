import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { AdminSubscriptionAuditReport } from "@/types/admin";

const EMPTY_AUDIT_REPORT: AdminSubscriptionAuditReport = {
  generatedAt: new Date().toISOString(),
  currentDuplicateActiveCount: 0,
  currentDuplicateActiveUsers: [],
  likelyDuplicateCleanupCount: 0,
  likelyDuplicateCleanupRows: [],
};

export const getAdminSubscriptionAudit = async (): Promise<AdminSubscriptionAuditReport> => {
  if (isAdminDataDummyEnabled()) {
    return EMPTY_AUDIT_REPORT;
  }

  const payload = await requestAdminJson<{ data?: AdminSubscriptionAuditReport }>("/audit/subscriptions");
  return payload.data || EMPTY_AUDIT_REPORT;
};
