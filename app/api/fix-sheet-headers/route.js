import { google } from 'googleapis';

export async function GET(request) {
  console.log('=== INICIO DE CORRECCIÓN DE ENCABEZADOS ===');
  console.log('=== START OF HEADERS CORRECTION ===');
  
  try {
    // 1. Configurar la conexión con Google Sheets
    console.log('Obteniendo variables de entorno para Google Sheets...');
    console.log('Getting environment variables for Google Sheets...');
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    
    // Verificar variables de entorno
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      console.error('Faltan variables de entorno para Google Sheets');
      console.error('Missing environment variables for Google Sheets');
      console.error('SHEET_ID disponible:', !!SHEET_ID);
      console.error('SHEET_ID available:', !!SHEET_ID);
      console.error('CLIENT_EMAIL disponible:', !!CLIENT_EMAIL);
      console.error('CLIENT_EMAIL available:', !!CLIENT_EMAIL);
      console.error('PRIVATE_KEY disponible:', !!PRIVATE_KEY);
      console.error('PRIVATE_KEY available:', !!PRIVATE_KEY);
      
      throw new Error('Faltan variables de entorno para Google Sheets. Verifique la configuración en Vercel.');
    }
    
    // 2. NUEVO ENFOQUE: Procesamiento de la clave privada para resolver el error SSL
    console.log('Procesando la clave privada con nuevo enfoque...');
    console.log('Processing private key with new approach...');
    
    try {
      // Eliminar comillas dobles al principio y al final si existen
      if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
        PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
      }
      
      // Reemplazar todas las secuencias \\n con saltos de línea reales
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
      
      // Verificar si la clave no tiene formato PEM y formatearlo
      if (!PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----')) {
        // Si la clave ya está en formato de una sola línea, formatearlo correctamente
        PRIVATE_KEY = [
          '-----BEGIN PRIVATE KEY-----',
          ...PRIVATE_KEY.match(/.{1,64}/g) || [PRIVATE_KEY],
          '-----END PRIVATE KEY-----'
        ].join('\n');
      }
      
      // Verificar si la clave tiene el formato correcto después del procesamiento
      if (!PRIVATE_KEY.startsWith('-----BEGIN PRIVATE KEY-----')) {
        console.error('La clave privada no tiene el formato correcto después del procesamiento');
        console.error('The private key does not have the correct format after processing');
        console.error('Primeros caracteres:', PRIVATE_KEY.substring(0, 30));
        console.error('First characters:', PRIVATE_KEY.substring(0, 30));
      }
      
      console.log('Clave privada procesada correctamente');
      console.log('Private key processed correctly');
      console.error('Primera parte de la clave privada procesada:', PRIVATE_KEY.substring(0, 100) + '...');
      console.error('First part of the processed private key:', PRIVATE_KEY.substring(0, 100) + '...');
    } catch (keyError) {
      console.error('Error al procesar la clave privada:', keyError);
      console.error('Error processing private key:', keyError);
      throw new Error('Error al procesar formato de clave privada: ' + keyError.message);
    }
    
    // 3. Crear autenticación con método alternativo
    console.log('Creando cliente para Google Sheets con método alternativo...');
    console.log('Creating Google Sheets client with alternative method...');
    
    // Usar objeto de credenciales directamente
    const credentials = {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY
    };
    
    // Crear cliente con método alternativo
    const sheets = google.sheets({
      version: 'v4',
      auth: new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })
    });
    
    // 4. Definir los encabezados correctos para las 6 preguntas (en inglés)
    const correctHeaders = [
      'Full Name',
      'Email',
      'Phone',
      'Credit Score',
      'Down Payment Available',
      'Ready to Invest in 60 Days',
      'Score',
      'Classification',
      'Timestamp'
    ];
    
    // 5. Actualizar los encabezados
    console.log('Actualizando encabezados en Google Sheets...');
    console.log('Updating headers in Google Sheets...');
    
    try {
      const updateResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'A1:I1',
        valueInputOption: 'RAW',
        resource: {
          values: [correctHeaders]
        }
      });
      
      console.log('Encabezados actualizados correctamente:', updateResponse.status);
      console.log('Headers updated correctly:', updateResponse.status);
      
      // 6. Verificar encabezados actualizados
      const headersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'A1:I1'
      });
      
      const currentHeaders = headersResponse.data.values[0];
      console.log('Encabezados actuales:', currentHeaders);
      console.log('Current headers:', currentHeaders);
      
      // Verificar si hay duplicados
      const duplicates = findDuplicates(currentHeaders);
      if (duplicates.length > 0) {
        console.warn('Se detectaron encabezados duplicados:', duplicates);
        console.warn('Duplicate headers detected:', duplicates);
      }
      
      // 7. Devolver respuesta exitosa
      return Response.json({
        success: true,
        message: 'Headers updated successfully',
        status: updateResponse.status,
        headers: currentHeaders
      });
      
    } catch (sheetError) {
      console.error('Error al actualizar encabezados:', sheetError.message);
      console.error('Error updating headers:', sheetError.message);
      console.error('Detalles completos del error:', JSON.stringify(sheetError, null, 2));
      console.error('Complete error details:', JSON.stringify(sheetError, null, 2));
      
      // Manejo específico para errores de SSL/decodificación
      const errorMessage = sheetError.message || '';
      if (errorMessage.includes('DECODER') || errorMessage.includes('SSL')) {
        console.error('Error de SSL/decodificación detectado. Puede ser un problema con el formato de la clave privada.');
        console.error('SSL/decoding error detected. It may be a problem with the private key format.');
        console.error('Primera parte de la clave privada procesada:', PRIVATE_KEY.substring(0, 100) + '...');
        console.error('First part of the processed private key:', PRIVATE_KEY.substring(0, 100) + '...');
      }
      
      return Response.json({
        success: false,
        error: 'Google Sheets Error',
        message: `Could not update headers: ${sheetError.message}`
      }, { status: 200 });
    }
    
  } catch (error) {
    // Manejo general de errores
    console.error('Error al corregir encabezados:', error.message);
    console.error('Error fixing headers:', error.message);
    console.error('Stack trace:', error.stack);
    
    return Response.json({
      success: false,
      error: 'Failed to fix headers',
      message: error.message,
      details: 'Server error. Please try again later.'
    }, { status: 200 });
  } finally {
    console.log('=== FIN DE CORRECCIÓN DE ENCABEZADOS ===');
    console.log('=== END OF HEADERS CORRECTION ===');
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