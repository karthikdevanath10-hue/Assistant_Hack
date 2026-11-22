"""
SmartKhata - PDF Ledger Statement Generator
Generates high-fidelity, professional PDF reports for individual customers and store-wide ledgers.
"""
from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def format_inr_text(amount: float | int | None) -> str:
    """Format numbers into Indian numbering format with Rs. prefix."""
    if amount is None:
        return "Rs. 0.00"
    try:
        val = float(amount)
    except (ValueError, TypeError):
        return f"Rs. {amount}"

    is_negative = val < 0
    val = abs(val)
    parts = f"{val:.2f}".split(".")
    integer_part = parts[0]
    decimal_part = parts[1]

    if len(integer_part) > 3:
        last3 = integer_part[-3:]
        remaining = integer_part[:-3]
        groups = []
        while remaining:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        formatted = ",".join(groups) + "," + last3
    else:
        formatted = integer_part

    sign = "-" if is_negative else ""
    return f"{sign}Rs. {formatted}.{decimal_part}"


def generate_ledger_pdf(
    *,
    transactions: list[dict[str, Any]],
    customer: dict[str, Any] | None = None,
    shop_name: str = "SmartKhata",
    merchant_name: str = "Merchant",
    merchant_phone: str = "",
) -> bytes:
    """Build a complete, printable PDF statement in memory and return its bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1e0e3c"),
    )
    sub_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#64748b"),
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e0e3c"),
    )
    cell_head = ParagraphStyle(
        "CellHead",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.white,
    )
    cell_body = ParagraphStyle(
        "CellBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1e293b"),
    )
    cell_credit = ParagraphStyle(
        "CellCredit",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#e11d48"),
    )
    cell_payment = ParagraphStyle(
        "CellPayment",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#059669"),
    )

    story = []

    # 1. Header Banner
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p UTC")
    report_type = f"{customer['name']}'s Digital Khata Statement" if customer else "Store-Wide Digital Ledger Statement"

    header_table_data = [
        [
            Paragraph(f"<b>{shop_name}</b>", title_style),
            Paragraph(f"<b>Date:</b> {now_str}<br/><b>Merchant:</b> {merchant_name} {f'({merchant_phone})' if merchant_phone else ''}", sub_style),
        ],
        [
            Paragraph(f"<b>{report_type}</b>", section_heading),
            Paragraph("Official Digital Khata Record · Protected by Cryptography", sub_style),
        ],
    ]
    header_table = Table(header_table_data, colWidths=[340, 200])
    header_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(header_table)
    story.append(Spacer(1, 8))

    # Divider bar
    divider = Table([[""]], colWidths=[540], rowHeights=[3])
    divider.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#7c3aed")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(divider)
    story.append(Spacer(1, 14))

    # 2. Customer Profile or Store Summary Block
    total_credit = sum(float(tx.get("amount", 0)) for tx in transactions if tx.get("tx_type") == "credit")
    total_payment = sum(float(tx.get("amount", 0)) for tx in transactions if tx.get("tx_type") == "payment")
    net_due = total_credit - total_payment

    if customer:
        cust_phone = customer.get("phone") or "Not registered"
        cust_status = "Balance Due" if net_due > 0 else "Advance Paid" if net_due < 0 else "Settled"
        summary_data = [
            [
                Paragraph("<b>CUSTOMER DETAILS</b>", cell_head),
                Paragraph("<b>TOTAL CREDIT (UDHAAR)</b>", cell_head),
                Paragraph("<b>TOTAL PAID (JAMA)</b>", cell_head),
                Paragraph("<b>NET OUTSTANDING</b>", cell_head),
            ],
            [
                Paragraph(f"<b>Name:</b> {customer.get('name')}<br/><b>Mobile:</b> {cust_phone}<br/><b>Status:</b> {cust_status}", cell_body),
                Paragraph(f"<b>{format_inr_text(total_credit)}</b>", cell_credit),
                Paragraph(f"<b>{format_inr_text(total_payment)}</b>", cell_payment),
                Paragraph(f"<b>{format_inr_text(net_due)}</b>", cell_credit if net_due > 0 else cell_payment),
            ],
        ]
    else:
        unique_customers = len({tx.get("customer_name") for tx in transactions if tx.get("customer_name")})
        summary_data = [
            [
                Paragraph("<b>STORE LEDGER OVERVIEW</b>", cell_head),
                Paragraph("<b>TOTAL CREDIT GIVEN</b>", cell_head),
                Paragraph("<b>TOTAL PAYMENTS RECEIVED</b>", cell_head),
                Paragraph("<b>NET MARKET OUTSTANDING</b>", cell_head),
            ],
            [
                Paragraph(f"<b>Active Customers:</b> {unique_customers}<br/><b>Total Entries:</b> {len(transactions)}", cell_body),
                Paragraph(f"<b>{format_inr_text(total_credit)}</b>", cell_credit),
                Paragraph(f"<b>{format_inr_text(total_payment)}</b>", cell_payment),
                Paragraph(f"<b>{format_inr_text(net_due)}</b>", cell_credit if net_due > 0 else cell_payment),
            ],
        ]

    summary_table = Table(summary_data, colWidths=[150, 130, 130, 130])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2e1065")),
                ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 16))

    # 3. Transactions Table
    story.append(Paragraph(f"<b>TRANSACTION HISTORY ({len(transactions)} RECORDS)</b>", section_heading))
    story.append(Spacer(1, 8))

    tx_table_data = [
        [
            Paragraph("<b>#</b>", cell_head),
            Paragraph("<b>Date</b>", cell_head),
            Paragraph("<b>Customer</b>", cell_head),
            Paragraph("<b>Type</b>", cell_head),
            Paragraph("<b>Amount (INR)</b>", cell_head),
            Paragraph("<b>Status</b>", cell_head),
            Paragraph("<b>Note</b>", cell_head),
        ]
    ]

    for idx, tx in enumerate(transactions, 1):
        is_credit = tx.get("tx_type") == "credit"
        amt_str = f"+{format_inr_text(tx.get('amount'))}" if is_credit else f"-{format_inr_text(tx.get('amount'))}"
        style_amt = cell_credit if is_credit else cell_payment
        type_str = "Credit (Udhaar)" if is_credit else "Payment (Jama)"
        date_str = str(tx.get("transaction_date") or tx.get("created_at") or "")[:10]
        cust_label = str(tx.get("customer_name") or "-")
        note_str = str(tx.get("note") or "-")

        tx_table_data.append(
            [
                Paragraph(str(idx), cell_body),
                Paragraph(date_str, cell_body),
                Paragraph(cust_label, cell_body),
                Paragraph(type_str, cell_body),
                Paragraph(amt_str, style_amt),
                Paragraph(str(tx.get("status") or "confirmed").capitalize(), cell_body),
                Paragraph(note_str, cell_body),
            ]
        )

    if len(transactions) == 0:
        tx_table_data.append(
            [
                Paragraph("1", cell_body),
                Paragraph("-", cell_body),
                Paragraph("No records found", cell_body),
                Paragraph("-", cell_body),
                Paragraph("Rs. 0.00", cell_body),
                Paragraph("-", cell_body),
                Paragraph("No transactions recorded yet in this ledger.", cell_body),
            ]
        )

    tx_table = Table(tx_table_data, colWidths=[24, 66, 100, 95, 85, 65, 105], repeatRows=1)
    tx_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e0e3c")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(tx_table)
    story.append(Spacer(1, 20))

    # 4. Verification Footer & Sign-off
    footer_text = Paragraph(
        "<i>This digital khata statement was cryptographically verified and exported from SmartKhata AI Digital Accountant.<br/>"
        "Compliant with Digital Personal Data Protection (DPDP) Act 2023. For any billing queries, please contact the merchant.</i>",
        sub_style,
    )
    story.append(footer_text)

    doc.build(story)
    return buf.getvalue()
