import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Service, Project, FixedCost } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Helper: Parse Spanish currency format (e.g., "1.207,58 €" or "€1.207,58")
const parseCurrency = (str) => {
  if (!str || str === '') return 0;
  // Remove currency symbols and whitespace
  const cleaned = str.replace(/[€\s]/g, '').trim();
  if (!cleaned) return 0;
  // Spanish format: dots for thousands, comma for decimal
  // Convert to standard number format
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

// Helper: Parse Spanish date format (DD/MM/YYYY)
const parseDate = (str) => {
  if (!str || str === '') return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(p => parseInt(p, 10));
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month - 1, day);
};

// Helper: Parse percentage (e.g., "21%")
const parsePercentage = (str) => {
  if (!str || str === '') return 21;
  const num = parseInt(str.replace('%', ''), 10);
  return isNaN(num) ? 21 : num;
};

// Helper: Normalize category names
const normalizeCategory = (cat) => {
  if (!cat) return 'Puntual';
  const trimmed = cat.trim();
  const mapping = {
    'Bonus por Éxito': 'Bonus por Éxito',
    'Recurrente Pasivo': 'Recurrente Pasivo',
    'Recurrente Activo': 'Recurrente Activo',
    'Puntual': 'Puntual',
    'Pay per Use': 'Pay per Use',
    'Mantenimiento': 'Mantenimiento'
  };
  return mapping[trimmed] || 'Puntual';
};

// Helper: Parse CSV manually (handles quoted fields)
const parseCSV = (content) => {
  const lines = content.split('\n');
  if (lines.length === 0) return [];
  
  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };
  
  const headers = parseRow(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseRow(line);
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    rows.push(obj);
  }
  
  return rows;
};

// Seed Users
const seedUsers = async () => {
  console.log('🔐 Seeding users...');
  
  const users = [
    {
      username: 'admin',
      email: 'admin@mikon.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'Admin',
      maxHoursCapacity: 160
    },
    {
      username: 'manager',
      email: 'manager@mikon.com',
      password: await bcrypt.hash('manager123', 10),
      role: 'Manager',
      maxHoursCapacity: 160
    }
  ];
  
  await User.deleteMany({});
  await User.insertMany(users);
  console.log(`✅ Created ${users.length} users`);
};

// Seed Services (extract unique services from operations)
const seedServices = async (operations) => {
  console.log('📦 Seeding services...');
  
  // Extract unique services by name and category
  const servicesMap = new Map();
  
  operations.forEach((op, index) => {
    const name = op['Nombre del Servicio'];
    if (!name) return;
    
    const key = `${name}-${op['Categoría']}`;
    if (!servicesMap.has(key)) {
      servicesMap.set(key, {
        name,
        description: op['Descripción'] || '',
        category: normalizeCategory(op['Categoría']),
        basePrice: parseCurrency(op['Precio']),
        isActive: op['Activo en catálogo'] === 'checked'
      });
    }
  });
  
  const services = Array.from(servicesMap.values());
  
  await Service.deleteMany({});
  await Service.insertMany(services);
  console.log(`✅ Created ${services.length} services`);
  
  return services;
};

// Seed Projects (from Operations CSV)
const seedProjects = async (operations) => {
  console.log('📊 Seeding projects...');
  
  const projects = operations.map((op, index) => {
    const saleDate = parseDate(op['Fecha de venta']);
    const billingStartDate = parseDate(op['Mes de inicio de cobro']);
    const reviewDate = parseDate(op['Fecha de Revisión de Valor']);
    
    return {
      projectId: `OP-${String(index + 1).padStart(4, '0')}`,
      name: op['Nombre del Servicio'] || `Operación ${index + 1}`,
      description: op['Descripción'] || '',
      client: '', // No client field in CSV
      category: normalizeCategory(op['Categoría']),
      totalBudget: parseCurrency(op['Precio']),
      invoicedAmount: parseCurrency(op['Importe facturado']),
      totalPrice: parseCurrency(op['Precio total (plazos)']) || parseCurrency(op['Precio']),
      vatRate: parsePercentage(op['IVA']),
      salesFrequency: parseInt(op['Frecuencia (ventas)']) || 0,
      billingFrequency: parseInt(op['Frecuencia (cobros)']) || 0,
      saleDate,
      billingStartDate,
      reviewDate,
      isFounderClient: op['Cliente Fundador/ Impulso Digital'] === 'checked',
      isActive: op['Activo en catálogo'] === 'checked',
      expenses: parseCurrency(op['Gastos']),
      notes: op['Notas'] || '',
      linkedServiceIds: op['Vínculo (servicio relacionado)'] 
        ? op['Vínculo (servicio relacionado)'].replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean)
        : []
    };
  }).filter(p => p.name);
  
  await Project.deleteMany({});
  await Project.insertMany(projects);
  console.log(`✅ Created ${projects.length} projects`);
  
  return projects;
};

