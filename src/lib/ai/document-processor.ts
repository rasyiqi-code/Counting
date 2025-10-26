import { z } from 'zod';

export interface DocumentAnalysisResult {
  type: 'invoice' | 'receipt' | 'bill' | 'payment' | 'unknown';
  confidence: number;
  extractedData: {
    vendor?: string;
    customer?: string;
    date?: string;
    total?: number;
    items?: Array<{
      description: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    tax?: number;
    reference?: string;
    description?: string;
  };
  suggestions: string[];
  errors: string[];
}

export interface ImageAnalysisResult {
  text: string;
  confidence: number;
  boundingBoxes: Array<{
    text: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export class AIDocumentProcessor {
  private static readonly DOCUMENT_TYPES = {
    invoice: ['invoice', 'tagihan', 'faktur', 'bill'],
    receipt: ['receipt', 'kwitansi', 'struk', 'nota'],
    bill: ['bill', 'tagihan', 'hutang', 'utang'],
    payment: ['payment', 'pembayaran', 'transfer', 'bayar']
  };

  private static readonly ACCOUNTING_KEYWORDS = {
    vendor: ['vendor', 'supplier', 'pemasok', 'penjual'],
    customer: ['customer', 'pelanggan', 'pembeli', 'buyer'],
    total: ['total', 'jumlah', 'sum', 'grand total'],
    tax: ['tax', 'pajak', 'ppn', 'vat'],
    date: ['date', 'tanggal', 'tgl', 'date:'],
    reference: ['ref', 'reference', 'no', 'nomor', 'invoice no']
  };

  static async analyzeDocument(imageData: string, text?: string): Promise<DocumentAnalysisResult> {
    try {
      // If text is provided, use it directly
      if (text) {
        return this.analyzeText(text);
      }

      // For image data, we would typically use OCR here
      // For now, we'll simulate OCR extraction
      const extractedText = await this.extractTextFromImage(imageData);
      return this.analyzeText(extractedText);
    } catch (error) {
      console.error('Error analyzing document:', error);
      return {
        type: 'unknown',
        confidence: 0,
        extractedData: {},
        suggestions: ['Gagal menganalisis dokumen. Pastikan gambar jelas dan tidak blur.'],
        errors: ['Failed to analyze document']
      };
    }
  }

  private static async extractTextFromImage(imageData: string): Promise<string> {
    // This would typically use OCR service like Tesseract, Google Vision, or Azure Computer Vision
    // For now, we'll return a mock extraction
    return `
      INVOICE
      No: INV-2024-001
      Date: 15/01/2024
      
      To: PT ABC Company
      Address: Jl. Sudirman No. 123
      
      Description: Konsultasi IT
      Quantity: 1
      Price: Rp 5,000,000
      Total: Rp 5,000,000
      
      Tax (11%): Rp 550,000
      Grand Total: Rp 5,550,000
    `;
  }

  private static analyzeText(text: string): DocumentAnalysisResult {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let type: 'invoice' | 'receipt' | 'bill' | 'payment' | 'unknown' = 'unknown';
    let confidence = 0;
    const extractedData: any = {};
    const suggestions: string[] = [];
    const errors: string[] = [];

    // Determine document type
    const textLower = text.toLowerCase();
    for (const [docType, keywords] of Object.entries(this.DOCUMENT_TYPES)) {
      const matches = keywords.filter(keyword => textLower.includes(keyword));
      if (matches.length > 0) {
        type = docType as any;
        confidence += matches.length * 0.2;
        break;
      }
    }

    // Extract vendor/customer information
    const vendorMatch = this.extractVendorCustomer(text, 'vendor');
    if (vendorMatch) {
      extractedData.vendor = vendorMatch;
      confidence += 0.2;
    }

    const customerMatch = this.extractVendorCustomer(text, 'customer');
    if (customerMatch) {
      extractedData.customer = customerMatch;
      confidence += 0.2;
    }

    // Extract date
    const dateMatch = this.extractDate(text);
    if (dateMatch) {
      extractedData.date = dateMatch;
      confidence += 0.1;
    }

    // Extract total amount
    const totalMatch = this.extractTotal(text);
    if (totalMatch) {
      extractedData.total = totalMatch;
      confidence += 0.2;
    }

    // Extract tax
    const taxMatch = this.extractTax(text);
    if (taxMatch) {
      extractedData.tax = taxMatch;
      confidence += 0.1;
    }

    // Extract reference number
    const refMatch = this.extractReference(text);
    if (refMatch) {
      extractedData.reference = refMatch;
      confidence += 0.1;
    }

    // Extract items
    const items = this.extractItems(text);
    if (items.length > 0) {
      extractedData.items = items;
      confidence += 0.2;
    }

    // Generate suggestions based on extracted data
    if (!extractedData.vendor && !extractedData.customer) {
      suggestions.push('Pastikan nama vendor/customer terlihat jelas dalam dokumen');
    }

    if (!extractedData.total) {
      suggestions.push('Pastikan total amount terlihat jelas dalam dokumen');
    }

    if (!extractedData.date) {
      suggestions.push('Pastikan tanggal dokumen terlihat jelas');
    }

    if (extractedData.total && extractedData.tax) {
      const calculatedTax = extractedData.total * 0.11;
      if (Math.abs(extractedData.tax - calculatedTax) > 1000) {
        suggestions.push('Periksa perhitungan PPN (11%) pada dokumen');
      }
    }

    // Generate accounting suggestions
    if (type === 'invoice' && extractedData.vendor) {
      suggestions.push('Dokumen ini sepertinya invoice dari vendor. Apakah ingin membuat Purchase Bill?');
    }

    if (type === 'receipt' && extractedData.customer) {
      suggestions.push('Dokumen ini sepertinya receipt penjualan. Apakah ingin membuat Sales Invoice?');
    }
    
    return {
      type,
      confidence: Math.min(confidence, 1),
      extractedData,
      suggestions,
      errors
    };
  }

  private static extractVendorCustomer(text: string, type: 'vendor' | 'customer'): string | null {
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      
      if (type === 'vendor') {
        if (lineLower.includes('from:') || lineLower.includes('vendor:') || lineLower.includes('supplier:')) {
          return line.replace(/^(from|vendor|supplier):\s*/i, '').trim();
        }
      } else {
        if (lineLower.includes('to:') || lineLower.includes('customer:') || lineLower.includes('bill to:')) {
          return line.replace(/^(to|customer|bill to):\s*/i, '').trim();
        }
      }
    }

    return null;
  }

  private static extractDate(text: string): string | null {
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g;
    const matches = text.match(dateRegex);
    
    if (matches && matches.length > 0) {
      return matches[0];
    }

    return null;
  }

  private static extractTotal(text: string): number | null {
    const totalRegex = /(?:total|grand total|jumlah|sum):\s*Rp\s*([\d.,]+)/gi;
    const matches = text.match(totalRegex);
    
    if (matches && matches.length > 0) {
      const amount = matches[0].replace(/[^\d.,]/g, '').replace(',', '');
      return parseFloat(amount);
    }

    // Try to find any large number that might be total
    const numberRegex = /Rp\s*([\d.,]+)/g;
    const numberMatches = text.match(numberRegex);
    
    if (numberMatches && numberMatches.length > 0) {
      const amounts = numberMatches.map(match => {
        const amount = match.replace(/[^\d.,]/g, '').replace(',', '');
        return parseFloat(amount);
      });
      
      // Return the largest amount (likely the total)
      return Math.max(...amounts);
    }

    return null;
  }

  private static extractTax(text: string): number | null {
    const taxRegex = /(?:tax|pajak|ppn|vat):\s*Rp\s*([\d.,]+)/gi;
    const matches = text.match(taxRegex);
    
    if (matches && matches.length > 0) {
      const amount = matches[0].replace(/[^\d.,]/g, '').replace(',', '');
      return parseFloat(amount);
    }

    return null;
  }

  private static extractReference(text: string): string | null {
    const refRegex = /(?:ref|reference|no|nomor|invoice no):\s*([A-Z0-9\-]+)/gi;
    const matches = text.match(refRegex);
    
    if (matches && matches.length > 0) {
      return matches[0].replace(/^(ref|reference|no|nomor|invoice no):\s*/i, '').trim();
    }

    return null;
  }

  private static extractItems(text: string): Array<{description: string; quantity: number; price: number; total: number}> {
    const items: Array<{description: string; quantity: number; price: number; total: number}> = [];
    const lines = text.split('\n');
    
    let inItemsSection = false;
    
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      
      if (lineLower.includes('description') || lineLower.includes('item') || lineLower.includes('product')) {
        inItemsSection = true;
        continue;
      }
      
      if (inItemsSection) {
        // Look for lines that contain item information
        const itemRegex = /(.+?)\s+(\d+)\s+Rp\s*([\d.,]+)\s+Rp\s*([\d.,]+)/;
        const match = line.match(itemRegex);
        
        if (match) {
          items.push({
            description: match[1].trim(),
            quantity: parseInt(match[2]),
            price: parseFloat(match[3].replace(',', '')),
            total: parseFloat(match[4].replace(',', ''))
          });
        }
      }
    }
    
    return items;
  }

