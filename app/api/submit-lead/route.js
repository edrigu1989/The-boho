// Endpoint para enviar datos a Google Sheets y manejar la redirección
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Calcular puntuación total (como referencia del código original)
    let totalScore = 0;
    Object.values(formData).forEach((field) => {
      if (field && typeof field.points === 'number') {
        totalScore += field.points;
      }
    });
    
    // Determinar clasificación
    let classification = '';
    
    if (totalScore >= 80) {
      classification = 'Hot Lead';
    } else if (totalScore >= 50) {
      classification = 'Warm Lead';
    } else {
      classification = 'Cold Lead';
    }
    
    // Enviar datos a Google Sheets
    try {
      // Usar los nombres específicos de las variables de entorno
      const sheetId = process.env.GOOGLE_SHEETS_SHEET_ID;
      const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
      const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const sheetName = process.env.GOOGLE_SHEETS_TAB_NAME;
      
      console.log('Intentando conectar a Google Sheets con ID:', sheetId);
      console.log('Usando email de cliente:', clientEmail);
      console.log('Clave privada disponible:', privateKey ? 'Sí' : 'No');
      console.log('Nombre de la hoja a usar:', sheetName || 'Primera hoja (default)');
      
      if (!sheetId || !clientEmail || !privateKey) {
        throw new Error('Faltan variables de entorno para Google Sheets');
      }
      
      // Crear un JWT para la autenticación (requerido en la versión 4.x)
      const serviceAccountAuth = new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
        ],
      });
      
      // Crear una instancia de GoogleSpreadsheet
      const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
      
      // Cargar la información del documento
      await doc.loadInfo();
      console.log('Conexión exitosa a Google Sheets');
      console.log('Título del documento:', doc.title);
      
      // Intentar usar el sheet con nombre específico o el primero
      let sheet;
      
      if (sheetName) {
        sheet = doc.sheetsByTitle[sheetName];
        if (!sheet) {
          console.log(`No se encontró la hoja "${sheetName}", usando la primera hoja`);
          sheet = doc.sheetsByIndex[0];
        }
      } else {
        sheet = doc.sheetsByIndex[0];
      }
      
      if (!sheet) {
        throw new Error('No se pudo encontrar una hoja válida en el documento');
      }
      
      console.log('Usando hoja:', sheet.title);
      
      // Preparar los datos para Google Sheets
      const rowData = {
        timestamp: new Date().toISOString(),
        fullName: formData.fullName?.value || '',
        email: formData.email?.value || '',
        phone: formData.phone?.value || '',
        contactMethod: formData.contactMethod?.label || '',
        buyingReason: formData.buyingReason?.label || '',
        timeline: formData.timeline?.label || '',
        firstTimeBuyer: formData.firstTimeBuyer?.label || '',
        budget: formData.budget?.label || '',
        loanStatus: formData.loanStatus?.label || '',
        propertyType: formData.propertyType?.label || '',
        creditScore: formData.creditScore?.label || '',
        score: totalScore,
        classification: classification,
      };
      
      // Añadir fila a Google Sheets
      await sheet.addRow(rowData);
      
      console.log('Datos guardados exitosamente en Google Sheets');
    } catch (sheetError) {
      console.error('Error guardando en Google Sheets:', sheetError);
      // No impedimos la redirección si hay un error con Google Sheets
      // Solo lo registramos para depuración
    }
    
    // URL de redirección específica para The Boho
    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'https://app.gohighlevel.com/v2/preview/vhVyjgV407B2HQnkNtHe?notrack=true';
    
    // Retornar resultado y URL de redirección
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        redirectUrl: redirectUrl,
        // Para propósitos de depuración:
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
    console.error('Error submitting form:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to submit form',
        message: error.message,
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