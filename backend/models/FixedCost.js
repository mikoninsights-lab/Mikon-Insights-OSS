import mongoose from 'mongoose';

const fixedCostSchema = new mongoose.Schema({
  structureId: {
    type: Number,
    unique: true
  },
  concept: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Seguridad Social', 'Tecnología', 'Nóminas', 'Servicios', 'Marketing', 'Otros'],
    required: true
  },
  expenseType: {
    type: String,
    enum: ['Recurrente', 'Puntual'],
    default: 'Recurrente'
  },
  frequency: {
    type: String,
    enum: ['Mensual', 'Trimestral', 'Anual', 'Puntual'],
    default: 'Mensual'
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  isFixedCost: {
    type: Boolean,
    default: true
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

export default mongoose.model('FixedCost', fixedCostSchema);
