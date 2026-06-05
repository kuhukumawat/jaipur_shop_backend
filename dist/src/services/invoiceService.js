"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceHTML = void 0;
const escapeHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
const generateInvoiceHTML = (order) => {
  const shopName = process.env.SHOP_NAME || 'Jaipur Shop';
  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
  const itemsHTML = order.items
    .map((item, i) => `
      <tr class="${i % 2 === 0 ? 'alt-row' : ''}">
        <td class="center">${i + 1}</td>
        <td>
          <strong>${escapeHtml(item.name)}</strong>
        </td>
        <td class="center">${item.quantity}</td>
        <td class="right">${formatCurrency(item.price)}</td>
        <td class="right">${formatCurrency(item.subtotal)}</td>
      </tr>`)
    .join('');
  const address = order.shippingAddress
    ? [
      order.shippingAddress.street,
      order.shippingAddress.city,
      order.shippingAddress.state,
      order.shippingAddress.pincode,
    ]
      .filter(Boolean)
      .join(', ')
    : 'N/A';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${order.invoiceNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1f2937; background: #fff; }
  .invoice-wrap { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #1e3a5f; }
  .shop-name { font-size: 28px; font-weight: 800; color: #1e3a5f; letter-spacing: -0.5px; }
  .shop-tagline { color: #6b7280; font-size: 12px; margin-top: 4px; }
  .invoice-title { text-align: right; }
  .invoice-title h2 { font-size: 24px; font-weight: 700; color: #1e3a5f; }
  .invoice-title .inv-number { font-size: 15px; color: #4f46e5; font-weight: 600; margin-top: 4px; }
  .invoice-title .inv-date { color: #6b7280; font-size: 12px; margin-top: 4px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .meta-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
  .meta-box h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 8px; }
  .meta-box p { font-size: 13px; color: #1f2937; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #1e3a5f; color: white; }
  thead th { padding: 12px 14px; text-align: left; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }
  tbody td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
  .alt-row td { background: #f9fafb; }
  .center { text-align: center; }
  .right { text-align: right; }
  .muted { color: #9ca3af; font-size: 11px; }
  .totals-table { margin-left: auto; width: 280px; }
  .totals-table td { padding: 8px 14px; }
  .totals-table .label { color: #6b7280; }
  .totals-table .grand-total td { border-top: 2px solid #1e3a5f; font-size: 16px; font-weight: 700; color: #1e3a5f; padding-top: 12px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  .badge-paid { background: #d1fae5; color: #065f46; }
  .badge-delivered { background: #d1fae5; color: #065f46; }
  .badge-shipped { background: #dbeafe; color: #1e40af; }
  .badge-cancelled { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; color: #9ca3af; font-size: 11px; }
  .print-btn { position: fixed; top: 20px; right: 20px; background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
  @media print {
    .print-btn { display: none; }
    .invoice-wrap { padding: 20px; }
    body { font-size: 12px; }
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
<div class="invoice-wrap">
  <div class="header">
    <div>
      <div class="shop-name">${shopName}</div>
      <div class="shop-tagline">Your trusted shopping destination</div>
    </div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <div class="inv-number"># ${order.invoiceNumber}</div>
      <div class="inv-date">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <h4>Bill To</h4>
      <p>
        <strong>${escapeHtml(order.user?.name || 'Customer')}</strong><br>
        ${escapeHtml(order.user?.email || '')}<br>
        ${order.user?.phone ? `📞 ${escapeHtml(order.user.phone)}<br>` : ''}
        ${address}
      </p>
    </div>
    <div class="meta-box">
      <h4>Order Info</h4>
      <p>
        <strong>Invoice No:</strong> ${order.invoiceNumber}<br>
        <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}<br>
        <strong>Payment:</strong> ${order.paymentMethod?.toUpperCase()}<br>
        <strong>Status:</strong> <span class="badge badge-${order.paymentStatus}">${order.paymentStatus}</span>
      </p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px">#</th>
        <th>Product</th>
        <th class="center" style="width:80px">Qty</th>
        <th class="right" style="width:120px">Unit Price</th>
        <th class="right" style="width:120px">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <table class="totals-table">
    <tbody>
      <tr>
        <td class="label">Subtotal</td>
        <td class="right">${formatCurrency(order.subtotal)}</td>
      </tr>
      ${order.discount > 0 ? `<tr><td class="label">Discount</td><td class="right" style="color:#059669">- ${formatCurrency(order.discount)}</td></tr>` : ''}
      <tr>
        <td class="label">GST (18%)</td>
        <td class="right">${formatCurrency(order.tax)}</td>
      </tr>
      <tr class="grand-total">
        <td><strong>Grand Total</strong></td>
        <td class="right"><strong>${formatCurrency(order.total)}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>Thank you for shopping with ${shopName}!</span>
    <span>This is a computer-generated invoice.</span>
  </div>
</div>
</body>
</html>`;
};
exports.generateInvoiceHTML = generateInvoiceHTML;
