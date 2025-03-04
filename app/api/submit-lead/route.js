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
    
    // Verificar si tenemos la clave en formato base64 y decodificarla si es necesario
    const PRIVATE_KEY_BASE64 = process.env.GOOGLE_SHEETS_PRIVATE_KEY_BASE64;
    if (PRIVATE_KEY_BASE64) {
      try {
        // Decodificar la clave base64
        PRIVATE_KEY = Buffer.from(PRIVATE_KEY_BASE64, 'base64').toString();
        console.log('Usando clave privada en formato base64 decodificada');
      } catch (error) {
        console.error('Error al decodificar la clave privada base64:', error);
      }
    } else if (PRIVATE_KEY) {
      // Si la clave tiene comillas al principio y al final, quitarlas
      if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
        PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
      }
      console.log('Clave privada disponible:', PRIVATE_KEY ? 'Sí' : 'No');
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
      throw error;
    }

    // Redirigir a la página de agradecimiento o devolver respuesta
    return Response.json({ success: true, score: totalScore, classification });
  } catch (error) {
    console.error('Error en el procesamiento del formulario:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 