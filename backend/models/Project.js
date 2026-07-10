import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  client: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: [
      'N1: Auditoría de Salud',
      'N2: Diagnóstico XAI', 
      'N3: Brújula Predictiva',
      'N4: Módulo Anticipación',
      'N5: Partner Estratégico',
      'Mantenimiento',
      // Legacy categories for imported data
      'Bonus por Éxito',
      'Recurrente Pasivo',
      'Recurrente Activo',
      'Puntual',
      'Pay per Use'
    ],
    required: true
  },
  totalBudget: {
    type: Number,
    default: 0
  },
  invoicedAmount: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  vatRate: {
    type: Number,
    default: 21
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Lead', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Lead'
  },
  saleDate: {
    type: Date
  },
  billingStartDate: {
    type: Date
  },
  reviewDate: {
    type: Date
  },
  salesFrequency: {
    type: Number,
    default: 0
  },
  billingFrequency: {
    type: Number,
    default: 0
  },
  isFounderClient: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  linkedServiceIds: [{
    type: String
  }],
  techStack: [{
    type: String
  }],
  clientEconomicImpact: {
    type: Number,
    default: 0
  },
  expenses: {
    type: Number,
    default: 0
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

// Determinar status basado en las fechas y frecuencias
projectSchema.pre('save', function(next) {
  if (this.billingFrequency > 0 && this.invoicedAmount > 0) {
    this.status = 'Completed';
  } else if (this.saleDate) {
    this.status = 'In Progress';
  } else {
    this.status = 'Lead';
  }
  next();
});

projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });

export default mongoose.model('Project', projectSchema);
