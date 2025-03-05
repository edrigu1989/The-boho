const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Cargar variables de entorno
const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID || '1526ONQKCy10ol4Z21O9PjxaCW8uj0-KJVCGlUe6IV5k';

// Ruta al archivo de credenciales
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-credentials.json');

console.log('Verificando archivo de credenciales...');
console.log('Checking credentials file...');
console.log('Ruta:', CREDENTIALS_PATH);
console.log('Path:', CREDENTIALS_PATH);
console.log('Existe:', fs.existsSync(CREDENTIALS_PATH));
console.log('Exists:', fs.existsSync(CREDENTIALS_PATH));

// Función para probar la autenticación
async function testAuth() {
  try {
    console.log('Creando cliente para Google Sheets con archivo de credenciales...');
    console.log('Creating Google Sheets client with credentials file...');
    
    // Crear cliente con archivo de credenciales
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    console.log('Cliente creado, probando autenticación...');
    console.log('Client created, testing authentication...');
    
    // Obtener cliente
    const client = await auth.getClient();
    
    console.log('✅ Autenticación exitosa');
    console.log('✅ Authentication successful');
    
    // Crear cliente de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth: client });
    
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