
export enum TaxRate {
  Standard = 14,
  Reduced = 7,
  Exempt = 0
}

export enum InvoiceStatus {
  Draft = 'Rascunho',
  Issued = 'Emitida',
  SentToAGT = 'Enviada AGT',
  AcceptedAGT = 'Aceite AGT',
  Cancelled = 'Anulada',
  Paid = 'Paga'
}

export enum PaymentMethod {
  Cash = 'Numerário',
  BankTransfer = 'Transferência',
  Multicaixa = 'Multicaixa',
  CreditCard = 'Cartão Crédito'
}

export enum DocumentType {
  Invoice = 'FT', // Factura
  Receipt = 'RC', // Recibo
  CreditNote = 'NC', // Nota de Crédito
  DebitNote = 'ND' // Nota de Débito
}

export interface Client {
  id: string;
  name: string;
  nif: string; // Número de Identificação Fiscal
  email: string;
  phone: string;
  address: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: TaxRate;
  exemptionReason?: string; // Required if taxRate is 0
  total: number;
}

export interface AuditLog {
  id?: number;
  action: string;
  user: string;
  timestamp: string;
  detail: string;
  hash?: string; // Integrity check
}

// AI Log Schema
export interface AILog {
  ai_log_id: string;
  source_document_id?: string;
  model: {
    name: string;
    version: string;
    type: 'ner' | 'ocr' | 'anomaly';
  };
  timestamp: string;
  extraction?: {
    fields: Record<string, { value: any; confidence: number }>;
  };
  actions_suggested?: Array<{ type: string; confidence: number }>;
  explanation?: string;
}

export interface Invoice {
  id: string; // UUID
  series: string; // e.g., '2025'
  number: number;
  type: DocumentType;
  date: string; // Data Emissão
  dueDate: string; // Vencimento
  
  // Client snapshot
  clientId: string;
  clientName: string;
  clientNif: string;
  clientAddress?: string;

  items: InvoiceItem[];
  
  // Totals
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: 'AOA';

  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  
  // AGT Compliance
  hash?: string; // Placeholder for AGT signature hash
  agtProtocol?: string;
  agtResponseTimestamp?: string;
  
  auditTrail: AuditLog[];
}

export interface CompanyProfile {
  name: string;
  nif: string;
  address: string;
  phone: string;
  email: string;
  regime: 'Geral' | 'Simplificado' | 'Exclusão';
  retentionYears?: number;
}
