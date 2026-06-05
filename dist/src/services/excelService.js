"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrdersReport = exports.generateInventoryReport = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importDefault(require("../models/Order"));
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a5f' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const ALT_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
const BORDER = {
    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
};
const addTitleRow = (sheet, title, colCount) => {
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
const styleHeaderRow = (row) => {
    row.eachCell((cell) => {
        cell.fill = HEADER_FILL;
        cell.font = HEADER_FONT;
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = BORDER;
    });
    row.height = 25;
};
const styleDataRow = (row, isAlt) => {
    row.eachCell((cell) => {
        if (isAlt)
            cell.fill = ALT_FILL;
        cell.border = BORDER;
        cell.alignment = { vertical: 'middle' };
    });
};
const generateInventoryReport = async () => {
    const products = await Product_1.default.find({ isActive: true }).populate('category', 'name');
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = process.env.SHOP_NAME || 'Jaipur Shop';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Inventory Report');
    const columns = [
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Product Name', key: 'name', width: 30 },
        { header: 'Category', key: 'category', width: 18 },
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
    products.forEach((p, i) => {
        const row = sheet.addRow({
            sku: p.sku,
            name: p.name,
            category: p.category?.name || 'N/A',
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
    return workbook.xlsx.writeBuffer();
};
exports.generateInventoryReport = generateInventoryReport;
const generateOrdersReport = async (startDate, endDate) => {
    const query = {};
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate)
            query.createdAt.$gte = new Date(startDate);
        if (endDate)
            query.createdAt.$lte = new Date(endDate);
    }
    const orders = await Order_1.default.find(query).populate('user', 'name email').sort({ createdAt: -1 });
    const workbook = new exceljs_1.default.Workbook();
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
    orders.forEach((o, i) => {
        const row = sheet.addRow({
            invoice: o.invoiceNumber,
            date: new Date(o.createdAt).toLocaleDateString('en-IN'),
            customer: o.user?.name || 'N/A',
            email: o.user?.email || 'N/A',
            items: o.items.reduce((sum, item) => sum + item.quantity, 0),
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
    return workbook.xlsx.writeBuffer();
};
exports.generateOrdersReport = generateOrdersReport;
