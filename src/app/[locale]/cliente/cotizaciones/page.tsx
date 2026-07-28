"use client";

import { useMemo, useState } from "react";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { QUOTE_STATUS_CONFIG, formatDate, formatCurrency } from "@/lib/utils";
import type { Quote } from "@/types";
import { FileText, Eye } from "lucide-react";

function QuoteView({ quote, onClose }: { quote: Quote; onClose: () => void }) {
  const { clients, updateQuote } = useDataStore();
  const client = clients.find((c) => c.id === quote.clientId);
  const cfg = QUOTE_STATUS_CONFIG[quote.status];

  return (
    <Modal open onClose={onClose} title={`Cotización ${quote.code}`} size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{client?.name}</p>
            <p className="text-sm text-gray-500">Válida hasta {formatDate(quote.validUntil)}</p>
          </div>
          <Badge className={`${cfg.color} ${cfg.bg} px-3 py-1 text-sm`}>{cfg.label}</Badge>
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Servicio</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Cant.</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Valor</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quote.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{item.serviceName}</p>
                    {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900">Total</td>
                <td className="px-4 py-3 text-right font-bold text-brand-700 text-lg">{formatCurrency(quote.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {quote.notes && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 font-medium mb-1">Notas</p>
            <p className="text-sm text-gray-700">{quote.notes}</p>
          </div>
        )}

        {/* Client approval action */}
        {quote.status === "sent" && (
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="danger"
              size="sm"
              onClick={() => { updateQuote(quote.id, { status: "rejected" }); onClose(); }}
            >
              Rechazar
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => { updateQuote(quote.id, { status: "approved" }); onClose(); }}
            >
              Aprobar Cotización
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function ClienteCotizacionesPage({ params }: { params: { locale: string } }) {
  const { quotes, clients } = useDataStore();
  const { currentUser } = useAuthStore();
  const [detail, setDetail] = useState<Quote | null>(null);

  const client = clients.find((c) => c.id === currentUser?.clientId);
  const myQuotes = useMemo(
    () => quotes.filter((q) => q.clientId === client?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [quotes, client]
  );

  const liveDetail = detail ? quotes.find((q) => q.id === detail.id) ?? null : null;

  return (
    <AppLayout locale={params.locale} title="Mis Cotizaciones" requiredRole="client">
      <div className="mb-4">
        <p className="text-sm text-gray-500">{myQuotes.length} cotizacion{myQuotes.length !== 1 ? "es" : ""} registradas</p>
      </div>

      {myQuotes.length === 0 ? (
        <Card className="text-center py-12 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No tienes cotizaciones</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {myQuotes.map((q) => {
            const cfg = QUOTE_STATUS_CONFIG[q.status];
            return (
              <Card
                key={q.id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => setDetail(q)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{q.code}</p>
                      <Badge className={`${cfg.color} ${cfg.bg}`}>{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {q.items.length} servicio{q.items.length !== 1 ? "s" : ""} · Válida hasta {formatDate(q.validUntil)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{formatCurrency(q.total)}</p>
                    <p className="text-xs text-gray-400">{formatDate(q.createdAt)}</p>
                  </div>
                  <Eye className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {liveDetail && <QuoteView quote={liveDetail} onClose={() => setDetail(null)} />}
    </AppLayout>
  );
}
