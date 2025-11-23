import { Invoice, CompanyProfile } from '../types';

/**
 * Downloads a string content as a file from the browser
 */
export const downloadFile = (filename: string, content: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates a Simplified AGT-compliant XML structure for an Invoice
 */
export const generateInvoiceXML = (invoice: Invoice, company: CompanyProfile): string => {
  const itemsXml = invoice.items.map((item, index) => `
        <Line>
          <LineNumber>${index + 1}</LineNumber>
          <ProductCode>${item.id}</ProductCode>
          <ProductDescription>${item.description}</ProductDescription>
          <Quantity>${item.quantity}</Quantity>
          <UnitOfMeasure>UN</UnitOfMeasure>
          <UnitPrice>${item.unitPrice.toFixed(2)}</UnitPrice>
          <TaxPointDate>${invoice.date.split('T')[0]}</TaxPointDate>
          <Description>${item.description}</Description>
          <CreditAmount>${item.total.toFixed(2)}</CreditAmount>
          <Tax>
            <TaxType>IVA</TaxType>
            <TaxCountryRegion>AO</TaxCountryRegion>
            <TaxCode>${item.taxRate === 14 ? 'NOR' : item.taxRate === 0 ? 'ISE' : 'RED'}</TaxCode>
            <TaxPercentage>${item.taxRate}</TaxPercentage>
          </Tax>
          ${item.taxRate === 0 ? `<TaxExemptionReason>${item.exemptionReason || 'Isento Artigo 12.º alínea a)'}</TaxExemptionReason>` : ''}
          <SettlementAmount>0.00</SettlementAmount>
        </Line>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.01_01">
  <Header>
    <AuditFileVersion>1.01_01</AuditFileVersion>
    <CompanyID>${company.nif}</CompanyID>
    <TaxRegistrationNumber>${company.nif}</TaxRegistrationNumber>
    <TaxAccountingBasis>F</TaxAccountingBasis>
    <CompanyName>${company.name}</CompanyName>
    <BusinessName>AFACTURA</BusinessName>
    <CompanyAddress>
      <AddressDetail>${company.address}</AddressDetail>
      <City>Luanda</City>
      <Country>AO</Country>
    </CompanyAddress>
    <FiscalYear>${new Date(invoice.date).getFullYear()}</FiscalYear>
    <StartDate>${invoice.date.split('T')[0]}</StartDate>
    <EndDate>${invoice.date.split('T')[0]}</EndDate>
    <CurrencyCode>AOA</CurrencyCode>
  </Header>
  <SourceDocuments>
    <SalesInvoices>
      <Invoice>
        <InvoiceNo>${invoice.series}/${invoice.number}</InvoiceNo>
        <DocumentStatus>
          <InvoiceStatus>${invoice.status === 'Anulada' ? 'A' : 'N'}</InvoiceStatus>
          <InvoiceStatusDate>${new Date().toISOString()}</InvoiceStatusDate>
          <SourceID>${invoice.auditTrail[0]?.user || 'System'}</SourceID>
          <SourceBilling>P</SourceBilling>
        </DocumentStatus>
        <Hash>${invoice.hash || '0'}</Hash>
        <HashControl>1</HashControl>
        <Period>${new Date(invoice.date).getMonth() + 1}</Period>
        <InvoiceDate>${invoice.date.split('T')[0]}</InvoiceDate>
        <InvoiceType>${invoice.type}</InvoiceType>
        <SourceID>${invoice.id}</SourceID>
        <SystemEntryDate>${new Date(invoice.date).toISOString()}</SystemEntryDate>
        <CustomerID>${invoice.clientId}</CustomerID>
        ${itemsXml}
        <DocumentTotals>
          <TaxPayable>${invoice.taxTotal.toFixed(2)}</TaxPayable>
          <NetTotal>${invoice.subtotal.toFixed(2)}</NetTotal>
          <GrossTotal>${invoice.total.toFixed(2)}</GrossTotal>
        </DocumentTotals>
      </Invoice>
    </SalesInvoices>
  </SourceDocuments>
</AuditFile>`;
};

/**
 * Generates a JSON structure for API submission or AI training
 */
export const generateInvoiceJSON = (invoice: Invoice, company: CompanyProfile): string => {
  const payload = {
    header: {
      auditFileVersion: "1.01_01",
      companyId: company.nif,
      companyName: company.name,
      invoiceNo: `${invoice.series}/${invoice.number}`,
      hash: invoice.hash || null,
      status: invoice.status,
      currency: invoice.currency
    },
    customer: {
      id: invoice.clientId,
      name: invoice.clientName,
      nif: invoice.clientNif,
      address: invoice.clientAddress
    },
    document: {
      type: invoice.type,
      date: invoice.date,
      dueDate: invoice.dueDate,
      paymentMethod: invoice.paymentMethod
    },
    lines: invoice.items.map((item, index) => ({
      lineNumber: index + 1,
      productCode: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      exemptionReason: item.exemptionReason,
      total: item.total
    })),
    totals: {
      taxPayable: invoice.taxTotal,
      netTotal: invoice.subtotal,
      grossTotal: invoice.total
    },
    audit: {
      createdAt: invoice.auditTrail[0]?.timestamp || new Date().toISOString(),
      source: "AFACTURA Web"
    }
  };

  return JSON.stringify(payload, null, 2);
};