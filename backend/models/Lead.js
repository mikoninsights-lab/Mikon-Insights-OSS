import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    default: ''
  },
  value: {
    type: Number,
    default: 0,
    min: 0
  },
  stage: {
    type: String,
    enum: ['new', 'nurturing', 'contacted', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new'
  },
  score: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  interestedService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  notes: {
    type: String,
    default: ''
  },
  // Tracks when `stage` last changed, so the board can show "N days in this stage"
  // without storing a counter that would go stale.
  stageUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
