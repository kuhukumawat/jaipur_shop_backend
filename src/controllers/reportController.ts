import { Response } from 'express';
import * as excelService from '../services/excelService';
import { AuthRequest } from '../middleware/auth';

export const downloadInventoryExcel = async (req: AuthRequest, res: Response) => {
  const buffer = await excelService.generateInventoryReport();
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=inventory-report-${date}.xlsx`);
  res.send(buffer);
};

export const downloadOrdersExcel = async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  if (startDate && isNaN(Date.parse(startDate as string))) {
    return res.status(400).json({ success: false, message: 'Invalid startDate format' });
  }
  if (endDate && isNaN(Date.parse(endDate as string))) {
    return res.status(400).json({ success: false, message: 'Invalid endDate format' });
  }
  const buffer = await excelService.generateOrdersReport(startDate as string, endDate as string);
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=orders-report-${date}.xlsx`);
  res.send(buffer);
};
