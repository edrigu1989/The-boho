// Endpoint para enviar datos a Google Sheets y manejar la redirección
import { google } from 'googleapis';

// Set para almacenar los IDs de envíos ya procesados
// NOTA IMPORTANTE: En entornos serverless como Vercel, este Set se reinicia con cada instancia.
// Esto significa que solo protege contra duplicados dentro de la misma instancia de función,
// pero no entre diferentes invocaciones o servidores. La protección principal contra duplicados
// viene del frontend (debounce y estado isSubmitting) y la verificación por email/teléfono.
const processedSubmissionIds = new Set();

export async function POST(request) {
  console.log('=== INICIO DEL PROCESAMIENTO DEL FORMULARIO ===');
  
  try {
    // 1. Obtener y procesar los datos del formulario
    console.log('Intentando leer los datos del formulario...');
    const formData = await request.json();
    console.log('Datos recibidos del formulario:', JSON.stringify(formData));
    
    // Verificar si este envío ya ha sido procesado usando el ID único
    const submissionId = formData._submissionId;
    if (submissionId && processedSubmissionIds.has(submissionId)) {
      console.log(`Envío duplicado detectado con ID: ${submissionId}. No se procesará nuevamente.`);
      const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
      
      return Response.json({
        success: true,
        message: 'Form already submitted',
        redirectUrl: redirectUrl,
        note: 'Duplicate submission detected'
      });
    }
    
    // Extraer valores de los campos del formulario para verificación de duplicados
    const email = formData.email?.value || '';
    const phone = formData.phone?.value || '';
    
    // Calcular puntuación total (solo para uso interno)
    let totalScore = 0;
    for (const key in formData) {
      if (formData[key] && formData[key].points) {
        totalScore += formData[key].points;
      }
    }
    
    // Normalizar la puntuación para que esté entre 0 y 100
    const maxPossibleScore = 150; // Ajustar según la puntuación máxima posible
    const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);
    
    console.log('Puntuación original calculada:', totalScore);
    console.log('Puntuación normalizada (0-100):', normalizedScore);

    // Determinar clasificación basada en puntuación normalizada
    let classification = '';
    if (normalizedScore >= 70) {
      classification = 'Hot Lead';
    } else if (normalizedScore >= 40) {
      classification = 'Warm Lead';
    } else {
      classification = 'Cold Lead';
    }
    console.log('Clasificación determinada:', classification);

    // 2. Configurar la conexión con Google Sheets
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
    
    // 3. Procesar la clave privada para manejar correctamente el formato
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
    
    // 4. Crear la autenticación para Google Sheets usando la API de Google
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
    
    // 5. Verificar si el lead ya existe en la hoja de cálculo por email o teléfono
    let isDuplicate = false;
    
    try {
      console.log('Verificando si el lead ya existe...');
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'A:C', // Columnas con nombre, email y teléfono
      });
      
      const rows = existingData.data.values || [];
      
      if (rows.length > 1) { // Si hay datos más allá de los encabezados
        isDuplicate = rows.slice(1).some(row => {
          const rowEmail = row[1] ? row[1].toString().trim() : '';
          const rowPhone = row[2] ? row[2].toString().trim() : '';
          return (email && rowEmail === email) || (phone && rowPhone === phone);
        });
        
        if (isDuplicate) {
          console.log('Lead duplicado detectado. No se agregará a la hoja de cálculo.');
          const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
          
          return Response.json({
            success: true,
            message: 'Form submitted successfully',
            redirectUrl: redirectUrl,
            note: 'Lead already exists in database'
          });
        }
      }
    } catch (error) {
      console.error('Error al verificar duplicados:', error.message);
      // Continuamos con el proceso aunque haya un error en la verificación
    }
    
    // 6. Preparar los datos para inserción
    console.log('Preparando datos para Google Sheets...');
    
    const fullName = formData.fullName?.label || formData.fullName?.value || '';
    const contactMethod = formData.contactMethod?.label || '';
    const buyingReason = formData.buyingReason?.label || '';
    const timeline = formData.timeline?.label || '';
    const firstTimeBuyer = formData.firstTimeBuyer?.label || '';
    const budget = formData.budget?.label || '';
    const loanStatus = formData.loanStatus?.label || '';
    const propertyType = formData.propertyType?.label || '';
    const creditScore = formData.creditScore?.label || '';
    const timestamp = new Date().toISOString();
    
    // 7. Determinar la siguiente fila disponible
    let nextRow = 2; // Por defecto comenzamos en la fila 2 (después del encabezado)
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'A:A', // Solo necesitamos la primera columna para contar filas
      });
      
      if (response.data.values) {
        nextRow = response.data.values.length + 1;
      }
      
      console.log(`Se insertarán datos en la fila ${nextRow}`);
    } catch (error) {
      console.warn('Error al obtener el número de filas, usando fila 2 por defecto:', error.message);
      // Continuamos con la fila 2 por defecto
    }
    
    // 8. Insertar los datos en la hoja
    console.log('Insertando datos en Google Sheets...');
    
    try {
      // Crear arreglo con los valores a insertar
      const rowValues = [
        fullName,                   // A - Nombre completo
        email,                      // B - Email
        phone,                      // C - Teléfono
        contactMethod,              // D - Método de contacto
        buyingReason,               // E - Razón de compra
        timeline,                   // F - Plazo de compra
        firstTimeBuyer,             // G - Primera vez
        budget,                     // H - Presupuesto
        loanStatus,                 // I - Estado del préstamo
        propertyType,               // J - Tipo de propiedad
        creditScore,                // K - Puntaje de crédito
        normalizedScore.toString(), // L - Score normalizado
        classification,             // M - Clasificación
        timestamp                   // N - Timestamp
      ];
      
      // Actualizar los valores en la hoja
      const insertResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `A${nextRow}:N${nextRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [rowValues]
        }
      });
      
      console.log('Respuesta de Google Sheets:', insertResponse.status);
      console.log('Datos guardados exitosamente en Google Sheets');
      
      // Registrar el ID de envío para evitar duplicados en la misma instancia
      if (submissionId) {
        processedSubmissionIds.add(submissionId);
        console.log(`ID de envío ${submissionId} registrado para prevenir duplicados`);
      }
      
      // 9. Preparar y devolver la respuesta exitosa
      console.log('Preparando URL de redirección...');
      const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
      
      console.log('Enviando respuesta exitosa al cliente');
      return Response.json({
        success: true,
        message: 'Form submitted successfully',
        redirectUrl: redirectUrl
      });
      
    } catch (sheetError) {
      console.error('Error al guardar datos en Google Sheets:', sheetError.message);
      console.error('Detalles completos del error:', sheetError);
      
      return Response.json({
        success: false,
        error: 'Error en Google Sheets',
        message: `No se pudo guardar los datos: ${sheetError.message}`,
        redirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true'
      }, { status: 200 }); // Devolvemos 200 para no mostrar error al usuario
    }
    
  } catch (error) {
    // Manejo general de errores
    console.error('Error en el procesamiento del formulario:', error.message);
    console.error('Stack trace:', error.stack);
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    return Response.json({
      success: false,
      error: 'Failed to submit form',
      message: error.message,
      details: isProduction ? 'Error details hidden in production' : error.stack,
      redirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true'
    }, { status: 200 }); // Usar 200 en lugar de 500 para evitar alarmar al usuario
  } finally {
    console.log('=== FIN DEL PROCESAMIENTO DEL FORMULARIO ===');
  }
}