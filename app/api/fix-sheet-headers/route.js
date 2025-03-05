import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== INICIO DE CORRECCIÓN DE ENCABEZADOS ===');
  console.log('=== START OF HEADERS CORRECTION ===');
  
  try {
    // 1. Obtener variables de entorno para Google Sheets
    console.log('Obteniendo variables de entorno para Google Sheets...');
    console.log('Getting environment variables for Google Sheets...');
    
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    
    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      throw new Error('Missing environment variables for Google Sheets');
    }
    
    // 2. Procesar la clave privada
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
      
      console.log('Clave privada procesada correctamente');
      console.log('Private key processed correctly');
      console.log('Primera parte de la clave privada procesada:', PRIVATE_KEY.substring(0, 100) + '...');
      console.log('First part of the processed private key:', PRIVATE_KEY.substring(0, 100) + '...');
    } catch (keyError) {
      console.error('Error al procesar la clave privada:', keyError);
      console.error('Error processing private key:', keyError);
      throw new Error('Error al procesar formato de clave privada: ' + keyError.message);
    }
    
    // 3. Crear autenticación con Google
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
    
    // 4. Actualizar los encabezados en la hoja de cálculo
    console.log('Actualizando encabezados en Google Sheets...');
    console.log('Updating headers in Google Sheets...');
    
    // Nuevos encabezados simplificados (solo 9 columnas)
    const newHeaders = [
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
    
    try {
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'A1:I1',
        valueInputOption: 'RAW',
        resource: {
          values: [newHeaders]
        }
      });
      
      console.log('Encabezados actualizados correctamente:', response.status);
      console.log('Headers updated correctly:', response.status);
      
      // Obtener encabezados actuales para verificar
      const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: '1:1'
      });
      
      console.log('Encabezados actuales:', headerCheck.data.values[0]);
      console.log('Current headers:', headerCheck.data.values[0]);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Headers updated successfully',
        headers: headerCheck.data.values[0]
      });
      
    } catch (sheetError) {
      console.error('Error al actualizar encabezados:', sheetError.message);
      console.error('Error updating headers:', sheetError.message);
      console.error('Detalles completos del error:', JSON.stringify(sheetError, null, 2));
      console.error('Complete error details:', JSON.stringify(sheetError, null, 2));
      throw new Error('Error al actualizar encabezados: ' + sheetError.message);
    }
    
  } catch (error) {
    console.error('Error al corregir encabezados:', error.message);
    console.error('Error correcting headers:', error.message);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
    
  } finally {
    console.log('=== FIN DE CORRECCIÓN DE ENCABEZADOS ===');
    console.log('=== END OF HEADERS CORRECTION ===');
  }
} 