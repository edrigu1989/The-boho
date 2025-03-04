// Test script para simular una solicitud de formulario a la API
require('dotenv').config();
const fetch = require('node-fetch');

async function testFormSubmission() {
  console.log('Iniciando prueba de envío de formulario...');
  
  // Usar el mismo timestamp para ambos envíos para simular un doble clic
  const timestamp = Date.now();
  // Crear un submission ID único pero que se usará dos veces
  const testSubmissionId = `test-${timestamp}-${Math.random().toString(36).substr(2, 5)}`;
  
  const generateTestEmail = () => `test_${timestamp}@example.com`;
  const generateTestPhone = () => `0${String(timestamp).substring(7)}`;
  
  const testEmail = generateTestEmail();
  const testPhone = generateTestPhone();
  
  console.log(`Email de prueba: ${testEmail}`);
  console.log(`Teléfono de prueba: ${testPhone}`);
  console.log(`ID de envío: ${testSubmissionId}`);
  
  const testData = {
    _submissionId: testSubmissionId,
    fullName: { value: 'Test User', label: 'Test User', points: 0 },
    email: { value: testEmail, label: testEmail, points: 0 },
    phone: { value: testPhone, label: testPhone, points: 0 },
    contactMethod: { value: 'phone', label: 'Phone/WhatsApp', points: 10 },
    buyingReason: { value: 'firstHome', label: 'First Home', points: 15 },
    timeline: { value: 'immediately', label: 'Immediately (0-3 months)', points: 20 },
    firstTimeBuyer: { value: 'yes', label: 'Yes', points: 10 },
    budget: { value: 'range3', label: '$500,000-$750,000', points: 15 },
    loanStatus: { value: 'preApproved', label: 'Pre-approved', points: 20 },
    propertyType: { value: 'singleFamily', label: 'Single Family Home', points: 10 },
    creditScore: { value: 'excellent', label: '740 or Higher', points: 25 }
  };
  
  const ports = [3000];
  const timeout = 10000;
  
  // Función para hacer envío
  const makeSubmission = async (attempt) => {
    console.log(`\nIntentando envío ${attempt}...`);
    
    for (const port of ports) {
      console.log(`Intentando enviar datos al puerto ${port}...`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`http://localhost:${port}/api/submit-lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Código de estado: ${response.status}`);
        const responseData = await response.json();
        console.log('Respuesta completa:', JSON.stringify(responseData, null, 2));
        
        if (response.ok) {
          console.log(`✅ Prueba exitosa en puerto ${port}: ${responseData.message || 'El formulario se envió correctamente'}`);
          if (responseData.redirectUrl) {
            console.log(`URL de redirección: ${responseData.redirectUrl}`);
          }
          if (responseData.note) {
            console.log(`Nota: ${responseData.note}`);
          }
          return true;
        } else {
          console.log(`❌ Error en puerto ${port}: ${responseData.error || 'Error desconocido'}`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log(`⏱️ Timeout en puerto ${port} después de ${timeout}ms`);
        } else {
          console.log(`❌ Error en puerto ${port}: ${error.message}`);
        }
      }
    }
    
    return false;
  };
  
  // Hacer primer envío
  const firstSubmissionResult = await makeSubmission(1);
  
  // Hacer segundo envío inmediatamente con el mismo ID
  const secondSubmissionResult = await makeSubmission(2);
  
  if (!firstSubmissionResult && !secondSubmissionResult) {
    console.log('\n❌ No se pudo conectar a ningún puerto. Verifique si el servidor está corriendo.');
  }
}

testFormSubmission().catch(console.error); 