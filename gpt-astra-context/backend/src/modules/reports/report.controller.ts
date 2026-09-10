import type { Request, Response } from 'express';
import { Driver } from '../drivers/driver.model.js';
import { Vehicle } from '../vehicles/vehicle.model.js';
import { Report } from './report.model.js';
import { notFound } from '../../utils/appError.js';

export async function listReports(req: Request, res: Response) {
  const data = await Report.find({ isDeleted: false, generatedBy: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, data });
}

export async function createReport(req: Request, res: Response) {
  const type = req.body.type as string;
  let csv = 'metric,value\n';
  if (type === 'fleet_compliance') {
    const drivers = await Driver.find({ isDeleted: false }).select('licenseNumber licenseExpiry status');
    csv = 'licenseNumber,licenseExpiry,status\n';
    for (const d of drivers) {
      csv += `${d.licenseNumber},${d.licenseExpiry.toISOString()},${d.status}\n`;
    }
  } else {
    const vehicles = await Vehicle.find({ isDeleted: false }).select('registrationNumber status');
    csv = 'registrationNumber,status\n';
    for (const v of vehicles) csv += `${v.registrationNumber},${v.status}\n`;
  }
  const doc = await Report.create({
    type,
    generatedBy: req.user!.id,
    dateRange: req.body.dateRange,
    filters: req.body.filters,
    csvContent: csv,
    format: req.body.format === 'pdf' ? 'pdf' : 'csv',
  });
  res.status(201).json({ success: true, data: { _id: doc._id, type: doc.type, format: doc.format } });
}

export async function exportReport(req: Request, res: Response) {
  const doc = await Report.findOne({ _id: req.params.id, isDeleted: false }).select('+csvContent');
  if (!doc) throw notFound();
  if (doc.format === 'pdf') {
    res.json({
      success: true,
      data: { message: 'PDF export is stubbed in v1; CSV is available', csv: doc.csvContent },
    });
    return;
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${doc.type}.csv"`);
  res.send(doc.csvContent ?? '');
}
