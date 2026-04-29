import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Clock, CreditCard, Ban as Bank, Copy } from "lucide-react";
import { toast } from "@/lib/toast";
import { AdminRoyaltyRequest, AdminRoyaltyRequestStatus } from "@/types/admin";

interface PaymentDetailsModalProps {
  request: AdminRoyaltyRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (requestId: AdminRoyaltyRequest["id"], newStatus: AdminRoyaltyRequestStatus) => void;
}

const PaymentDetailsModal = ({ request, isOpen, onClose, onStatusUpdate }: PaymentDetailsModalProps) => {
  if (!request) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank':
        return <CreditCard className="w-5 h-5" />;
      case 'paypal':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleStatusUpdate = (newStatus: AdminRoyaltyRequestStatus) => {
    onStatusUpdate?.(request.id, newStatus);
    toast.success(`Payment request ${newStatus.toLowerCase()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Helper to check if a value should be displayed
  const hasValue = (val: unknown): boolean => {
    return val != null && val !== '';
  };

  // Enhanced request with proper field mapping - no mock data needed since backend should provide all fields
  const enhancedRequest = {
    ...request,
    paymentMethod: {
      ...request.paymentMethod,
      // Ensure accountHolder falls back to artistName if not provided
      accountHolder: request.paymentMethod.accountHolder || request.artistName,
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-onerpm-orange font-bold flex items-center gap-3">
            Payment Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{enhancedRequest.artistName}</h3>
                <p className="text-lg text-gray-600">{enhancedRequest.artistEmail}</p>
                <p className="text-sm text-gray-500">Request ID: #{enhancedRequest.id}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className={getStatusColor(enhancedRequest.status)}>
                  {enhancedRequest.status}
                </Badge>
              </div>
            </div>

            <div className="md:text-right">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(enhancedRequest.amount)}
              </div>
              <div className="text-sm text-gray-600">Requested Amount</div>
              <div className="text-xs text-gray-500 mt-1">
                Balance: {formatCurrency(enhancedRequest.accountBalance)}
              </div>
            </div>
          </div>

          {/* Request Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Request Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Request Date</p>
                      <p className="font-medium">{enhancedRequest.requestDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Minimum Threshold</p>
                      <p className="font-medium">{formatCurrency(enhancedRequest.minimumThreshold)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Processing Time</p>
                      <p className="font-medium">3-5 Business Days</p>
                    </div>
                  </div>
                </div>
              </div>              
            </CardContent>
          </Card>

          {/* Payment Method Details */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {getPaymentMethodIcon(enhancedRequest.paymentMethod.type)}
                Payment Method Details
              </h4>
              
              {enhancedRequest.paymentMethod.type === 'bank' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {/* Bank Name - Always show for bank payments */}
                      <div>
                        <p className="text-sm text-gray-600">Bank Name</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {enhancedRequest.paymentMethod.bankName || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                          {hasValue(enhancedRequest.paymentMethod.bankName) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.bankName), "Bank name")}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Account Holder - Always show for bank payments */}
                      <div>
                        <p className="text-sm text-gray-600">Account Holder</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {enhancedRequest.paymentMethod.accountHolder || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                          {hasValue(enhancedRequest.paymentMethod.accountHolder) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.accountHolder), "Account holder")}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Country - Always show for bank payments */}
                      <div>
                        <p className="text-sm text-gray-600">Country</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {enhancedRequest.paymentMethod.country || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                          {hasValue(enhancedRequest.paymentMethod.country) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.country), "Country")}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Account Type - Always show for bank payments */}
                      <div>
                        <p className="text-sm text-gray-600">Account Type</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {enhancedRequest.paymentMethod.accountType || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                          {hasValue(enhancedRequest.paymentMethod.accountType) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.accountType), "Account type")}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Account Number - Always show for bank payments */}
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-medium">
                            {enhancedRequest.paymentMethod.accountNumber || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                          {hasValue(enhancedRequest.paymentMethod.accountNumber) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.accountNumber), "Account number")}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Routing Number - Always show for bank payments */}
                      <div>
                        <p className="text-sm text-gray-600">Routing Number</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-medium">
                            {enhancedRequest.paymentMethod.routingNumber || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                          {hasValue(enhancedRequest.paymentMethod.routingNumber) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.routingNumber), "Routing number")}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* IBAN - Always show for bank payments */}
                      <div>
                        <p className="text-sm text-gray-600">IBAN</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-medium">
                            {enhancedRequest.paymentMethod.iban || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                          {hasValue(enhancedRequest.paymentMethod.iban) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.iban), "IBAN")}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Swift Code - Always show for bank payments */}
                      <div>
                        <p className="text-sm text-gray-600">Swift Code</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-medium">
                            {enhancedRequest.paymentMethod.swiftCode || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                          {hasValue(enhancedRequest.paymentMethod.swiftCode) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.swiftCode), "Swift code")}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {hasValue(enhancedRequest.paymentMethod.paypalEmail) && (
                    <div>
                      <p className="text-sm text-gray-600">PayPal Email</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{enhancedRequest.paymentMethod.paypalEmail}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(String(enhancedRequest.paymentMethod.paypalEmail), "PayPal email")}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <div className="ml-auto">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsModal;