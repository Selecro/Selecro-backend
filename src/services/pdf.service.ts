import PDFDocument from 'pdfkit';

// Define interfaces for the data that will be used to create the invoice.
// This provides strong typing and makes the code more maintainable.
export interface InvoiceItem {
  item: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CustomerDetails {
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  customer: CustomerDetails;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  total: number;
}

// A more robust way to get the type of a class instance from its value.
// This prevents the 'used as a type' error by deriving the type directly.
type PDFKitDocument = InstanceType<typeof PDFDocument>;

/**
 * A service for generating PDF documents, such as invoices and reports.
 * It uses pdfkit for powerful, low-level PDF creation.
 */
export class PdfService {

  constructor() { }

  /**
   * Creates a PDF invoice from the provided data and returns it as a Buffer.
   *
   * @param data The structured invoice data.
   * @returns A Promise that resolves with the PDF as a Buffer.
   */
  public async createInvoice(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document instance with standard settings
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        // Use a stream to capture the PDF output into a buffer
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // Build the document content using helper methods
        this.generateHeader(doc, data);
        this.generateCustomerInformation(doc, data.customer);
        this.generateInvoiceTable(doc, data.items);
        this.generateFooter(doc);

        // Finalize the PDF and end the stream
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generates the header section of the invoice.
   * @param doc The PDF document instance.
   * @param data The invoice data.
   */
  private generateHeader(doc: PDFKitDocument, data: InvoiceData): void {
    doc
      .fontSize(20)
      .text('INVOICE', {
        align: 'center'
      })
      .moveDown()
      .fontSize(10)
      .text(`Invoice Number: ${data.invoiceNumber}`, {
        align: 'right'
      })
      .text(`Date: ${new Date().toLocaleDateString()}`, {
        align: 'right'
      })
      .moveDown();
  }

  /**
   * Generates the customer information section.
   * @param doc The PDF document instance.
   * @param customer The customer details.
   */
  private generateCustomerInformation(doc: PDFKitDocument, customer: CustomerDetails): void {
    doc
      .fontSize(12)
      .text('Bill To:', 50, doc.y)
      .moveDown()
      .text(customer.name)
      .text(customer.address)
      .text(`${customer.city}, ${customer.country}`)
      .moveDown();
  }

  /**
   * Generates the table of invoice items.
   * @param doc The PDF document instance.
   * @param items The list of invoice items.
   */
  private generateInvoiceTable(doc: PDFKitDocument, items: InvoiceItem[]): void {
    const tableTop = doc.y + 20;
    const itemX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 420;
    const totalX = 500;

    // Table header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Item', itemX)
      .text('Description', descriptionX)
      .text('Quantity', quantityX, undefined, {
        width: 90,
        align: 'right'
      })
      .text('Price', priceX, undefined, {
        width: 60,
        align: 'right'
      })
      .text('Total', totalX, undefined, {
        width: 50,
        align: 'right'
      });

    // Draw a line to separate the header
    doc.strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();

    // Table rows
    let y = tableTop + 35;
    doc.font('Helvetica');
    for (const item of items) {
      doc
        .text(item.item, itemX, y)
        .text(item.description, descriptionX, y)
        .text(item.quantity.toString(), quantityX, y, {
          width: 90,
          align: 'right'
        })
        .text(item.price.toFixed(2), priceX, y, {
          width: 60,
          align: 'right'
        })
        .text((item.quantity * item.price).toFixed(2), totalX, y, {
          width: 50,
          align: 'right'
        });
      y += 20;
    }

    doc.moveDown();
  }

  /**
   * Generates the footer section of the invoice.
   * @param doc The PDF document instance.
   */
  private generateFooter(doc: PDFKitDocument): void {
    doc.moveDown();
    doc
      .fontSize(10)
      .text(
        'Thank you for your business!',
        50,
        doc.page.height - 50, {
        align: 'center'
      });
  }
}
