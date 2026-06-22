import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: [
      // Arquitectura de Anticipación
      'N1: Auditoría de Salud',
      'N2: Diagnóstico XAI',
      'N3: Brújula Predictiva',
      'N4: Módulo Anticipación',
      'N5: Partner Estratégico',
      // Mikon Lab - MicroSaaS
      'PersonaCraft',
      'CultureCraft',
      'SourceCraft',
      // Formación
      'Workshop',
      'Inmersión',
      // Legacy
      'Mantenimiento',
      'Bonus por Éxito',
      'Recurrente Pasivo',
      'Recurrente Activo',
      'Puntual',
      'Pay per Use'
    ],
    required: true
  },
  isScalable: {
    type: Boolean,
    default: false
  },
  developmentCostHours: {
    type: Number,
    default: 0
  },
  basePrice: {
    type: Number,
    required: true
  },
  linkedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Marcar como escalable si es Recurrente Pasivo o Pay per Use
serviceSchema.pre('save', function(next) {
  this.isScalable = ['Recurrente Pasivo', 'Pay per Use'].includes(this.category);
  next();
});

export default mongoose.model('Service', serviceSchema);
