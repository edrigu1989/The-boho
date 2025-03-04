// Endpoint para enviar datos a Google Sheets y manejar la redirección
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(request) {
  try {
    const formData = await request.json();
    console.log('Datos recibidos del formulario (raw):', JSON.stringify(formData));
    
    // Analizar la estructura de formData para depuración
    console.log('Estructura de formData:');
    for (const key in formData) {
      console.log(`- ${key}: ${typeof formData[key]} ${formData[key] ? 'tiene valor' : 'está vacío'}`);
      if (formData[key] && typeof formData[key] === 'object') {
        console.log(`  - Propiedades de ${key}: [ ${Object.keys(formData[key]).join("', '") } ]`);
      }
    }

    // Calcular puntuación total
    let totalScore = 0;
    for (const key in formData) {
      if (formData[key] && formData[key].points) {
        totalScore += formData[key].points;
      }
    }
    console.log('Puntuación total calculada:', totalScore);

    // Determinar clasificación basada en puntuación
    let classification = '';
    if (totalScore >= 100) {
      classification = 'Hot Lead';
    } else if (totalScore >= 70) {
      classification = 'Warm Lead';
    } else {
      classification = 'Cold Lead';
    }
    console.log('Clasificación determinada:', classification);

    // Conectar a Google Sheets
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || 'Data';
    
    console.log('Intentando conectar a Google Sheets con ID:', SHEET_ID);
    console.log('Usando email de cliente:', CLIENT_EMAIL);
    
    // Verificar que tenemos todas las variables de entorno necesarias
    if (!SHEET_ID) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_SHEET_ID');
    }
    
    if (!CLIENT_EMAIL) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_CLIENT_EMAIL');
    }
    
    if (!PRIVATE_KEY) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_PRIVATE_KEY');
    }
    
    // Procesar la clave privada para manejar diferentes formatos
    if (PRIVATE_KEY) {
      // 1. Si tiene comillas al principio y al final, quitarlas
      if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
        PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
      }
      
      // 2. Asegurarse de que los \n se conviertan en saltos de línea reales
      if (PRIVATE_KEY.includes('\\n')) {
        PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
      }
      
      console.log('Clave privada procesada y disponible');
    } else {
      console.error('No se encontró la clave privada en las variables de entorno');
    }
    
    console.log('Nombre de la hoja a usar:', TAB_NAME);

    // Crear JWT para autenticación
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Inicializar el documento
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    console.log('Conexión exitosa a Google Sheets');
    console.log('Título del documento:', doc.title);

    // Obtener la hoja de cálculo
    const sheet = doc.sheetsByTitle[TAB_NAME];
    if (!sheet) {
      throw new Error(`Hoja "${TAB_NAME}" no encontrada en el documento`);
    }
    console.log('Usando hoja:', sheet.title);

    // Obtener los encabezados de la hoja
    const rows = await sheet.getRows();
    const headers = sheet.headerValues;
    console.log('Encabezados de la hoja:', headers);

    // Preparar datos para Google Sheets con nombres de columnas exactos
    const rowData = {
      'Full name': formData.fullName?.label || formData.fullName?.value || '',
      'Email': formData.email?.label || formData.email?.value || '',
      'Phone': formData.phone?.label || formData.phone?.value || '',
      'Contact Method': formData.contactMethod?.label || '',
      'primary reason for buying': formData.buyingReason?.label || '',
      'purchase timeline': formData.timeline?.label || '',
      'first-time buyer': formData.firstTimeBuyer?.label || '',
      'budget range': formData.budget?.label || '',
      'loan approval status': formData.loanStatus?.label || '',
      'type of property': formData.propertyType?.label || '',
      'credit score': formData.creditScore?.label || '',
      'Score': totalScore,
      'Classification': classification,
      'Timestamp': new Date().toISOString()
    };

    console.log('Datos a enviar a Google Sheets:', rowData);

    // Añadir fila a Google Sheets
    try {
      const addedRow = await sheet.addRow(rowData);
      console.log('Datos guardados exitosamente en Google Sheets, fila:', addedRow.rowIndex);
    } catch (error) {
      console.error('Error al añadir fila a Google Sheets:', error);
      throw new Error(`Error al guardar en Google Sheets: ${error.message}`);
    }

    // URL de redirección específica para The Boho
    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
    console.log('URL de redirección:', redirectUrl);

    // Retornar resultado y URL de redirección
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        redirectUrl: redirectUrl,
        score: totalScore,
        classification: classification,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error en el procesamiento del formulario:', error);
    console.error('Stack trace:', error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to submit form',
        message: error.message,
        details: error.stack,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 