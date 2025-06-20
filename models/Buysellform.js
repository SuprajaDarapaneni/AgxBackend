import mongoose from 'mongoose';

const BuySellFormSchema = new mongoose.Schema({
  buySell: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  industries: {
    type: [String],
    required: true,
  },
  timing: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true, // Make optional if desired: required: false
  },
  imageUrls: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

export default mongoose.models.BuySellForm || mongoose.model('BuySellForm', BuySellFormSchema);
