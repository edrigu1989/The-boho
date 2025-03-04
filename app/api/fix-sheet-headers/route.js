import { google } from 'googleapis';

export async function GET(request) {
  console.log('=== INICIO DE VERIFICACIÓN DE ENCABEZADOS ===');
  
  try {
    // Obtener parámetros de la URL
    const url = new URL(request.url);
    const shouldFix = url.searchParams.get('fix') === 'true';
    
    // Configurar la conexión con Google Sheets
    console.log('Obteniendo variables de entorno para Google Sheets...');
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
    console.log('Procesando la clave privada...');
    if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
      PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
      console.log('Comillas removidas de la clave privada');
    }
    
    if (PRIVATE_KEY.includes('\\n')) {
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
      console.log('Caracteres \\n reemplazados por saltos de línea reales');
    }
    
    // Crear JWT para autenticación y cliente de Google Sheets
    console.log('Creando cliente de Google Sheets con JWT...');
    const auth = new google.auth.JWT(
      CLIENT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Definir los encabezados esperados
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
    
    // Obtener información de la hoja de cálculo
    console.log('Obteniendo información de la hoja de cálculo...');
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    
    console.log('Título del documento:', spreadsheetInfo.data.properties.title);
    
    // Obtener los encabezados actuales
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: '1:1', // Primera fila
    });
    
    const currentHeaders = headerResponse.data.values && headerResponse.data.values[0] ? headerResponse.data.values[0] : [];
    console.log('Encabezados actuales:', currentHeaders);
    
    // Verificar si hay encabezados duplicados
    const duplicateHeaders = findDuplicates(currentHeaders);
    
    // Verificar si los encabezados actuales coinciden con los esperados
    const missingHeaders = expectedHeaders.filter(header => !currentHeaders.includes(header));
    const extraHeaders = currentHeaders.filter(header => !expectedHeaders.includes(header));
    
    // Preparar respuesta
    const response = {
      currentHeaders,
      expectedHeaders,
      duplicateHeaders,
      missingHeaders,
      extraHeaders,
      headersMatch: missingHeaders.length === 0 && extraHeaders.length === 0 && duplicateHeaders.length === 0,
      fixed: false
    };
    
    // Corregir encabezados si es necesario y se solicitó
    if (!response.headersMatch && shouldFix) {
      console.log('Corrigiendo encabezados...');
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: '1:1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [expectedHeaders]
        }
      });
      
      console.log('Encabezados corregidos correctamente');
      response.fixed = true;
    }
    
    console.log('=== FIN DE VERIFICACIÓN DE ENCABEZADOS ===');
    return Response.json(response);
  } catch (error) {
    console.error('Error en la verificación de encabezados:', error.message);
    console.error('Stack trace:', error.stack);
    
    return Response.json(
      {
        success: false,
        error: 'Failed to verify headers',
        message: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

// Función para encontrar duplicados en un array
function findDuplicates(array) {
  const counts = {};
  const duplicates = [];
  
  for (const item of array) {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > 1 && !duplicates.includes(item)) {
      duplicates.push(item);
    }
  }
  
  return duplicates;
} 