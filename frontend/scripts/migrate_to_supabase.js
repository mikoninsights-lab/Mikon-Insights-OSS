import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del frontend
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error('❌ Error: Credenciales de Supabase no encontradas o son placeholders.');
  console.error('Por favor, actualiza el archivo frontend/.env antes de ejecutar la migración.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const cleanAmount = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
};

const parseDate = (str) => {
  if (!str) return new Date().toISOString();
  const parts = str.split('/');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
  }
  return new Date().toISOString();
};

async function migrate() {
  console.log('🚀 Iniciando migración a Supabase...');

  // 1. Migrar Gastos Fijos
  const gastos = [];
  const gastosPath = path.join(__dirname, '../../backend/data/Gastos.csv');
  
  if (fs.existsSync(gastosPath)) {
    console.log('📖 Leyendo Gastos.csv...');
    fs.createReadStream(gastosPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row['Es coste fijo'] === 'TRUE') {
          gastos.push({
            description: row['Concepto'],
            amount: cleanAmount(row['Importe']),
            category: row['Categoría'],
            created_at: parseDate(row['Fecha'])
          });
        }
      })
      .on('end', async () => {
        if (gastos.length > 0) {
          const { error } = await supabase.from('fixed_costs').insert(gastos);
          if (error) console.error('❌ Error migrando gastos:', error.message);
          else console.log(`✅ ${gastos.length} gastos fijos migrados correctamente.`);
        }
      });
  }

  // 2. Migrar Servicios del catálogo
  const serviciosUnicos = new Set();
  const servicios = [];
  const operacionesPath = path.join(__dirname, '../../backend/data/Operaciones.csv');

  if (fs.existsSync(operacionesPath)) {
    console.log('📖 Leyendo Operaciones.csv...');
    fs.createReadStream(operacionesPath)
      .pipe(csv())
      .on('data', (row) => {
        const name = row['Nombre del Servicio'];
        if (name && !serviciosUnicos.has(name)) {
          serviciosUnicos.add(name);
          servicios.push({
            name: name,
            description: row['Descripción'] || '',
            base_price: cleanAmount(row['Precio']),
            is_scalable: row['Categoría'] !== 'Puntual'
          });
        }
      })
      .on('end', async () => {
        if (servicios.length > 0) {
          const { error } = await supabase.from('services').insert(servicios);
          if (error) console.error('❌ Error migrando servicios:', error.message);
          else console.log(`✅ ${servicios.length} servicios del catálogo migrados correctamente.`);
        }
      });
  }
}

migrate();
