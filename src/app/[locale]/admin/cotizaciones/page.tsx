"use client";

import { useMemo, useState } from "react";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { QUOTE_STATUS_CONFIG, formatDate, formatCurrency } from "@/lib/utils";
import {
  EMPTY_DRAFT_ITEM,
  buildQuoteItems,
  computeItemsTotal,
  computeRowTotal,
  defaultValidUntil,
  getValidDraftItems,
  nextQuoteStatuses,
  type DraftQuoteItem,
} from "@/lib/quotes";
import type { Quote } from "@/types";
import { FileText, Search, Eye, Plus, Trash2 } from "lucide-react";

function QuoteDetail({ quote, onClose }: { quote: Quote; onClose: () => void }) {
  const { clients, updateQuote } = useDataStore();
  const client = clients.find((c) => c.id === quote.clientId);
  const cfg = QUOTE_STATUS_CONFIG[quote.status];
  const nextStatuses = nextQuoteStatuses(quote.status);

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

// ─── Create Quote Modal ─────────────────────────────────────────────────────
function NewQuoteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clients, services, addQuote } = useDataStore();
  const { currentUser } = useAuthStore();

  const [clientId, setClientId] = useState("");
  const [validUntil, setValidUntil] = useState(defaultValidUntil());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftQuoteItem[]>([{ ...EMPTY_DRAFT_ITEM }]);

  const activeServices = services.filter((s) => s.active);

  const updateItem = (index: number, patch: Partial<DraftQuoteItem>) => {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const setItemService = (index: number, serviceId: string) => {
    const service = activeServices.find((s) => s.id === serviceId);
    updateItem(index, { serviceId, unitPrice: service ? String(service.price) : "" });
  };

  const addRow = () => setItems((rows) => [...rows, { ...EMPTY_DRAFT_ITEM }]);
  const removeRow = (index: number) => setItems((rows) => rows.filter((_, i) => i !== index));

  const subtotal = computeItemsTotal(items);
  const canSave = !!clientId && !!validUntil && getValidDraftItems(items).length > 0 && !!currentUser;

  const reset = () => {
    setClientId("");
    setValidUntil(defaultValidUntil());
    setNotes("");
    setItems([{ ...EMPTY_DRAFT_ITEM }]);
  };

  const handleSave = () => {
    if (!canSave || !currentUser) return;
    const quoteItems = buildQuoteItems(items, activeServices);
    const total = quoteItems.reduce((sum, item) => sum + item.total, 0);

    addQuote({
      clientId,
      items: quoteItems,
      subtotal: total,
      tax: 0,
      total,
      status: "draft",
      validUntil,
      notes: notes || undefined,
      createdBy: currentUser.id,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Nueva Cotización"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave}>Crear Cotización</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Cliente *" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Seleccionar cliente...</option>
            {clients.filter((c) => c.status === "active").map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input
            label="Válida hasta *"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">Servicios</h4>
            <Button variant="ghost" size="sm" onClick={addRow}>
              <Plus className="w-4 h-4" /> Agregar servicio
            </Button>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Servicio</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-20">Cant.</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-32">Valor Unit.</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-32">Total</th>
                  <th className="px-2 py-2 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">
                      <select
                        value={row.serviceId}
                        onChange={(e) => setItemService(i, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar servicio...</option>
                        {activeServices.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateItem(i, { quantity: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        value={row.unitPrice}
                        onChange={(e) => updateItem(i, { unitPrice: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(computeRowTotal(row))}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {items.length > 1 && (
                        <button
                          onClick={() => removeRow(i)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Quitar servicio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-3 py-2.5 text-right font-bold text-gray-900">Total</td>
                  <td className="px-3 py-2.5 text-right font-bold text-brand-700">{formatCurrency(subtotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <Textarea
          label="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Condiciones, alcance, observaciones..."
        />
      </div>
    </Modal>
  );
}

export default function CotizacionesPage({ params }: { params: { locale: string } }) {
  const { quotes, clients } = useDataStore();
  const { search, setSearch, statusFilter, setStatusFilter } = useSearchFilter();
  const [detail, setDetail] = useState<Quote | null>(null);
  const [newQuoteOpen, setNewQuoteOpen] = useState(false);

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
        <Button className="ml-auto" onClick={() => setNewQuoteOpen(true)}>
          <Plus className="w-4 h-4" /> Nueva Cotización
        </Button>
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

      <NewQuoteModal open={newQuoteOpen} onClose={() => setNewQuoteOpen(false)} />
      {liveDetail && <QuoteDetail quote={liveDetail} onClose={() => setDetail(null)} />}
    </AppLayout>
  );
}
