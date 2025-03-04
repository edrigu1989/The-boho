// Endpoint para enviar datos a Google Sheets y manejar la redirección
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(request) {
  try {
    // 1. Obtener y procesar los datos del formulario
    const formData = await request.json();
    console.log('Datos recibidos del formulario:', JSON.stringify(formData));
    
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

    // 2. Configurar la conexión con Google Sheets
    const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || 'Data';
    
    // Verificar variables de entorno
    if (!SHEET_ID) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_SHEET_ID');
    }
    
    if (!CLIENT_EMAIL) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_CLIENT_EMAIL');
    }
    
    if (!PRIVATE_KEY) {
      throw new Error('Falta la variable de entorno GOOGLE_SHEETS_PRIVATE_KEY');
    }
    
    // Procesar la clave privada
    if (PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) {
      PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
    }
    
    if (PRIVATE_KEY.includes('\\n')) {
      PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
    }
    
    // 3. Crear JWT para autenticación
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    // 4. Inicializar el documento
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    console.log('Conexión exitosa a Google Sheets');
    console.log('Título del documento:', doc.title);
    
    // 5. Obtener la hoja de cálculo
    const sheet = doc.sheetsByTitle[TAB_NAME];
    if (!sheet) {
      throw new Error(`Hoja "${TAB_NAME}" no encontrada en el documento`);
    }
    console.log('Usando hoja:', sheet.title);
    
    // 6. Preparar datos para Google Sheets con nombres de columnas exactos
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

    // 7. Añadir fila a Google Sheets
    const addedRow = await sheet.addRow(rowData);
    console.log('Datos guardados exitosamente en Google Sheets');

    // 8. Preparar la URL de redirección
    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
    console.log('URL de redirección:', redirectUrl);

    // 9. Retornar respuesta exitosa
    return Response.json({
      success: true,
      message: 'Form submitted successfully',
      redirectUrl: redirectUrl,
      score: totalScore,
      classification: classification,
    });
  } catch (error) {
    // 10. Manejar errores
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
  }
} 