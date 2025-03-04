import { google } from 'googleapis';

export async function GET(request) {
  console.log('=== INICIO DE CORRECCIÓN DE ENCABEZADOS ===');
  
  try {
    // 1. Configurar la conexión con Google Sheets
    console.log('Obteniendo variables de entorno para Google Sheets...');
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const PRIVATE_KEY_RAW = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    
    // Verificar variables de entorno
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY_RAW) {
      throw new Error('Faltan variables de entorno para Google Sheets');
    }
    
    console.log('SHEET_ID:', SHEET_ID ? 'Disponible' : 'No disponible');
    console.log('CLIENT_EMAIL:', CLIENT_EMAIL ? 'Disponible' : 'No disponible');
    console.log('PRIVATE_KEY:', PRIVATE_KEY_RAW ? 'Disponible' : 'No disponible');
    
    // 2. Procesar la clave privada para manejar correctamente el formato
    // Este es un paso crítico para evitar errores de SSL/decodificación
    let PRIVATE_KEY = PRIVATE_KEY_RAW;
    
    console.log('Procesando la clave privada...');
    
    // Eliminar comillas adicionales si existen
    if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
      PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
    }
    
    // Reemplazar secuencias de escape con saltos de línea reales
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
    
    // Asegurar que la clave tiene el formato PEM correcto
    if (!PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----')) {
      PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\n${PRIVATE_KEY}\n-----END PRIVATE KEY-----`;
    }
    
    // 3. Crear la autenticación para Google Sheets usando la API de Google
    console.log('Creando cliente para Google Sheets...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    // Obtener un cliente autenticado
    const authClient = await auth.getClient();
    
    // Crear el cliente de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    // 4. Definir los encabezados correctos
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
    
    // 5. Actualizar los encabezados
    console.log('Actualizando encabezados en Google Sheets...');
    
    try {
      const updateResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'A1:N1',
        valueInputOption: 'RAW',
        resource: {
          values: [correctHeaders]
        }
      });
      
      console.log('Encabezados actualizados correctamente:', updateResponse.status);
      
      // 6. Verificar encabezados actualizados
      const headersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'A1:N1'
      });
      
      const currentHeaders = headersResponse.data.values[0];
      console.log('Encabezados actuales:', currentHeaders);
      
      // Verificar si hay duplicados
      const duplicates = findDuplicates(currentHeaders);
      if (duplicates.length > 0) {
        console.warn('Se detectaron encabezados duplicados:', duplicates);
      }
      
      // 7. Devolver respuesta exitosa
      return Response.json({
        success: true,
        message: 'Encabezados corregidos correctamente',
        status: updateResponse.status,
        headers: currentHeaders
      });
      
    } catch (sheetError) {
      console.error('Error al actualizar encabezados:', sheetError.message);
      console.error('Detalles completos del error:', sheetError);
      
      return Response.json({
        success: false,
        error: 'Error en Google Sheets',
        message: `No se pudo actualizar los encabezados: ${sheetError.message}`
      }, { status: 200 }); // Devolvemos 200 para no mostrar error al usuario
    }
    
  } catch (error) {
    // Manejo general de errores
    console.error('Error al corregir encabezados:', error.message);
    console.error('Stack trace:', error.stack);
    
    return Response.json({
      success: false,
      error: 'Failed to fix headers',
      message: error.message,
      details: error.stack,
    }, { status: 200 }); // Usar 200 en lugar de 500 para evitar alarmar al usuario
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