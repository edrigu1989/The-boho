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
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
      
      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      });
      
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      
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
    
    // URL de redirección - Se puede configurar en variables de entorno
    const redirectUrl = process.env.REDIRECT_URL || 'https://default-redirect-url.com';
    
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