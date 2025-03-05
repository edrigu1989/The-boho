const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Asignar variables al process.env
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

// Obtener la clave privada
let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

console.log('PRIVATE_KEY disponible:', !!PRIVATE_KEY);
console.log('PRIVATE_KEY available:', !!PRIVATE_KEY);

if (PRIVATE_KEY) {
  console.log('Longitud de la clave:', PRIVATE_KEY.length);
  console.log('Key length:', PRIVATE_KEY.length);
  
  console.log('Primeros 50 caracteres:', PRIVATE_KEY.substring(0, 50));
  console.log('First 50 characters:', PRIVATE_KEY.substring(0, 50));
  
  console.log('Últimos 50 caracteres:', PRIVATE_KEY.substring(PRIVATE_KEY.length - 50));
  console.log('Last 50 characters:', PRIVATE_KEY.substring(PRIVATE_KEY.length - 50));
  
  console.log('Contiene \\n:', PRIVATE_KEY.includes('\\n'));
  console.log('Contains \\n:', PRIVATE_KEY.includes('\\n'));
  
  console.log('Contiene saltos de línea reales:', PRIVATE_KEY.includes('\n'));
  console.log('Contains real line breaks:', PRIVATE_KEY.includes('\n'));
  
  console.log('Comienza con comillas dobles:', PRIVATE_KEY.startsWith('"'));
  console.log('Starts with double quotes:', PRIVATE_KEY.startsWith('"'));
  
  console.log('Termina con comillas dobles:', PRIVATE_KEY.endsWith('"'));
  console.log('Ends with double quotes:', PRIVATE_KEY.endsWith('"'));
  
  // Procesar la clave
  if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
    PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
    console.log('Clave sin comillas dobles');
    console.log('Key without double quotes');
  }
  
  if (PRIVATE_KEY.includes('\\n')) {
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
    console.log('Clave con saltos de línea reales');
    console.log('Key with real line breaks');
  }
  
  console.log('Clave procesada:');
  console.log('Processed key:');
  console.log(PRIVATE_KEY);
  
  console.log('Contiene BEGIN PRIVATE KEY:', PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----'));
  console.log('Contains BEGIN PRIVATE KEY:', PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----'));
  
  console.log('Contiene END PRIVATE KEY:', PRIVATE_KEY.includes('-----END PRIVATE KEY-----'));
  console.log('Contains END PRIVATE KEY:', PRIVATE_KEY.includes('-----END PRIVATE KEY-----'));
} else {
  console.log('La clave privada no está disponible en las variables de entorno');
  console.log('Private key is not available in environment variables');
} 