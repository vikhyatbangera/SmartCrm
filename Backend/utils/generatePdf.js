import PDFDocument from "pdfkit";
import fs from "fs";

export const generateQuotationPDF = (quotation, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    
    stream.on('finish', () => {
      resolve();
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
    
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("QUOTATION", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Quotation #: ${quotation._id}`, { align: "center" })
      .moveDown(1);

    // Client Information
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Client Information:", { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Client Name: ${quotation.clientName}`)
      .text(`Email: ${quotation.clientEmail}`);

    if (quotation.lead) {
      doc.text(`Company: ${quotation.lead.company || "N/A"}`);
    }

    doc.moveDown(1);

    // Products Table Header
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Product Details", { underline: true })
      .moveDown(0.5);

    // Table Headers
    let yPos = doc.y;
    const pageWidth = doc.page.width;
    const colWidths = [200, 80, 100, 100, 100];
    const headers = ["Product", "Quantity", "Price", "Discount", "Total"];

    doc.font("Helvetica-Bold");
    headers.forEach((header, i) => {
      const x = 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(header, x, yPos, { width: colWidths[i], align: "left" });
    });

    yPos += 20;
    doc.moveTo(40, yPos - 10).lineTo(pageWidth - 40, yPos - 10).stroke();

    // Table Rows
    doc.font("Helvetica");
    quotation.products.forEach((item) => {
      doc.text(item.productName || item.name, 40, yPos, { width: colWidths[0] });
      doc.text(String(item.quantity), 40 + colWidths[0], yPos, { width: colWidths[1] });
      doc.text(`₹${item.price}`, 40 + colWidths[0] + colWidths[1], yPos, { width: colWidths[2] });
      doc.text(`₹${item.discount || 0}`, 40 + colWidths[0] + colWidths[1] + colWidths[2], yPos, { width: colWidths[3] });
      doc.text(`₹${item.total}`, 40 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos, { width: colWidths[4] });
      yPos += 20;
    });

    yPos += 10;
    doc.moveTo(40, yPos - 10).lineTo(pageWidth - 40, yPos - 10).stroke();
    yPos += 15;

    // Summary Section
    doc.font("Helvetica");
    const summaryX = pageWidth - 250;
    
    doc.text(`Subtotal:`, summaryX, yPos, { width: 150, align: "right" });
    doc.text(`₹${quotation.subtotal.toFixed(2)}`, summaryX + 150, yPos, { width: 100 });
    yPos += 20;

    doc.text(`Tax:`, summaryX, yPos, { width: 150, align: "right" });
    doc.text(`₹${quotation.tax.toFixed(2)}`, summaryX + 150, yPos, { width: 100 });
    yPos += 20;

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(`Grand Total:`, summaryX, yPos, { width: 150, align: "right" });
    doc
      .fontSize(13)
      .text(`₹${quotation.grandTotal.toFixed(2)}`, summaryX + 150, yPos, { width: 100 });

    yPos += 40;

    // Payment Terms
    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text(`Payment Terms: ${quotation.paymentTerms || "Net 30"}`, 40, yPos)
      .text(`Validity: ${quotation.validityDays || 30} days`, 40, yPos + 15);

    // Footer
    const footerY = doc.page.height - 40;
    doc
      .fontSize(9)
      .font("Helvetica")
      .text("Thank you for your business!", 40, footerY, { align: "center", width: pageWidth - 80 });

    doc.end();
  });
};