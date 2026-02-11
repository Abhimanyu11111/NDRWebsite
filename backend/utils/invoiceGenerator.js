import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = async ({
  booking,
  user,
  room,
}) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const invoiceDir = path.join("invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

  const filePath = `${invoiceDir}/invoice_${booking.booking_id}.pdf`;
  doc.pipe(fs.createWriteStream(filePath));

  /* HEADER */
  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Invoice No: ${booking.booking_id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  /* CUSTOMER */
  doc.text(`Billed To: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.moveDown();

  /* BOOKING DETAILS */
  doc.text(`Room: ${room.title}`);
  doc.text(`Start: ${booking.start_datetime}`);
  doc.text(`End: ${booking.end_datetime}`);
  doc.moveDown();

  /* PRICE */
  const baseAmount = Number(booking.total_price);
  const gstRate = 18;
  const gstAmount = (baseAmount * gstRate) / 100;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const grandTotal = baseAmount + gstAmount;

  doc.text(`Base Amount: ₹${baseAmount.toFixed(2)}`);
  doc.text(`CGST (9%): ₹${cgst.toFixed(2)}`);
  doc.text(`SGST (9%): ₹${sgst.toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(14).text(`TOTAL: ₹${grandTotal.toFixed(2)}`, {
    underline: true,
  });

  doc.end();

  return filePath;
};