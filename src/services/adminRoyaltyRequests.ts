import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminRoyaltyRequests } from "@/data/adminRoyaltyRequests";
import { AdminRoyaltyRequest, AdminRoyaltyRequestStatus } from "@/types/admin";

const ADMIN_ROYALTY_REQUESTS_KEY = "admin:royalty-requests";

const normalizePaymentMethod = (paymentMethod: any): any => {
  if (!paymentMethod || typeof paymentMethod !== 'object') {
    return { type: 'paypal' };
  }

  const type = paymentMethod.type || 'paypal';
  
  // Always include all bank fields for bank payment methods
  if (type === 'bank') {
    return {
      type,
      bankName: paymentMethod.bank_name || paymentMethod.bankName || '',
      accountNumber: paymentMethod.account_number || paymentMethod.accountNumber || '',
      routingNumber:
        paymentMethod.sort_code ||
        paymentMethod.routing_number ||
        paymentMethod.routingNumber ||
        '',
      accountHolder: paymentMethod.account_holder_name || paymentMethod.accountHolder || '',
      accountType: paymentMethod.account_type || paymentMethod.accountType || '',
      country: paymentMethod.country || '',
      iban: paymentMethod.iban || '',
      swiftCode: paymentMethod.swift_code || paymentMethod.swiftCode || '',
    };
  }

  // For PayPal, include the email
  return {
    type,
    paypalEmail: paymentMethod.pay_pal_email || paymentMethod.paypalEmail || '',
  };
};

const normalizeRoyaltyRequest = (request: any): AdminRoyaltyRequest => ({
  id: request.id,
  artistName: request.artist_name ?? request.artistName,
  artistEmail: request.artist_email ?? request.artistEmail,
  amount: Number(request.amount ?? 0),
  requestDate: request.request_date ?? request.requestDate ?? request.requested_at ?? "",
  status: request.status,
  paymentMethod: normalizePaymentMethod(request.payment_method ?? request.paymentMethod ?? {}),
  accountBalance: Number(request.account_balance ?? request.accountBalance ?? 0),
  minimumThreshold: Number(request.minimum_threshold ?? request.minimumThreshold ?? 0),
  previousPayments: request.previous_payments ?? request.previousPayments ?? [],
});

const readStoredRoyaltyRequests = (): AdminRoyaltyRequest[] => {
  try {
    const raw = localStorage.getItem(ADMIN_ROYALTY_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ROYALTY_REQUESTS_KEY, JSON.stringify(mockAdminRoyaltyRequests));
      return mockAdminRoyaltyRequests;
    }

    const parsed = JSON.parse(raw) as AdminRoyaltyRequest[];
    if (!Array.isArray(parsed)) {
      return mockAdminRoyaltyRequests;
    }

    return parsed;
  } catch {
    return mockAdminRoyaltyRequests;
  }
};

const writeStoredRoyaltyRequests = (requests: AdminRoyaltyRequest[]) => {
  localStorage.setItem(ADMIN_ROYALTY_REQUESTS_KEY, JSON.stringify(requests));
};

export const getAdminRoyaltyRequests = async (): Promise<AdminRoyaltyRequest[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredRoyaltyRequests();
  }

  const payload = await requestAdminJson<{ data?: any[]; requests?: any[] }>(
    "/royalty-requests"
  );

  const rawRequests = payload.data || payload.requests || [];
  return rawRequests.map(normalizeRoyaltyRequest);
};

export const updateAdminRoyaltyRequestStatus = async (
  requestId: AdminRoyaltyRequest["id"],
  status: AdminRoyaltyRequestStatus
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredRoyaltyRequests().map((request) =>
      request.id === requestId ? { ...request, status } : request
    );
    writeStoredRoyaltyRequests(updated);
    return;
  }

  await requestAdminJson(`/royalty-requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
