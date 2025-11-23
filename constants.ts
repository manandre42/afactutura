import { CompanyProfile, TaxRate, Client, Invoice, InvoiceStatus, PaymentMethod, DocumentType } from './types';

export const EXEMPTION_REASONS = [
  "M02 - Transmissão de bens e serviço não sujeita",
  "M04 - Isento Artigo 12.º alínea a) do CIVA",
  "M10 - Isento Artigo 12.º alínea e) do CIVA",
  "M11 - Regime de não sujeição"
];

export const DEFAULT_COMPANY: CompanyProfile = {
  name: "Minha Empresa, Lda",
  nif: "5001234567",
  address: "Rua Rainha Ginga, Luanda, Angola",
  phone: "+244 923 000 000",
  email: "geral@minhaempresa.ao",
  regime: "Geral"
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Cliente Particular',
    nif: '999999999',
    email: '',
    phone: '',
    address: 'Luanda'
  },
  {
    id: 'c2',
    name: 'Empresa Exemplo SA',
    nif: '5401112221',
    email: 'compras@exemplo.ao',
    phone: '+244 222 111 222',
    address: 'Talatona, Luanda'
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    series: '2025A',
    number: 1,
    type: DocumentType.Invoice,
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    dueDate: new Date().toISOString(),
    clientId: 'c2',
    clientName: 'Empresa Exemplo SA',
    clientNif: '5401112221',
    items: [
      { id: 'i1', description: 'Consultoria Informática', quantity: 10, unitPrice: 25000, taxRate: TaxRate.Standard, total: 250000 }
    ],
    subtotal: 250000,
    taxTotal: 35000,
    total: 285000,
    currency: 'AOA',
    status: InvoiceStatus.Issued,
    paymentMethod: PaymentMethod.BankTransfer,
    hash: 'H4sIAAAAA...',
    auditTrail: []
  },
  {
    id: 'inv_2',
    series: '2025A',
    number: 2,
    type: DocumentType.Invoice,
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    dueDate: new Date().toISOString(),
    clientId: 'c1',
    clientName: 'Cliente Particular',
    clientNif: '999999999',
    items: [
      { id: 'i2', description: 'Reparação PC', quantity: 1, unitPrice: 15000, taxRate: TaxRate.Standard, total: 15000 }
    ],
    subtotal: 15000,
    taxTotal: 2100,
    total: 17100,
    currency: 'AOA',
    status: InvoiceStatus.Paid,
    paymentMethod: PaymentMethod.Cash,
    hash: 'J7kL90...',
    auditTrail: []
  }
];