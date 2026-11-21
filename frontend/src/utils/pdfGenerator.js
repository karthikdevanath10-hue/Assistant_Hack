import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatINR } from "./numberNormalizer";

/**
 * Generate and download a high-fidelity PDF Ledger Statement directly in the browser.
 */
export function generateClientLedgerPdf({
  customer = null,
  transactions = [],
  currentUser = null,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const shopName = currentUser?.shop_name || currentUser?.name || "Voice Khata";
  const merchantName = currentUser?.name || "Merchant";
  const merchantPhone = currentUser?.phone || "";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 1. Header Banner
  doc.setFillColor(30, 14, 60); // Dark Cosmic Purple (#1e0e3c)
  doc.rect(0, 0, 210, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(shopName, 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(216, 180, 254); // Purple tint
  const subtitle = customer
    ? `${customer.name}'s Digital Khata Statement`
    : "Store-Wide Digital Ledger Statement";
  doc.text(subtitle, 14, 21);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${dateStr}`, 14, 27);

  if (merchantName) {
    const merchantInfo = `Merchant: ${merchantName} ${merchantPhone ? `(${merchantPhone})` : ""}`;
    doc.text(merchantInfo, 196, 27, { align: "right" });
  }

  // 2. Summary Block
  let y = 40;
  const safeTxs = Array.isArray(transactions) ? transactions : [];
  const totalCredit = safeTxs
    .filter((t) => t.tx_type === "credit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPaid = safeTxs
    .filter((t) => t.tx_type === "payment")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netDue = totalCredit - totalPaid;

  if (customer) {
    // Customer profile box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 24, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(customer.name, 18, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Mobile: ${customer.phone || "Not recorded"}`, 18, y + 14);

    const statusLabel =
      netDue > 0 ? "Balance Due (Udhaar)" : netDue < 0 ? "Advance Paid" : "Settled";
    doc.text(`Account Status: ${statusLabel}`, 18, y + 19);

    // Summary numbers on the right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(225, 29, 72); // Rose/red
    doc.text(`Total Credit: ${formatINR(totalCredit)}`, 130, y + 8);

    doc.setTextColor(5, 150, 105); // Green
    doc.text(`Total Paid: ${formatINR(totalPaid)}`, 130, y + 14);

    doc.setTextColor(netDue > 0 ? 225 : 5, netDue > 0 ? 29 : 150, netDue > 0 ? 72 : 105);
    doc.text(`Net Outstanding: ${formatINR(netDue)}`, 130, y + 19);

    y += 30;
  } else {
    // Store overview metrics box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 20, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(225, 29, 72);
    doc.text(`Total Udhaar Given: ${formatINR(totalCredit)}`, 18, y + 8);

    doc.setTextColor(5, 150, 105);
    doc.text(`Total Jama Received: ${formatINR(totalPaid)}`, 18, y + 15);

    doc.setTextColor(217, 119, 6);
    doc.text(`Net Market Due: ${formatINR(netDue)}`, 110, y + 8);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Recorded Entries: ${safeTxs.length}`, 110, y + 15);

    y += 26;
  }

  // 3. Transactions Table using autoTable
  const head = [["#", "Date", "Customer", "Type", "Amount", "Status", "Note"]];
  const body = safeTxs.map((t, idx) => {
    const isCredit = t.tx_type === "credit";
    const amt = isCredit ? `+${formatINR(t.amount)}` : `-${formatINR(t.amount)}`;
    const dateVal = String(t.transaction_date || t.created_at || "").slice(0, 10);
    return [
      idx + 1,
      dateVal || "-",
      t.customer_name || customer?.name || "-",
      isCredit ? "Credit (Udhaar)" : "Payment (Jama)",
      amt,
      String(t.status || "confirmed").toUpperCase(),
      t.note || "-",
    ];
  });

  if (body.length === 0) {
    body.push(["1", "-", customer?.name || "-", "-", "Rs. 0", "-", "No transactions recorded yet."]);
  }

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [46, 16, 101], // Deep purple
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 24 },
      2: { cellWidth: 38 },
      3: { cellWidth: 28 },
      4: { cellWidth: 26, fontStyle: "bold", halign: "right" },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: "auto" },
    },
    didParseCell: (data) => {
      // Highlight amount column with color
      if (data.section === "body" && data.column.index === 4) {
        const text = String(data.cell.raw || "");
        if (text.startsWith("+")) {
          data.cell.styles.textColor = [225, 29, 72]; // Rose/red
        } else if (text.startsWith("-")) {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald
        }
      }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageHeight = doc.internal.pageSize.height;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Generated by Voice Khata AI Digital Accountant · DPDP Act Compliant & Encrypted at Rest",
        14,
        pageHeight - 8
      );
      doc.text(
        `Page ${data.pageNumber}`,
        doc.internal.pageSize.width - 14,
        pageHeight - 8,
        { align: "right" }
      );
    },
  });

  const filePrefix = customer?.name
    ? `voice_khata_${customer.name.replace(/\s+/g, "_")}`
    : "voice_khata_statement";
  const fileName = `${filePrefix}_${now.toISOString().slice(0, 10)}.pdf`;

  doc.save(fileName);
}
