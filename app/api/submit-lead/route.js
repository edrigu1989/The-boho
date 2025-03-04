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
    
    // 3. Crear JWT para autenticación
    console.log('Creando autenticación JWT...');
    const auth = new google.auth.JWT(
      CLIENT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // 4. Verificar si el lead ya existe en la hoja de cálculo
    try {
      console.log('Verificando duplicados en la base de datos...');
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'A:C', // Solo necesitamos las columnas de nombre, email y teléfono
      });
      
      const rows = existingData.data.values || [];
      if (rows.length > 1) { // Asegurarnos de que hay datos más allá de los encabezados
        const isDuplicate = rows.slice(1).some(row => {
          return (email && row[1] === email) || (phone && row[2] === phone);
        });
        
        if (isDuplicate) {
          console.log('Lead duplicado detectado. No se agregará a la hoja de cálculo.');
          // Aún así redirigimos al usuario para una buena experiencia
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
      // Continuamos incluso si hay un error en la verificación de duplicados
    }
    
    // 5. Extraer valores para insertar en la hoja
    console.log('Preparando datos para inserción...');
    
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
    
    // 6. Crear una fila con los datos (usando valores fijos para los encabezados)
    const newRow = [
      fullName,                // A - Nombre completo
      email,                   // B - Email
      phone,                   // C - Teléfono
      contactMethod,           // D - Método de contacto
      buyingReason,            // E - Razón de compra
      timeline,                // F - Plazo de compra
      firstTimeBuyer,          // G - Primera vez
      budget,                  // H - Presupuesto
      loanStatus,              // I - Estado del préstamo
      propertyType,            // J - Tipo de propiedad
      creditScore,             // K - Puntaje de crédito
      normalizedScore,         // L - Score normalizado (como número)
      classification,          // M - Clasificación
      timestamp                // N - Timestamp
    ];
    
    // 7. Obtener el número de filas actuales para añadir en la siguiente disponible
    console.log('Obteniendo número de filas de la hoja...');
    
    let nextRow = 2; // Por defecto empezamos en la fila 2 (después de los encabezados)
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'A:A', // Solo necesitamos la primera columna para contar filas
      });
      
      if (response.data.values) {
        nextRow = response.data.values.length + 1;
      }
      
      console.log(`Insertando datos en la fila ${nextRow}`);
    } catch (error) {
      console.warn('Error al obtener el número de filas, usando fila 2:', error.message);
      // Continuamos con la fila 2 por defecto
    }
    
    // 8. Insertar los datos directamente en la fila correspondiente
    console.log('Insertando datos en la hoja...');
    
    try {
      // Asegurar que los encabezados estén correctos primero
      const headers = [
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
      
      // Verificar si necesitamos crear encabezados
      const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: '1:1', // Primera fila (encabezados)
      });
      
      // Si no hay encabezados o están vacíos, los creamos
      if (!headerCheck.data.values || headerCheck.data.values[0].length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: 'A1:N1',
          valueInputOption: 'RAW',
          resource: {
            values: [headers]
          }
        });
        console.log('Encabezados creados exitosamente');
      }
      
      // Insertar la nueva fila en la posición correspondiente
      const insertResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `A${nextRow}:N${nextRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [newRow]
        }
      });
      
      console.log('Respuesta de Google Sheets:', insertResponse.status);
      console.log('Datos guardados exitosamente en la fila', nextRow);
    } catch (error) {
      console.error('Error al insertar datos en Google Sheets:', error.message);
      throw new Error(`Error al guardar en Google Sheets: ${error.message}`);
    }

    // 9. Guardar el ID de submisión en el Set para prevenir duplicados
    if (submissionId) {
      processedSubmissionIds.add(submissionId);
      console.log(`ID de envío ${submissionId} guardado para prevenir envíos duplicados`);
    }

    // 10. Preparar y retornar respuesta exitosa
    console.log('Preparando URL de redirección...');
    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
    
    console.log('Enviando respuesta exitosa al cliente');
    return Response.json({
      success: true,
      message: 'Form submitted successfully',
      redirectUrl: redirectUrl
    });
  } catch (error) {
    // Manejar errores
    console.error('Error en el procesamiento del formulario:', error.message);
    console.error('Stack trace:', error.stack);
    
    return Response.json(
      {
        success: false,
        error: 'Failed to submit form',
        message: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  } finally {
    console.log('=== FIN DEL PROCESAMIENTO DEL FORMULARIO ===');
  }
}