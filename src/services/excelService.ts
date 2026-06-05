import ExcelJS from 'exceljs';
import { FilterQuery } from 'mongoose';
import Product, { IProductDocument } from '../models/Product';
import Order, { IOrderDocument, IOrderItem } from '../models/Order';

type PopulatedOrder = Omit<IOrderDocument, 'user'> & {
  user?: {
    name: string;
    email: string;
  };
};

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a5f' } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const ALT_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
};

const addTitleRow = (sheet: ExcelJS.Worksheet, title: string, colCount: number) => {
  const titleRow = sheet.addRow([title]);
  titleRow.font = { bold: true, size: 14, color: { argb: 'FF1e3a5f' } };
  sheet.mergeCells(`A1:${String.fromCharCode(64 + colCount)}1`);
  titleRow.height = 30;
  titleRow.alignment = { vertical: 'middle' };

  const dateRow = sheet.addRow([`Generated: ${new Date().toLocaleString('en-IN')}`]);
  dateRow.font = { size: 10, color: { argb: 'FF6B7280' } };
  sheet.mergeCells(`A2:${String.fromCharCode(64 + colCount)}2`);
  sheet.addRow([]);
};

const styleHeaderRow = (row: ExcelJS.Row) => {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER;
  });
  row.height = 25;
};

const styleDataRow = (row: ExcelJS.Row, isAlt: boolean) => {
  row.eachCell((cell) => {
    if (isAlt) cell.fill = ALT_FILL;
    cell.border = BORDER;
    cell.alignment = { vertical: 'middle' };
  });
};

export const generateInventoryReport = async (): Promise<ExcelJS.Buffer> => {
  const products = await Product.find({ isActive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = process.env.SHOP_NAME || 'Jaipur Shop';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Inventory Report');

  const columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Product Name', key: 'name', width: 30 },
    { header: 'Current Stock', key: 'stock', width: 15 },
    { header: 'Unit', key: 'unit', width: 10 },
    { header: 'Low Stock Threshold', key: 'threshold', width: 20 },
    { header: 'Cost Price (₹)', key: 'costPrice', width: 15 },
    { header: 'Selling Price (₹)', key: 'price', width: 16 },
    { header: 'Stock Value (₹)', key: 'value', width: 16 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  addTitleRow(sheet, `${process.env.SHOP_NAME || 'Jaipur Shop'} - Inventory Report`, columns.length);

  sheet.columns = columns;
  const headerRow = sheet.getRow(4);
  headerRow.values = columns.map((c) => c.header);
  styleHeaderRow(headerRow);
  sheet.views = [{ state: 'frozen', ySplit: 4 }];

  products.forEach((p: IProductDocument, i: number) => {
    const row = sheet.addRow({
      sku: p.sku,
      name: p.name,
      stock: p.stock,
      unit: p.unit,
      threshold: p.lowStockThreshold,
      costPrice: p.costPrice,
      price: p.price,
      value: p.stock * p.costPrice,
      status: p.stock <= p.lowStockThreshold ? 'LOW STOCK' : 'Normal',
    });

    styleDataRow(row, i % 2 === 0);

    // Highlight low stock in red
    if (p.stock <= p.lowStockThreshold) {
      const statusCell = row.getCell('status');
      statusCell.font = { bold: true, color: { argb: 'FFDC2626' } };
    }

    ['costPrice', 'price', 'value'].forEach((key) => {
      row.getCell(key).numFmt = '₹#,##0.00';
    });
  });

  // Summary row
  sheet.addRow([]);
  const summaryRow = sheet.addRow(['TOTAL', '', '', '', '', '', '', '', { formula: `SUM(I5:I${products.length + 4})` }, '']);
  summaryRow.font = { bold: true };
  summaryRow.getCell('value').numFmt = '₹#,##0.00';

  return workbook.xlsx.writeBuffer() as Promise<ExcelJS.Buffer>;
};

export const generateOrdersReport = async (startDate?: string, endDate?: string): Promise<ExcelJS.Buffer> => {
  const query: FilterQuery<IOrderDocument> = {};
  if (startDate || endDate) {
    query.createdAt = {};
    const createdAtQuery = query.createdAt as Record<string, Date>;
    if (startDate) createdAtQuery.$gte = new Date(startDate);
    if (endDate) createdAtQuery.$lte = new Date(endDate);
  }

  const orders = (await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 })) as unknown as PopulatedOrder[];

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Orders Report');

  const columns = [
    { header: 'Invoice No.', key: 'invoice', width: 18 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Customer', key: 'customer', width: 25 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Items', key: 'items', width: 8 },
    { header: 'Subtotal (₹)', key: 'subtotal', width: 14 },
    { header: 'Tax (₹)', key: 'tax', width: 12 },
    { header: 'Total (₹)', key: 'total', width: 14 },
    { header: 'Payment Method', key: 'payment', width: 16 },
    { header: 'Payment Status', key: 'payStatus', width: 16 },
    { header: 'Order Status', key: 'status', width: 14 },
  ];

  addTitleRow(sheet, `${process.env.SHOP_NAME || 'Jaipur Shop'} - Orders Report`, columns.length);

  sheet.columns = columns;
  const headerRow = sheet.getRow(4);
  headerRow.values = columns.map((c) => c.header);
  styleHeaderRow(headerRow);

  orders.forEach((o: PopulatedOrder, i: number) => {
    const row = sheet.addRow({
      invoice: o.invoiceNumber,
      date: new Date(o.createdAt).toLocaleDateString('en-IN'),
      customer: o.user?.name || 'N/A',
      email: o.user?.email || 'N/A',
      items: o.items.reduce((sum: number, item: IOrderItem) => sum + item.quantity, 0),
      subtotal: o.subtotal,
      tax: o.tax,
      total: o.total,
      payment: o.paymentMethod.toUpperCase(),
      payStatus: o.paymentStatus.toUpperCase(),
      status: o.status.toUpperCase(),
    });
    styleDataRow(row, i % 2 === 0);
    ['subtotal', 'tax', 'total'].forEach((k) => (row.getCell(k).numFmt = '₹#,##0.00'));
  });

  return workbook.xlsx.writeBuffer() as Promise<ExcelJS.Buffer>;
};
