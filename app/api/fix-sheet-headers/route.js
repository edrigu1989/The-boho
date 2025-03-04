import { google } from 'googleapis';

export async function GET(request) {
  console.log('=== INICIO DE CORRECCIÓN DE ENCABEZADOS ===');
  
  try {
    // 1. Configurar la conexión con Google Sheets
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
    }
    
    if (PRIVATE_KEY.includes('\\n')) {
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
    }
    
    // 2. Crear JWT para autenticación
    console.log('Creando autenticación JWT...');
    const auth = new google.auth.JWT(
      CLIENT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // 3. Definir los encabezados correctos
    const correctHeaders = [
      'Nombre',
      'Email',
      'Teléfono',
      'Método de Contacto',
      'Razón de Compra',
      'Plazo de Compra', 
      'Primera Vez',
      'Presupuesto',
      'Estado de Préstamo',
      'Tipo de Propiedad',
      'Puntaje de Crédito',
      'Score',
      'Clasificación',
      'Fecha'
    ];
    
    // 4. Actualizar los encabezados
    console.log('Actualizando encabezados en Google Sheets...');
    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'A1:N1',
      valueInputOption: 'RAW',
      resource: {
        values: [correctHeaders]
      }
    });
    
    console.log('Encabezados actualizados correctamente:', updateResponse.status);
    
    // 5. Devolver respuesta exitosa
    return Response.json({
      success: true,
      message: 'Encabezados corregidos correctamente',
      status: updateResponse.status
    });
    
  } catch (error) {
    // Manejar errores
    console.error('Error al corregir encabezados:', error.message);
    console.error('Stack trace:', error.stack);
    
    return Response.json(
      {
        success: false,
        error: 'Failed to fix headers',
        message: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  } finally {
    console.log('=== FIN DE CORRECCIÓN DE ENCABEZADOS ===');
  }
}

// Función para encontrar duplicados en un array
function findDuplicates(array) {
  if (!array || !array.length) return [];
  
  const seen = {};
  const duplicates = [];
  
  array.forEach((item, index) => {
    if (!item) return; // Ignorar valores vacíos
    
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