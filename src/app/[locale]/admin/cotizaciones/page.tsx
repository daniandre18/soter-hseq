"use client";

import { useMemo, useState } from "react";
import { useDataStore } from "@/store/data-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { QUOTE_STATUS_CONFIG, formatDate, formatCurrency } from "@/lib/utils";
import type { Quote, QuoteStatus } from "@/types";
import { FileText, Search, Eye } from "lucide-react";

function QuoteDetail({ quote, onClose }: { quote: Quote; onClose: () => void }) {
  const { clients, updateQuote } = useDataStore();
  const client = clients.find((c) => c.id === quote.clientId);
  const cfg = QUOTE_STATUS_CONFIG[quote.status];

  const allowedTransitions: Partial<Record<QuoteStatus, QuoteStatus[]>> = {
    draft:    ["sent"],
    sent:     ["approved", "rejected"],
    approved: ["converted"],
  };
  const nextStatuses = allowedTransitions[quote.status] ?? [];

  return (
    <Modal open onClose={onClose} title={`${quote.code}`} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{client?.name}</p>
            <p className="text-xs text-gray-400">Válida hasta {formatDate(quote.validUntil)}</p>
          </div>
          <Badge className={`${cfg.color} ${cfg.bg} text-sm px-3 py-1`}>{cfg.label}</Badge>
        </div>

        {/* Items */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Servicios</h4>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Servicio</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Cant.</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Valor Unit.</th>
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
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-700 text-base">{formatCurrency(quote.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {quote.notes && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 font-medium mb-1">Notas</p>
            <p className="text-sm text-gray-700">{quote.notes}</p>
          </div>
        )}

        {/* Status transitions */}
        {nextStatuses.length > 0 && (
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {nextStatuses.map((s) => {
              const c = QUOTE_STATUS_CONFIG[s];
              return (
                <Button
                  key={s}
                  variant={s === "rejected" ? "danger" : "primary"}
                  size="sm"
                  onClick={() => { updateQuote(quote.id, { status: s }); onClose(); }}
                >
                  Marcar como {c.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function CotizacionesPage({ params }: { params: { locale: string } }) {
  const { quotes, clients } = useDataStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState<Quote | null>(null);

  const filtered = useMemo(
    () =>
      quotes.filter((q) => {
        const client = clients.find((c) => c.id === q.clientId);
        const matchSearch =
          !search ||
          q.code.toLowerCase().includes(search.toLowerCase()) ||
          client?.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || q.status === statusFilter;
        return matchSearch && matchStatus;
      }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [quotes, clients, search, statusFilter]
  );

  // Live detail
  const liveDetail = detail ? quotes.find((q) => q.id === detail.id) ?? null : null;

  return (
    <AppLayout locale={params.locale} title="Cotizaciones" requiredRole={["admin", "coordinator"]}>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Input
          placeholder="Buscar cotización o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="max-w-xs"
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="all">Todos los estados</option>
          {Object.entries(QUOTE_STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <span className="text-sm text-gray-400 ml-1">{filtered.length} cotizaciones</span>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No hay cotizaciones registradas</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicios</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Válida hasta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Creada</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((quote) => {
                  const client = clients.find((c) => c.id === quote.clientId);
                  const cfg = QUOTE_STATUS_CONFIG[quote.status];
                  return (
                    <tr
                      key={quote.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setDetail(quote)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{quote.code}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{client?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{quote.items.length} servicio{quote.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(quote.total)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${cfg.color} ${cfg.bg}`}>{cfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(quote.validUntil)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(quote.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Eye className="w-4 h-4 text-gray-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {liveDetail && <QuoteDetail quote={liveDetail} onClose={() => setDetail(null)} />}
    </AppLayout>
  );
}
