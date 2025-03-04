// Test script para simular una solicitud de formulario a la API
require('dotenv').config();
// En Node.js v18+ podemos usar fetch nativo, pero para versiones anteriores:
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFormSubmission() {
  console.log('Iniciando prueba de envío de formulario...');
  
  // Datos de prueba que simulan el formulario completo
  const testFormData = {
    fullName: { value: 'Usuario de Prueba', label: 'Usuario de Prueba', points: 0 },
    email: { value: 'test@example.com', label: 'test@example.com', points: 0 },
    phone: { value: '123456789', label: '123456789', points: 0 },
    contactMethod: { value: 'email', label: 'Email', points: 10 },
    buyingReason: { value: 'primary_residence', label: 'Primary Residence', points: 30 },
    timeline: { value: 'immediate', label: 'Immediately (0-3 months)', points: 30 },
    firstTimeBuyer: { value: 'yes', label: 'Yes', points: 10 },
    budget: { value: 'above_500k', label: 'Above $500k', points: 20 },
    loanStatus: { value: 'pre_approved', label: 'Pre-approved', points: 20 },
    propertyType: { value: 'single_family', label: 'Single Family Home', points: 10 },
    creditScore: { value: 'excellent', label: 'Excellent (720+)', points: 20 }
  };

  try {
    console.log('Enviando datos al endpoint local...');
    const response = await fetch('http://localhost:3000/api/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFormData),
    });

    const responseData = await response.json();
    
    console.log('Código de estado:', response.status);
    console.log('Respuesta completa:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Prueba exitosa: El formulario se envió correctamente');
      console.log('Puntuación:', responseData.score);
      console.log('Clasificación:', responseData.classification);
      console.log('URL de redirección:', responseData.redirectUrl);
    } else {
      console.log('❌ Prueba fallida: Error al enviar el formulario');
      console.log('Mensaje de error:', responseData.message);
      console.log('Detalles:', responseData.details);
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testFormSubmission(); 