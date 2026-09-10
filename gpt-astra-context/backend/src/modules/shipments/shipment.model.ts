import mongoose, { Schema } from 'mongoose';

export type ShipmentStatus =
  | 'planned'
  | 'in_transit'
  | 'delayed'
  | 'delivered'
  | 'cancelled';

export type ShipmentDoc = {
  reference: string;
  origin: string;
  destination: string;
  carrier?: string;
  status: ShipmentStatus;
  assignedDriverId?: mongoose.Types.ObjectId;
  assignedVehicleId?: mongoose.Types.ObjectId;
  currentCorridorId?: mongoose.Types.ObjectId;
  routePolyline?: number[][];
  riskScore: number;
  eta?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cargoType?: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const shipmentSchema = new Schema<ShipmentDoc>(
  {
    reference: { type: String, required: true, unique: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    carrier: { type: String },
    status: {
      type: String,
      enum: ['planned', 'in_transit', 'delayed', 'delivered', 'cancelled'],
      default: 'planned',
    },
    assignedDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    assignedVehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    currentCorridorId: { type: Schema.Types.ObjectId, ref: 'Corridor' },
    routePolyline: { type: [[Number]] },
    riskScore: { type: Number, default: 0 },
    eta: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    cargoType: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

shipmentSchema.index({ reference: 'text', origin: 'text', destination: 'text' });
shipmentSchema.index({ assignedDriverId: 1, isDeleted: 1 });

export const Shipment = mongoose.model<ShipmentDoc>('Shipment', shipmentSchema);
