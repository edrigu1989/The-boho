// Endpoint para enviar datos a Google Sheets y manejar la redirección
// Endpoint to send data to Google Sheets and handle redirection
import { google } from 'googleapis';

// Set para almacenar los IDs de envíos ya procesados
// NOTA IMPORTANTE: En entornos serverless como Vercel, este Set se reinicia con cada instancia.
// Esto significa que solo protege contra duplicados dentro de la misma instancia de función,
// pero no entre diferentes invocaciones o servidores. La protección principal contra duplicados
// viene del frontend (debounce y estado isSubmitting) y la verificación por email/teléfono.
// Set to store already processed submission IDs
// IMPORTANT NOTE: In serverless environments like Vercel, this Set resets with each instance.
// This means it only protects against duplicates within the same function instance,
// but not between different invocations or servers. The main protection against duplicates
// comes from the frontend (debounce and isSubmitting state) and email/phone verification.
const processedSubmissionIds = new Set();

export async function POST(request) {
  console.log('=== INICIO DEL PROCESAMIENTO DEL FORMULARIO ===');
  console.log('=== FORM PROCESSING STARTED ===');
  
  try {
    // 1. Obtener y procesar los datos del formulario
    // 1. Get and process form data
    console.log('Intentando leer los datos del formulario...');
    console.log('Trying to read form data...');
    const formData = await request.json();
    console.log('Datos recibidos del formulario:', JSON.stringify(formData));
    console.log('Form data received:', JSON.stringify(formData));
    
    // Verificar si este envío ya ha sido procesado usando el ID único
    // Check if this submission has already been processed using the unique ID
    const submissionId = formData._submissionId;
    if (submissionId && processedSubmissionIds.has(submissionId)) {
      console.log(`Envío duplicado detectado con ID: ${submissionId}. No se procesará nuevamente.`);
      console.log(`Duplicate submission detected with ID: ${submissionId}. Will not process again.`);
      const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
      
      return Response.json({
        success: true,
        message: 'Form already submitted',
        redirectUrl: redirectUrl,
        note: 'Duplicate submission detected'
      });
    }
    
    // Extraer valores de los campos del formulario para verificación de duplicados
    // Extract values from form fields for duplicate verification
    const email = formData.email?.value || '';
    const phone = formData.phone?.value || '';
    
    // Calcular puntuación total (solo para uso interno)
    // Calculate total score (for internal use only)
    let totalScore = 0;
    for (const key in formData) {
      if (formData[key] && formData[key].points) {
        totalScore += formData[key].points;
      }
    }
    
    // Nuevo sistema de puntuación máxima basado en las 6 preguntas
    // Puntuación máxima: creditScore(30) + downPayment(40) + readyToInvest(30) = 100
    // New maximum scoring system based on 6 questions
    // Maximum score: creditScore(30) + downPayment(40) + readyToInvest(30) = 100
    const maxPossibleScore = 100;
    const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);
    
    console.log('Puntuación original calculada:', totalScore);
    console.log('Original score calculated:', totalScore);
    console.log('Puntuación normalizada (0-100):', normalizedScore);
    console.log('Normalized score (0-100):', normalizedScore);

    // Determinar clasificación basada en puntuación normalizada
    // Determine classification based on normalized score
    let classification = '';
    if (normalizedScore >= 70) {
      classification = 'Hot Lead';
    } else if (normalizedScore >= 40) {
      classification = 'Warm Lead';
    } else {
      classification = 'Cold Lead';
    }
    console.log('Clasificación determinada:', classification);
    console.log('Classification determined:', classification);

    // 2. Configurar la conexión con Google Sheets
    // 2. Configure the Google Sheets connection
    console.log('Obteniendo variables de entorno para Google Sheets...');
    console.log('Getting environment variables for Google Sheets...');
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    
    // Verificar variables de entorno
    // Verify environment variables
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
      throw new Error('Missing environment variables for Google Sheets. Check the configuration in Vercel.');
    }
    
    // 3. NUEVO ENFOQUE: Procesamiento de la clave privada para resolver el error SSL
    // 3. NEW APPROACH: Private key processing to resolve SSL error
    console.log('Procesando la clave privada con nuevo enfoque...');
    console.log('Processing private key with new approach...');
    
    try {
      // Eliminar comillas dobles al principio y al final si existen
      // Remove double quotes at the beginning and end if they exist
      if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
        PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
      }
      
      // Reemplazar todas las secuencias \\n con saltos de línea reales
      // Replace all \\n sequences with actual line breaks
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
      
      // Verificar si la clave no tiene formato PEM y formatearlo
      // Check if the key doesn't have PEM format and format it
      if (!PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----')) {
        // Si la clave ya está en formato de una sola línea, formatearlo correctamente
        // If the key is already in single-line format, format it correctly
        PRIVATE_KEY = [
          '-----BEGIN PRIVATE KEY-----',
          ...PRIVATE_KEY.match(/.{1,64}/g) || [PRIVATE_KEY],
          '-----END PRIVATE KEY-----'
        ].join('\n');
      }
      
      console.log('Clave privada procesada correctamente');
      console.log('Private key processed correctly');
    } catch (keyError) {
      console.error('Error al procesar la clave privada:', keyError);
      console.error('Error processing private key:', keyError);
      throw new Error('Error al procesar formato de clave privada: ' + keyError.message);
      throw new Error('Error processing private key format: ' + keyError.message);
    }
    
    // 4. Crear autenticación con método alternativo
    // 4. Create authentication with alternative method
    console.log('Creando cliente para Google Sheets con método alternativo...');
    console.log('Creating Google Sheets client with alternative method...');
    
    // Usar objeto de credenciales directamente
    // Use credentials object directly
    const credentials = {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY
    };
    
    // Crear cliente con método alternativo
    // Create client with alternative method
    const sheets = google.sheets({
      version: 'v4',
      auth: new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })
    });
    
    // 5. Verificar si el lead ya existe en la hoja de cálculo por email o teléfono
    // 5. Check if the lead already exists in the spreadsheet by email or phone
    let isDuplicate = false;
    
    try {
      console.log('Verificando si el lead ya existe...');
      console.log('Checking if lead already exists...');
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'A:C', // Columnas con nombre, email y teléfono
                      // Columns with name, email and phone
      });
      
      const rows = existingData.data.values || [];
      
      if (rows.length > 1) { // Si hay datos más allá de los encabezados
                             // If there is data beyond the headers
        isDuplicate = rows.slice(1).some(row => {
          const rowEmail = row[1] ? row[1].toString().trim() : '';
          const rowPhone = row[2] ? row[2].toString().trim() : '';
          return (email && rowEmail === email) || (phone && rowPhone === phone);
        });
        
        if (isDuplicate) {
          console.log('Lead duplicado detectado. No se agregará a la hoja de cálculo.');
          console.log('Duplicate lead detected. Will not be added to spreadsheet.');
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
      console.error('Error checking for duplicates:', error.message);
      console.error('Detalles del error de verificación:', error);
      console.error('Verification error details:', error);
      // Continuamos con el proceso aunque haya un error en la verificación
      // We continue with the process even if there is an error in verification
    }
    
    // 6. Preparar los datos para inserción
    // 6. Prepare data for insertion
    console.log('Preparando datos para Google Sheets...');
    console.log('Preparing data for Google Sheets...');
    
    const fullName = formData.fullName?.label || formData.fullName?.value || '';
    const creditScore = formData.creditScore?.label || '';
    const downPayment = formData.downPayment?.label || '';
    const readyToInvest = formData.readyToInvest?.label || '';
    const timestamp = new Date().toISOString();
    
    // 7. Determinar la siguiente fila disponible
    // 7. Determine the next available row
    let nextRow = 2; // Por defecto comenzamos en la fila 2 (después del encabezado)
                     // By default we start at row 2 (after the header)
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'A:A', // Solo necesitamos la primera columna para contar filas
                      // We only need the first column to count rows
      });
      
      if (response.data.values) {
        nextRow = response.data.values.length + 1;
      }
      
      console.log(`Se insertarán datos en la fila ${nextRow}`);
      console.log(`Data will be inserted in row ${nextRow}`);
    } catch (error) {
      console.warn('Error al obtener el número de filas, usando fila 2 por defecto:', error.message);
      console.warn('Error getting the number of rows, using row 2 by default:', error.message);
      // Continuamos con la fila 2 por defecto
      // We continue with row 2 by default
    }
    
    // 8. Insertar los datos en la hoja
    // 8. Insert data into the sheet
    console.log('Insertando datos en Google Sheets...');
    console.log('Inserting data into Google Sheets...');
    
    try {
      // Crear arreglo con los valores a insertar para las 6 preguntas
      // Create array with values to insert for the 6 questions
      const rowValues = [
        fullName,                   // A - Nombre completo / Full name
        email,                      // B - Email
        phone,                      // C - Teléfono / Phone
        creditScore,                // D - Puntaje de crédito / Credit score
        downPayment,                // E - Pago inicial disponible / Available down payment
        readyToInvest,              // F - Listo para invertir en 60 días / Ready to invest in 60 days
        normalizedScore.toString(), // G - Score normalizado / Normalized score
        classification,             // H - Clasificación / Classification
        timestamp                   // I - Timestamp
      ];
      
      // Actualizar los valores en la hoja
      // Update values in the sheet
      const insertResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `A${nextRow}:I${nextRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [rowValues]
        }
      });
      
      console.log('Respuesta de Google Sheets:', insertResponse.status);
      console.log('Google Sheets response:', insertResponse.status);
      console.log('Datos guardados exitosamente en Google Sheets');
      console.log('Data successfully saved to Google Sheets');
      
      // Registrar el ID de envío para evitar duplicados en la misma instancia
      // Register the submission ID to avoid duplicates in the same instance
      if (submissionId) {
        processedSubmissionIds.add(submissionId);
        console.log(`ID de envío ${submissionId} registrado para prevenir duplicados`);
        console.log(`Submission ID ${submissionId} registered to prevent duplicates`);
      }
      
      // 9. Preparar y devolver la respuesta exitosa
      // 9. Prepare and return successful response
      console.log('Preparando URL de redirección...');
      console.log('Preparing redirect URL...');
      const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
      
      console.log('Enviando respuesta exitosa al cliente');
      console.log('Sending successful response to client');
      return Response.json({
        success: true,
        message: 'Form submitted successfully',
        redirectUrl: redirectUrl
      });
      
    } catch (sheetError) {
      console.error('Error al guardar datos en Google Sheets:', sheetError.message);
      console.error('Error saving data to Google Sheets:', sheetError.message);
      console.error('Detalles completos del error:', JSON.stringify(sheetError, null, 2));
      console.error('Complete error details:', JSON.stringify(sheetError, null, 2));
      
      // Manejo específico para errores de SSL/decodificación
      // Specific handling for SSL/decoding errors
      const errorMessage = sheetError.message || '';
      if (errorMessage.includes('DECODER') || errorMessage.includes('SSL')) {
        console.error('Error de SSL/decodificación detectado. Puede ser un problema con el formato de la clave privada.');
        console.error('SSL/decoding error detected. It could be an issue with the private key format.');
        console.error('Primera parte de la clave privada procesada:', PRIVATE_KEY.substring(0, 100) + '...');
        console.error('First part of the processed private key:', PRIVATE_KEY.substring(0, 100) + '...');
      }
      
      return Response.json({
        success: false,
        error: 'Error in Google Sheets',
        message: `No se pudo guardar los datos: ${sheetError.message}`,
        redirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true'
      }, { status: 200 }); // Devolvemos 200 para no mostrar error al usuario
    }
    
  } catch (error) {
    // Manejo general de errores
    console.error('Error en el procesamiento del formulario:', error.message);
    console.error('Stack trace:', error.stack);
    
    return Response.json({
      success: false,
      error: 'Failed to submit form',
      message: error.message,
      details: 'Server error. Please try again later.',
      redirectUrl: process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true'
    }, { status: 200 }); // Usar 200 en lugar de 500 para evitar alarmar al usuario
  } finally {
    console.log('=== FIN DEL PROCESAMIENTO DEL FORMULARIO ===');
    console.log('=== END OF FORM PROCESSING ===');
  }
}