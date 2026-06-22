import mongoose from 'mongoose';

const projectArchitectureSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  consultancyHours: {
    type: Number,
    default: 0
  },
  complexityModifier: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 3.0
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Índice compuesto para evitar duplicados
projectArchitectureSchema.index({ project: 1, service: 1 }, { unique: true });

export default mongoose.model('ProjectArchitecture', projectArchitectureSchema);