  static async processDocumentForAccounting(
    documentResult: DocumentAnalysisResult,
    companyId: string,
    module: string
  ): Promise<{
    operation: string;
    data: any;
    suggestions: string[];
  }> {
    const suggestions: string[] = [];
    let operation = '';
    let data: any = {};

    switch (documentResult.type) {
        case 'invoice':
        if (documentResult.extractedData.vendor) {
          operation = 'create_purchase_bill';
          data = {
            vendorName: documentResult.extractedData.vendor,
            date: documentResult.extractedData.date,
            total: documentResult.extractedData.total,
            tax: documentResult.extractedData.tax,
            reference: documentResult.extractedData.reference,
            description: `Pembelian dari ${documentResult.extractedData.vendor}`,
            items: documentResult.extractedData.items || []
          };
          suggestions.push('Dokumen ini akan diproses sebagai Purchase Bill');
        }
          break;
          
        case 'receipt':
        if (documentResult.extractedData.customer) {
          operation = 'create_sales_invoice';
          data = {
            customerName: documentResult.extractedData.customer,
            date: documentResult.extractedData.date,
            total: documentResult.extractedData.total,
            tax: documentResult.extractedData.tax,
            reference: documentResult.extractedData.reference,
            description: `Penjualan ke ${documentResult.extractedData.customer}`,
            items: documentResult.extractedData.items || []
          };
          suggestions.push('Dokumen ini akan diproses sebagai Sales Invoice');
        }
          break;
          
        case 'bill':
        operation = 'create_purchase_bill';
        data = {
          vendorName: documentResult.extractedData.vendor || 'Unknown Vendor',
          date: documentResult.extractedData.date,
          total: documentResult.extractedData.total,
          tax: documentResult.extractedData.tax,
          reference: documentResult.extractedData.reference,
          description: documentResult.extractedData.description || 'Purchase Bill',
          items: documentResult.extractedData.items || []
        };
        suggestions.push('Dokumen ini akan diproses sebagai Purchase Bill');
        break;

      case 'payment':
        operation = 'create_payment';
        data = {
          amount: documentResult.extractedData.total,
          date: documentResult.extractedData.date,
          reference: documentResult.extractedData.reference,
          description: documentResult.extractedData.description || 'Payment',
          type: 'PAYMENT'
        };
        suggestions.push('Dokumen ini akan diproses sebagai Payment');
          break;

      default:
        suggestions.push('Tipe dokumen tidak dikenali. Silakan pilih operasi manual.');
      }
      
      return {
      operation,
      data,
      suggestions
    };
  }
}