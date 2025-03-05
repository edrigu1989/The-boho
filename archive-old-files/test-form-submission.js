// Test script para simular una solicitud de formulario a la API
require('dotenv').config();
const http = require('http');

async function testFormSubmission() {
  console.log('Iniciando prueba de envío de formulario...');
  
  // Generar un ID único para cada prueba
  const timestamp = Date.now();
  const testSubmissionId = `test-${timestamp}-${Math.random().toString(36).substr(2, 5)}`;
  
  const generateTestEmail = () => `test_${timestamp}@example.com`;
  const generateTestPhone = () => `0${String(timestamp).substring(7)}`;
  
  const testEmail = generateTestEmail();
  const testPhone = generateTestPhone();
  
  // console.log(`Email de prueba: ${testEmail}`);
  // console.log(`Teléfono de prueba: ${testPhone}`);
  // console.log(`ID de envío: ${testSubmissionId}`);
  
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
  
  // Puertos comunes para Next.js
  const portsToTry = [3000, 3001, 3002, 3003, 3004, 3005];
  let success = false;
  
  // Función para hacer un solo envío
  const makeSubmission = (port) => {
    return new Promise((resolve) => {
      console.log(`\nIntentando enviar datos al puerto ${port}...`);
      
      const postData = JSON.stringify(testData);
      
      const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/submit-lead',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = http.request(options, (res) => {
        console.log(`Código de estado: ${res.statusCode}`);
        
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(responseData);
              console.log('Respuesta completa:');
              console.log(JSON.stringify(response, null, 2));
              
              console.log(`✅ Prueba exitosa en puerto ${port}: ${response.message}`);
              console.log(`URL de redirección: ${response.redirectUrl}`);
              
              if (response.note) {
                console.log(`Nota: ${response.note}`);
              }
              
              resolve({
                success: true,
                statusCode: res.statusCode,
                response
              });
            } catch (error) {
              console.error(`Error al procesar la respuesta: ${error.message}`);
              console.error(`Respuesta raw recibida: ${responseData.substring(0, 100)}...`);
              resolve({
                success: false,
                statusCode: res.statusCode,
                error: error.message
              });
            }
          } else {
            console.error(`❌ Error: Código de estado ${res.statusCode}`);
            console.error(`Respuesta: ${responseData.substring(0, 100)}...`);
            resolve({
              success: false,
              statusCode: res.statusCode
            });
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`❌ Error en la solicitud al puerto ${port}: ${error.message}`);
        resolve({
          success: false,
          error: error.message
        });
      });
      
      // Establecer un timeout para evitar esperas largas
      req.setTimeout(3000, () => {
        console.error(`⏱️ Timeout en la conexión al puerto ${port}`);
        req.destroy();
        resolve({
          success: false,
          error: 'Timeout'
        });
      });
      
      req.write(postData);
      req.end();
    });
  };
  
  // Intentar cada puerto hasta encontrar uno que funcione
  for (const port of portsToTry) {
    const result = await makeSubmission(port);
    if (result.success) {
      success = true;
      break;
    }
  }
  
  if (!success) {
    console.error('\n❌ No se pudo conectar a ningún puerto. Verifique si el servidor está corriendo.');
    console.error('Puertos intentados:', portsToTry.join(', '));
  }
}

testFormSubmission().catch(console.error); 