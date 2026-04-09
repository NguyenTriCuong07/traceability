import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  batch_code: string;
  description?: string;
  image_url?: string;
  origin: {
    region: string;
    province: string;
    district?: string;
    farm_name: string;
    producer_name: string;
    coordinates?: { lat: number; lng: number };
  };
  traceability: {
    status?: string;
    planting_date: Date;
    harvest_date: Date;
    pesticides_used?: string[];
    fertilizer_used?: string[];
    certification: {
      organic: boolean;
      certifier?: string;
      cert_number?: string;
      cert_expiry?: Date;
    };
  };
  qr_code_url: string;
  unique_token: string;
  view_count: number;
  scan_count: number;
  last_viewed_at?: Date;
  last_scanned_at?: Date;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
}

const OriginSchema = new Schema(
  {
    region: { type: String, required: true },
    province: { type: String, required: true },
    district: String,
    farm_name: { type: String, required: true },
    producer_name: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const CertificationSchema = new Schema(
  {
    organic: { type: Boolean, default: false },
    certifier: String,
    cert_number: String,
    cert_expiry: Date,
  },
  { _id: false }
);

const TraceabilitySchema = new Schema(
  {
    status: {
      type: String,
      enum: ['Đang lưu thông', 'Đang sơ chế', 'Đã bán hết'],
      default: 'Đang sơ chế',
    },
    planting_date: { type: Date, required: true },
    harvest_date: { type: Date, required: true },
    pesticides_used: [String],
    fertilizer_used: [String],
    certification: { type: CertificationSchema, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  batch_code: {
    type: String,
    required: true,
  },
  description: String,
  image_url: String,
  origin: {
    type: OriginSchema,
    required: true,
  },
  traceability: {
    type: TraceabilitySchema,
    required: true,
  },
  qr_code_url: {
    type: String,
    required: true,
  },
  unique_token: {
    type: String,
    required: true,
    unique: true,
  },
  view_count: {
    type: Number,
    default: 0,
  },
  scan_count: {
    type: Number,
    default: 0,
  },
  last_viewed_at: Date,
  last_scanned_at: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  expires_at: Date,
});

ProductSchema.index({ slug: 1 });
ProductSchema.index({ batch_code: 1 });
ProductSchema.index({ created_at: -1 });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
