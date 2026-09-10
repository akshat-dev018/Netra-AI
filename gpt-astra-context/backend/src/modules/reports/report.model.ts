import mongoose, { Schema } from 'mongoose';

export type ReportDoc = {
  type: string;
  generatedBy: mongoose.Types.ObjectId;
  dateRange?: { from: Date; to: Date };
  filters?: Record<string, unknown>;
  csvContent?: string;
  format: 'csv' | 'pdf';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const reportSchema = new Schema<ReportDoc>(
  {
    type: { type: String, required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateRange: { from: Date, to: Date },
    filters: { type: Schema.Types.Mixed },
    csvContent: { type: String, select: false },
    format: { type: String, enum: ['csv', 'pdf'], default: 'csv' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Report = mongoose.model<ReportDoc>('Report', reportSchema);
