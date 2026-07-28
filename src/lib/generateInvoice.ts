import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order: any) => {
  const doc = new jsPDF();

  // Company / Store Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Order ID: #${order._id}`, 14, 28);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 34);

  // Customer Details Box
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Billed To:", 14, 46);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Email: ${order.customerEmail || "N/A"}`, 14, 52);
  if (order.shippingAddress) {
    const addr = order.shippingAddress;
    doc.text(`Name: ${addr.fullName || "N/A"}`, 14, 58);
    doc.text(`Address: ${addr.address || ""}, ${addr.city || ""}`, 14, 64);
    doc.text(`Phone: ${addr.phone || "N/A"}`, 14, 70);
  }

  // Payment Status
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Method: ${(order.paymentMethod || "COD").toUpperCase()}`, 130, 52);
  doc.text(`Payment Status: ${(order.paymentStatus || "pending").toUpperCase()}`, 130, 58);

  // Table Items
  const tableData = (order.items || []).map((item: any, index: number) => [
    index + 1,
    item.name || item.product?.name || "Product Item",
    item.quantity,
    `$${(item.price || 0).toFixed(2)}`,
    `$${((item.price || 0) * item.quantity).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 78,
    head: [["#", "Item Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] }, // Indigo color
  });

  // Total Amount Calculation
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount: $${(order.totalAmount || 0).toFixed(2)}`, 140, finalY);

  // Download PDF
  doc.save(`Invoice_${order._id.slice(-8)}.pdf`);
};