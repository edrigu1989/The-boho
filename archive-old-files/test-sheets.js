// Script para probar la conexión con Google Sheets
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function testGoogleSheetsConnection() {
  try {
    // Obtener variables de entorno
    const sheetId = process.env.GOOGLE_SHEETS_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetName = process.env.GOOGLE_SHEETS_TAB_NAME;
    
    console.log('=== PRUEBA DE CONEXIÓN A GOOGLE SHEETS ===');
    console.log('ID de la hoja:', sheetId);
    console.log('Email del cliente:', clientEmail);
    console.log('Clave privada disponible:', privateKey ? 'Sí (primeros 20 caracteres): ' + privateKey.substring(0, 20) + '...' : 'No');
    console.log('Nombre de la pestaña:', sheetName || 'Primera pestaña (default)');
    
    if (!sheetId || !clientEmail || !privateKey) {
      throw new Error('Faltan variables de entorno para Google Sheets');
    }
    
    // Crear un JWT para la autenticación
    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
    
    // Crear una instancia de GoogleSpreadsheet
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    // Cargar la información del documento
    console.log('Intentando conectar a Google Sheets...');
    await doc.loadInfo();
    console.log('✅ Conexión exitosa a Google Sheets');
    console.log('Título del documento:', doc.title);
    
    // Listar todas las hojas disponibles
    console.log('\nHojas disponibles:');
    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.title} (${sheet.rowCount} filas x ${sheet.columnCount} columnas)`);
    });
    
    // Intentar usar el sheet con nombre específico o el primero
    let sheet;
    
    if (sheetName) {
      sheet = doc.sheetsByTitle[sheetName];
      if (!sheet) {
        console.log(`⚠️ No se encontró la hoja "${sheetName}", usando la primera hoja`);
        sheet = doc.sheetsByIndex[0];
      }
    } else {
      sheet = doc.sheetsByIndex[0];
    }
    
    if (!sheet) {
      throw new Error('No se pudo encontrar una hoja válida en el documento');
    }
    
    console.log('\nUsando hoja:', sheet.title);
    
    // Intentar escribir una fila de prueba
    console.log('Intentando escribir una fila de prueba...');
    
    // Obtener los encabezados actuales
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    console.log('Encabezados actuales:', headers);
    
    // Preparar datos de prueba que coincidan con los encabezados
    const testData = {
      'Full name': 'Usuario de Prueba',
      'Email': 'prueba@ejemplo.com',
      'Phone': '123456789',
      'Contact Method': 'Email',
      'primary reason for buying': 'Investment',
      'purchase timeline': '3-6 months',
      'first-time buyer': 'Yes',
      'budget range': '$300,000-$400,000',
      'loan approval status': 'Pre-approved',
      'type of property': 'Single Family',
      'credit score': 'Good (670-739)'
    };
    
    // Añadir fila a Google Sheets
    const addedRow = await sheet.addRow(testData);
    console.log('✅ Fila de prueba añadida exitosamente con ID:', addedRow._rowNumber);
    
    console.log('\n=== PRUEBA COMPLETADA CON ÉXITO ===');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Detalles del error:', error);
  }
}

// Ejecutar la prueba
testGoogleSheetsConnection(); 