// Seed Fixed Costs (from Gastos CSV)
const seedFixedCosts = async (expenses) => {
  console.log('💰 Seeding fixed costs...');
  
  // Map category names
  const categoryMap = {
    'Seguridad Social': 'Seguridad Social',
    'Tecnología': 'Tecnología',
    'Nóminas': 'Nóminas',
    'Servicios': 'Servicios',
    'Marketing': 'Marketing',
    'Otros': 'Otros'
  };
  
  const fixedCosts = expenses.map((exp, index) => ({
    structureId: parseInt(exp['ID']) || index + 1,
    concept: exp['Concepto'] || 'Gasto sin concepto',
    category: categoryMap[exp['Categoría']] || 'Otros',
    expenseType: exp['Tipo de Gasto'] || 'Recurrente',
    frequency: exp['Frecuencia (Recurrente)'] || 'Mensual',
    amount: parseCurrency(exp['Importe']),
    dueDate: parseDate(exp['Fecha']) || new Date(),
    isFixedCost: exp['Es coste fijo'] === 'TRUE',
    notes: exp['Notas'] || ''
  })).filter(fc => fc.amount > 0);
  
  await FixedCost.deleteMany({});
  await FixedCost.insertMany(fixedCosts);
  console.log(`✅ Created ${fixedCosts.length} fixed costs`);
  
  return fixedCosts;
};

// Main seed function
const seed = async () => {
  try {
    console.log('\n🌱 Starting Mikon Insights OSS Database Seed...\n');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'mikon_oss';
    
    await mongoose.connect(`${mongoUrl}/${dbName}`);
    console.log(`✅ Connected to MongoDB: ${dbName}\n`);
    
    // Read CSV files
    const dataDir = path.join(__dirname, '..', 'data');
    
    const operacionesPath = path.join(dataDir, 'Operaciones.csv');
    const gastosPath = path.join(dataDir, 'Gastos.csv');
    
    console.log('📂 Reading CSV files...');
    
    const operacionesContent = fs.readFileSync(operacionesPath, 'utf-8');
    const gastosContent = fs.readFileSync(gastosPath, 'utf-8');
    
    const operations = parseCSV(operacionesContent);
    const gastos = parseCSV(gastosContent);
    
    console.log(`   - Operaciones: ${operations.length} rows`);
    console.log(`   - Gastos: ${gastos.length} rows\n`);
    
    // Seed in order
    await seedUsers();
    await seedServices(operations);
    await seedProjects(operations);
    await seedFixedCosts(gastos);
    
    console.log('\n🎉 Seed completed successfully!\n');
    
    // Print summary
    const counts = {
      users: await User.countDocuments(),
      services: await Service.countDocuments(),
      projects: await Project.countDocuments(),
      fixedCosts: await FixedCost.countDocuments()
    };
    
    console.log('📊 Database Summary:');
    console.log(`   - Users: ${counts.users}`);
    console.log(`   - Services: ${counts.services}`);
    console.log(`   - Projects: ${counts.projects}`);
    console.log(`   - Fixed Costs: ${counts.fixedCosts}`);
    console.log(`   - Total: ${Object.values(counts).reduce((a, b) => a + b, 0)} documents\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
