import mongoose, { Schema } from 'mongoose';
import type { GeoPoint } from '../../utils/geo.js';

export type EmergencyAlertDoc = {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending_operator_approval' | 'open' | 'acknowledged' | 'dispatched' | 'resolved' | 'rejected';
  location: GeoPoint;
  corridorId?: mongoose.Types.ObjectId;
  shipmentId?: mongoose.Types.ObjectId;
  triggeredBy: 'system' | 'manual' | 'driver_sos' | 'ai_risk_agent';
  triggeredByDriverId?: mongoose.Types.ObjectId;
  acknowledgedBy?: mongoose.Types.ObjectId;
  dispatchedUnits: mongoose.Types.ObjectId[];
  aiPrediction?: {
    riskScore: number;
    accidentProbability: number;
    confidence: number;
    reasoning: string;
    highwayRef?: string;
    nearbyHospitals?: Array<{
      id?: string;
      name: string;
      phone?: string;
      distanceKm: number;
      etaMinutes: number;
      bedsAvailable?: number;
      traumaCenterLevel?: string;
    }>;
  };
  operatorAction?: {
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectedBy?: mongoose.Types.ObjectId;
    rejectedAt?: Date;
    notes?: string;
  };
  resolvedAt?: Date;
  slaMinutes: number;
  description?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const alertSchema = new Schema<EmergencyAlertDoc>(
  {
    type: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'critical' },
    status: {
      type: String,
      enum: ['pending_operator_approval', 'open', 'acknowledged', 'dispatched', 'resolved', 'rejected'],
      default: 'pending_operator_approval',
    },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    corridorId: { type: Schema.Types.ObjectId, ref: 'Corridor' },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    triggeredBy: { type: String, enum: ['system', 'manual', 'driver_sos', 'ai_risk_agent'], required: true },
    triggeredByDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    dispatchedUnits: [{ type: Schema.Types.ObjectId, ref: 'ResponseUnit' }],
    aiPrediction: {
      riskScore: { type: Number },
      accidentProbability: { type: Number },
      confidence: { type: Number },
      reasoning: { type: String },
      highwayRef: { type: String },
      nearbyHospitals: [Schema.Types.Mixed],
    },
    operatorAction: {
      approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      rejectedAt: { type: Date },
      notes: { type: String },
    },
    resolvedAt: { type: Date },
    slaMinutes: { type: Number, default: 30 },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

alertSchema.index({ location: '2dsphere' });

export const EmergencyAlert = mongoose.model<EmergencyAlertDoc>('EmergencyAlert', alertSchema);
