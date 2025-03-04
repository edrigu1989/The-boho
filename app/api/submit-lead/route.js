// Endpoint para enviar datos a Google Sheets y manejar la redirección
import { GoogleSpreadsheet } from 'google-spreadsheet';

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
      // Usar múltiples nombres posibles para las variables de entorno
      const sheetId = process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEETS_SHEET_ID;
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
      const privateKey = (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY)?.replace(/\\n/g, '\n');
      
      console.log('Intentando conectar a Google Sheets con ID:', sheetId);
      console.log('Usando email de cliente:', clientEmail);
      console.log('Clave privada disponible:', privateKey ? 'Sí' : 'No');
      
      if (!sheetId || !clientEmail || !privateKey) {
        throw new Error('Faltan variables de entorno para Google Sheets');
      }
      
      const doc = new GoogleSpreadsheet(sheetId);
      
      await doc.useServiceAccountAuth({
        client_email: clientEmail,
        private_key: privateKey,
      });
      
      await doc.loadInfo();
      console.log('Conexión exitosa a Google Sheets');
      
      // Intentar usar el primer sheet o el sheet con nombre específico
      const sheetName = process.env.GOOGLE_SHEETS_TAB_NAME;
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
        specificNeeds: formData.specificNeeds?.label || '',
        workingWithAgent: formData.workingWithAgent?.label || '',
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