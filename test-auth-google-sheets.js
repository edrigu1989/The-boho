const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { google } = require('googleapis');

// Cargar variables de entorno desde .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Asignar variables al process.env
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

// Obtener variables de entorno
const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

console.log('SHEET_ID:', SHEET_ID ? 'Disponible' : 'No disponible');
console.log('SHEET_ID:', SHEET_ID ? 'Available' : 'Not available');
console.log('CLIENT_EMAIL:', CLIENT_EMAIL ? 'Disponible' : 'No disponible');
console.log('CLIENT_EMAIL:', CLIENT_EMAIL ? 'Available' : 'Not available');
console.log('PRIVATE_KEY:', PRIVATE_KEY ? 'Disponible' : 'No disponible');
console.log('PRIVATE_KEY:', PRIVATE_KEY ? 'Available' : 'Not available');

// Procesar la clave privada
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

// Función para probar la autenticación
async function testAuth() {
  try {
    console.log('Creando cliente para Google Sheets...');
    console.log('Creating Google Sheets client...');
    
    // Crear cliente con método alternativo
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    console.log('Cliente creado, probando autenticación...');
    console.log('Client created, testing authentication...');
    
    // Probar autenticación
    await auth.authorize();
    
    console.log('✅ Autenticación exitosa');
    console.log('✅ Authentication successful');
    
    // Crear cliente de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Obtener información de la hoja
    console.log('Obteniendo información de la hoja...');
    console.log('Getting sheet information...');
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });
    
    console.log('✅ Información de la hoja obtenida correctamente');
    console.log('✅ Sheet information obtained correctly');
    console.log('Título de la hoja:', response.data.properties.title);
    console.log('Sheet title:', response.data.properties.title);
    
    return true;
  } catch (error) {
    console.error('❌ Error en la autenticación:', error.message);
    console.error('❌ Authentication error:', error.message);
    console.error('Detalles completos del error:', JSON.stringify(error, null, 2));
    console.error('Complete error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

// Ejecutar prueba de autenticación
testAuth()
  .then(success => {
    if (success) {
      console.log('Prueba completada exitosamente');
      console.log('Test completed successfully');
    } else {
      console.log('Prueba fallida');
      console.log('Test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error en la ejecución de la prueba:', error);
    console.error('Error in test execution:', error);
    process.exit(1);
  }); 