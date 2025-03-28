
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ReceiptText } from "lucide-react";
import { formatDate, formatCurrency } from "./utils";

interface PaymentHistoryProps {
  paymentHistory: any[];
  isLoadingHistory: boolean;
}

export function PaymentHistory({ paymentHistory, isLoadingHistory }: PaymentHistoryProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="payment-history">
        <AccordionTrigger className="text-sm font-medium">
          <div className="flex items-center">
            <ReceiptText className="h-4 w-4 mr-2" />
            Payment History
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {isLoadingHistory ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : paymentHistory.length > 0 ? (
            <div className="space-y-4">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-md text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Payment Date:</span>
                    <span>{formatDate(payment.created_at)}</span>
                  </div>
                  {payment.amount_total && (
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Amount:</span>
                      <span>{formatCurrency(payment.amount_total, payment.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Status:</span>
                    <span className={payment.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
                      {payment.payment_status || payment.status}
                    </span>
                  </div>
                  {payment.period_start && payment.period_end && (
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Billing Period:</span>
                      <span>{formatDate(payment.period_start)} - {formatDate(payment.period_end)}</span>
                    </div>
                  )}
                  {payment.invoice_id && (
                    <div className="flex justify-between">
                      <span className="font-medium">Invoice ID:</span>
                      <span className="text-xs truncate max-w-[200px]">{payment.invoice_id}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-1">
              No payment records found. This could happen if your subscription was created recently and our system hasn't processed the payment record yet.
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
