// Script de prueba simplificado para verificar la conexión con Google Sheets
require('dotenv').config({ path: '.env.local' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function testSimpleConnection() {
  console.log('=== PRUEBA SIMPLE DE CONEXIÓN CON GOOGLE SHEETS ===');
  
  try {
    // Obtener variables de entorno
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || 'Data';
    
    console.log('SHEET_ID:', SHEET_ID ? 'Disponible' : 'No disponible');
    console.log('CLIENT_EMAIL:', CLIENT_EMAIL ? 'Disponible' : 'No disponible');
    console.log('PRIVATE_KEY:', PRIVATE_KEY ? 'Disponible (primeros 20 caracteres): ' + PRIVATE_KEY.substring(0, 20) + '...' : 'No disponible');
    console.log('TAB_NAME:', TAB_NAME);
    
    // Procesar la clave privada
    if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
      PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
      console.log('Comillas removidas de la clave privada');
    }
    
    if (PRIVATE_KEY.includes('\\n')) {
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
      console.log('Caracteres \\n reemplazados por saltos de línea reales');
    }
    
    // Crear JWT para autenticación
    console.log('Creando JWT para autenticación...');
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    // Inicializar el documento
    console.log('Inicializando el documento de Google Sheets...');
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    
    // Cargar información del documento
    console.log('Intentando cargar información del documento...');
    await doc.loadInfo();
    console.log('✅ Conexión exitosa a Google Sheets');
    console.log('Título del documento:', doc.title);
    
    // Listar todas las hojas disponibles
    console.log('Hojas disponibles:');
    Object.keys(doc.sheetsByTitle).forEach(title => {
      console.log(`- ${title}`);
    });
    
    // Verificar si la hoja específica existe
    const sheet = doc.sheetsByTitle[TAB_NAME];
    if (sheet) {
      console.log(`✅ Hoja "${TAB_NAME}" encontrada`);
      
      // Añadir una fila de prueba simple
      console.log('Intentando añadir una fila de prueba simple...');
      const testRow = {
        'Full name': 'Test User',
        'Email': 'test@example.com',
        'Phone': '123456789',
        'Timestamp': new Date().toISOString()
      };
      
      const addedRow = await sheet.addRow(testRow);
      console.log('✅ Fila de prueba añadida correctamente');
    } else {
      console.log(`❌ Hoja "${TAB_NAME}" no encontrada`);
    }
    
    console.log('=== PRUEBA COMPLETADA CON ÉXITO ===');
  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testSimpleConnection(); 