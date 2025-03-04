// Script de prueba para verificar la conexión con Google Sheets
require('dotenv').config({ path: '.env.local' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function testGoogleSheetsConnection() {
  console.log('=== PRUEBA DE CONEXIÓN CON GOOGLE SHEETS ===');
  
  try {
    // Obtener variables de entorno
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || 'Data';
    
    console.log('ID de la hoja:', SHEET_ID);
    console.log('Email del cliente:', CLIENT_EMAIL);
    
    // Verificar variables de entorno
    if (!SHEET_ID) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_SHEET_ID');
    }
    
    if (!CLIENT_EMAIL) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_CLIENT_EMAIL');
    }
    
    if (!PRIVATE_KEY) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_PRIVATE_KEY');
    }
    
    // Procesar la clave privada
    if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
      PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
    }
    
    if (PRIVATE_KEY.includes('\\n')) {
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
    }
    
    console.log('Clave privada procesada correctamente');
    
    // Crear JWT para autenticación
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    console.log('JWT creado correctamente');
    
    // Inicializar el documento
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    console.log('Intentando cargar información del documento...');
    
    await doc.loadInfo();
    console.log('✅ Conexión exitosa a Google Sheets');
    console.log('Título del documento:', doc.title);
    
    // Obtener la hoja de cálculo
    const sheet = doc.sheetsByTitle[TAB_NAME];
    if (!sheet) {
      throw new Error(`Hoja "${TAB_NAME}" no encontrada en el documento`);
    }
    console.log('✅ Hoja encontrada:', sheet.title);
    
    // Obtener los encabezados
    await sheet.loadHeaderRow();
    console.log('Encabezados de la hoja:', sheet.headerValues);
    
    // Añadir una fila de prueba
    const testData = {
      'Full name': 'Usuario de Prueba',
      'Email': 'test@example.com',
      'Phone': '123456789',
      'Contact Method': 'Email',
      'primary reason for buying': 'Test',
      'purchase timeline': 'Test',
      'first-time buyer': 'Test',
      'budget range': 'Test',
      'loan approval status': 'Test',
      'type of property': 'Test',
      'credit score': 'Test',
      'Score': 100,
      'Classification': 'Test Lead',
      'Timestamp': new Date().toISOString()
    };
    
    console.log('Intentando añadir fila de prueba...');
    const addedRow = await sheet.addRow(testData);
    console.log('✅ Fila de prueba añadida correctamente en la posición:', addedRow.rowIndex);
    
    console.log('=== PRUEBA COMPLETADA CON ÉXITO ===');
  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testGoogleSheetsConnection(); 