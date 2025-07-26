import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderHash: { type: String, required: true, unique: true },
  maker:     { type: String, required: true },
  srcToken:  { type: String, required: true },
  dstToken:  { type: String, required: true },
  srcAmount: { type: String, required: true }, // raw uint256
  dstAmount: { type: String, required: true },
  expiry:    { type: Number },
  signature: { type: String },
  salt:      { type: String },
  secret:    { type: String},
  hashLock:   { type: String },
  status:    { type: String, enum: ['OPEN', 'FILLED', 'CANCELLED', 'EXPIRED'], default: 'OPEN' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);