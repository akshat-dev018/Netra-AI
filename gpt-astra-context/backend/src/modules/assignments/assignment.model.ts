import mongoose, { Schema } from 'mongoose';

export type AssignmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type AssignmentDoc = {
  fleetId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  shipmentId: mongoose.Types.ObjectId;
  status: AssignmentStatus;
  startsAt: Date;
  endsAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const assignmentSchema = new Schema<AssignmentDoc>(
  {
    fleetId: { type: Schema.Types.ObjectId, ref: 'Fleet', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

assignmentSchema.index({ driverId: 1, status: 1 });
assignmentSchema.index({ vehicleId: 1, status: 1 });

export const Assignment = mongoose.model<AssignmentDoc>('Assignment', assignmentSchema);
