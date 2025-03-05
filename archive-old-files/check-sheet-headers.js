require('dotenv').config();
const { google } = require('googleapis');

async function checkAndFixSheetHeaders() {
  console.log('=== VERIFICACIÓN DE ENCABEZADOS DE GOOGLE SHEETS ===');
  
  try {
    // 1. Obtener variables de entorno
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    
    console.log('SHEET_ID:', SHEET_ID ? 'Disponible' : 'No disponible');
    console.log('CLIENT_EMAIL:', CLIENT_EMAIL ? 'Disponible' : 'No disponible');
    console.log('PRIVATE_KEY:', PRIVATE_KEY ? 'Disponible' : 'No disponible');
    
    // Verificar variables de entorno
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      throw new Error('Faltan variables de entorno para Google Sheets');
    }
    
    // Procesar la clave privada
    if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
      PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
    }
    
    if (PRIVATE_KEY.includes('\\n')) {
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
    }
    
    // 2. Crear JWT para autenticación
    const auth = new google.auth.JWT(
      CLIENT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // 3. Obtener información de la hoja
    console.log('Obteniendo información de la hoja...');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      includeGridData: false,
    });
    
    console.log('Título del documento:', spreadsheet.data.properties.title);
    
    // 4. Obtener la primera fila (encabezados)
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: '1:1', // Primera fila
    });
    
    const headers = headerResponse.data.values ? headerResponse.data.values[0] : [];
    console.log('Encabezados actuales:', headers);
    
    // 5. Verificar encabezados duplicados
    const duplicateHeaders = findDuplicates(headers);
    
    if (duplicateHeaders.length > 0) {
      console.log('⚠️ Se encontraron encabezados duplicados:', duplicateHeaders);
      
      // 6. Sugerir nuevos encabezados
      const correctedHeaders = correctHeaders(headers);
      console.log('Encabezados corregidos sugeridos:', correctedHeaders);
      
      // 7. Preguntar si se desea actualizar los encabezados
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('¿Desea actualizar los encabezados? (s/n): ', async (answer) => {
        if (answer.toLowerCase() === 's') {
          // Actualizar encabezados
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: '1:1',
            valueInputOption: 'RAW',
            resource: {
              values: [correctedHeaders]
            }
          });
          
          console.log('✅ Encabezados actualizados correctamente');
        } else {
          console.log('❌ Operación cancelada por el usuario');
        }
        
        readline.close();
      });
    } else {
      console.log('✅ No se encontraron encabezados duplicados');
      
      // 8. Verificar si los encabezados coinciden con los esperados
      const expectedHeaders = [
        'Full Name',
        'Email',
        'Phone',
        'Contact Method',
        'Primary Reason for Buying',
        'Purchase Timeline',
        'First-time Buyer',
        'Budget Range',
        'Loan Approval Status',
        'Property Type',
        'Credit Score Range',
        'Lead Score',
        'Lead Classification',
        'Timestamp'
      ];
      
      console.log('\nEncabezados esperados:');
      expectedHeaders.forEach(header => console.log(`- ${header}`));
      
      console.log('\nSi los encabezados actuales no coinciden con los esperados, considere actualizarlos manualmente en Google Sheets.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Función para encontrar duplicados en un array
function findDuplicates(array) {
  const seen = {};
  const duplicates = [];
  
  array.forEach((item, index) => {
    // Normalizar el texto para comparación (minúsculas, sin espacios extras)
    const normalizedItem = item.toString().toLowerCase().trim();
    
    if (seen[normalizedItem]) {
      duplicates.push({
        value: item,
        indices: [seen[normalizedItem].index, index]
      });
    } else {
      seen[normalizedItem] = { index };
    }
  });
  
  return duplicates;
}

// Función para corregir encabezados duplicados
function correctHeaders(headers) {
  const seen = {};
  return headers.map((header, index) => {
    // Normalizar el texto para comparación
    const normalizedHeader = header.toString().toLowerCase().trim();
    
    if (seen[normalizedHeader]) {
      // Es un duplicado, añadir un sufijo
      seen[normalizedHeader].count++;
      return `${header} ${seen[normalizedHeader].count}`;
    } else {
      seen[normalizedHeader] = { count: 0 };
      return header;
    }
  });
}

// Ejecutar la función
checkAndFixSheetHeaders(); 