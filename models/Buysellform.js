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
  dropOffLocation: {
    type: String,
    required: true,
  },
  country: {
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
    required: false,  // Optional message
  },
  imageUrls: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

export default mongoose.models.BuySellForm || mongoose.model('BuySellForm', BuySellFormSchema);
