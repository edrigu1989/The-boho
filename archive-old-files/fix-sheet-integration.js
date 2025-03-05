require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function fixSheetIntegration() {
  console.log('=== CORRECCIÓN DE INTEGRACIÓN CON GOOGLE SHEETS ===');
  
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
    
    // 3. Modificar el archivo route.js
    const routeFilePath = path.join(process.cwd(), 'app', 'api', 'submit-lead', 'route.js');
    
    if (!fs.existsSync(routeFilePath)) {
      throw new Error(`El archivo ${routeFilePath} no existe`);
    }
    
    console.log(`Modificando el archivo ${routeFilePath}...`);
    
    // Leer el contenido actual
    let content = fs.readFileSync(routeFilePath, 'utf8');
    
    // Crear una copia de seguridad
    const backupPath = `${routeFilePath}.backup`;
    fs.writeFileSync(backupPath, content);
    console.log(`Copia de seguridad creada en ${backupPath}`);
    
    // Modificar el código para usar un enfoque más robusto
    const newCode = `// Endpoint para enviar datos a Google Sheets y manejar la redirección
import { google } from 'googleapis';

export async function POST(request) {
  console.log('=== INICIO DEL PROCESAMIENTO DEL FORMULARIO ===');
  
  try {
    // 1. Obtener y procesar los datos del formulario
    console.log('Intentando leer los datos del formulario...');
    const formData = await request.json();
    console.log('Datos recibidos del formulario:', JSON.stringify(formData));
    
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
      console.log('Comillas removidas de la clave privada');
    }
    
    if (PRIVATE_KEY.includes('\\\\n')) {
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\\\n/g, '\\n');
      console.log('Caracteres \\\\n reemplazados por \\n');
    }
    
    if (PRIVATE_KEY.includes('\\n')) {
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\\n');
      console.log('Caracteres \\n reemplazados por saltos de línea reales');
    }
    
    // 3. Crear JWT para autenticación y cliente de Google Sheets
    console.log('Creando cliente de Google Sheets con JWT...');
    const auth = new google.auth.JWT(
      CLIENT_EMAIL,
      null,
      PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Verificar si el lead ya existe en la hoja de cálculo
    console.log('Verificando si el lead ya existe...');
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:C', // Solo necesitamos las columnas de nombre, email y teléfono
    });
    
    const rows = existingData.data.values || [];
    const isDuplicate = rows.some(row => {
      // Verificar si el email o teléfono ya existe
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
    
    // 4. Preparar datos para Google Sheets
    console.log('Preparando datos para Google Sheets...');
    
    // Extraer valores de los campos del formulario
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
    
    // Crear una fila con los datos
    const values = [
      [
        fullName,
        email,
        phone,
        contactMethod,
        buyingReason,
        timeline,
        firstTimeBuyer,
        budget,
        loanStatus,
        propertyType,
        creditScore,
        normalizedScore.toString(),
        classification,
        timestamp
      ]
    ];
    
    console.log('Datos a enviar a Google Sheets:', values);
    
    // 5. Enviar datos a Google Sheets usando la API directamente
    console.log('Enviando datos a Google Sheets...');
    
    // Primero, verificar si necesitamos crear los encabezados
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: '1:1', // Primera fila
    });
    
    const headers = headerResponse.data.values && headerResponse.data.values[0] ? headerResponse.data.values[0] : [];
    
    // Si no hay encabezados o hay menos de los que necesitamos, los creamos
    if (headers.length < 14) {
      console.log('Creando encabezados en la hoja...');
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
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: '1:1',
        valueInputOption: 'RAW',
        resource: {
          values: [expectedHeaders]
        }
      });
      
      console.log('Encabezados creados correctamente');
    }
    
    // Ahora añadimos los datos en la siguiente fila disponible
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A:N', // Rango de columnas A hasta N
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values,
      },
    });
    
    console.log('Respuesta de Google Sheets:', response.status);
    console.log('Datos guardados exitosamente en Google Sheets');

    // 6. Preparar la URL de redirección
    console.log('Preparando URL de redirección...');
    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
    console.log('URL de redirección:', redirectUrl);

    // 7. Retornar respuesta exitosa (sin incluir información de puntuación)
    console.log('Enviando respuesta exitosa al cliente (sin información de puntuación)');
    return Response.json({
      success: true,
      message: 'Form submitted successfully',
      redirectUrl: redirectUrl
    });
  } catch (error) {
    // 8. Manejar errores
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
}`;
    
    // Escribir el nuevo código
    fs.writeFileSync(routeFilePath, newCode);
    console.log('✅ Archivo modificado correctamente');
    
    console.log('\n=== INSTRUCCIONES ADICIONALES ===');
    console.log('1. Despliega los cambios a Vercel');
    console.log('2. Verifica que la integración funcione correctamente');
    console.log('3. Si sigues teniendo problemas, ejecuta el script check-sheet-headers.js para verificar los encabezados');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la función
fixSheetIntegration(); 