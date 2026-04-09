import mongoose, { Schema, Document } from 'mongoose';

export interface IScanLog extends Document {
  product_id: mongoose.Types.ObjectId;
  slug: string;
  event_type: 'visit' | 'scan';
  scanned_at: Date;
  ip_address?: string;
  country?: string;
  city?: string;
  device_user_agent?: string;
}

const ScanLogSchema = new Schema<IScanLog>({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  event_type: {
    type: String,
    enum: ['visit', 'scan'],
    default: 'scan',
  },
  scanned_at: {
    type: Date,
    default: Date.now,
  },
  ip_address: String,
  country: String,
  city: String,
  device_user_agent: String,
});

ScanLogSchema.index({ product_id: 1, scanned_at: -1 });
ScanLogSchema.index({ product_id: 1, event_type: 1, scanned_at: -1 });
ScanLogSchema.index({ slug: 1 });

export const ScanLog = mongoose.models.ScanLog || mongoose.model<IScanLog>('ScanLog', ScanLogSchema);
