import { z } from 'zod';

// User Schemas
export const userRegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Manager']).optional().default('Manager')
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  maxHoursCapacity: z.coerce.number().positive('Max hours capacity must be positive').optional()
});

// Service Schemas
export const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  category: z.enum([
    'N1: Auditoría de Salud',
    'N2: Diagnóstico XAI',
    'N3: Brújula Predictiva',
    'N4: Módulo Anticipación',
    'N5: Partner Estratégico',
    'PersonaCraft',
    'CultureCraft',
    'SourceCraft',
    'Workshop',
    'Inmersión',
    'Mantenimiento',
    'Bonus por Éxito',
    'Recurrente Pasivo',
    'Recurrente Activo',
    'Puntual',
    'Pay per Use'
  ]),
  developmentCostHours: z.coerce.number().optional().default(0),
  basePrice: z.coerce.number().min(0, 'Price must be positive')
});

export const serviceUpdateSchema = serviceSchema.partial();

// Project Schemas
export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  client: z.string().optional().default(''),
  category: z.enum([
    'N1: Auditoría de Salud',
    'N2: Diagnóstico XAI',
    'N3: Brújula Predictiva',
    'N4: Módulo Anticipación',
    'N5: Partner Estratégico',
    'Mantenimiento',
    'Bonus por Éxito',
    'Recurrente Pasivo',
    'Recurrente Activo',
    'Puntual',
    'Pay per Use'
  ]),
  totalBudget: z.number().optional().default(0),
  estimatedHours: z.number().optional().default(0),
  actualHours: z.number().optional().default(0),
  status: z.enum(['Lead', 'In Progress', 'Completed', 'Cancelled']).optional().default('Lead'),
  techStack: z.array(z.string()).optional().default([]),
  clientEconomicImpact: z.number().optional().default(0)
});

export const projectUpdateSchema = projectSchema.partial();

// Fixed Cost Schemas
export const fixedCostSchema = z.object({
  concept: z.string().min(1, 'Concept is required'),
  category: z.enum(['Seguridad Social', 'Tecnología', 'Nóminas', 'Servicios', 'Marketing', 'Otros']),
  expenseType: z.enum(['Recurrente', 'Puntual']).optional().default('Recurrente'),
  frequency: z.enum(['Mensual', 'Trimestral', 'Anual', 'Puntual']).optional().default('Mensual'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().or(z.date()),
  isFixedCost: z.boolean().optional().default(true),
  notes: z.string().optional().default('')
});

export const fixedCostUpdateSchema = fixedCostSchema.partial();

// Project Architecture Schema
export const projectArchitectureSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  consultancyHours: z.number().optional().default(0),
  complexityModifier: z.number().min(0.5).max(3.0).optional().default(1.0)
});

// Validation helper
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    next(error);
  }
};
