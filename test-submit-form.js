// Script para probar el endpoint de envío de formulario
const fetch = require('node-fetch');

console.log('Iniciando script de prueba...');

async function testSubmitForm() {
  console.log('Iniciando prueba de envío de formulario...');
  
  try {
    // Crear datos de prueba con un ID único
    const timestamp = Date.now();
    const testData = {
      _submissionId: `test-${timestamp}`,
      fullName: {
        value: `Test User ${timestamp}`,
        label: `Test User ${timestamp}`,
        points: 0
      },
      email: {
        value: `test_${timestamp}@example.com`,
        label: `test_${timestamp}@example.com`,
        points: 0
      },
      phone: {
        value: `${timestamp.toString().slice(-8)}`,
        label: `${timestamp.toString().slice(-8)}`,
        points: 0
      },
      contactMethod: {
        value: "email",
        label: "Email",
        points: 10
      },
      buyingReason: {
        value: "primary_residence",
        label: "Primary Residence",
        points: 30
      },
      timeline: {
        value: "immediate",
        label: "Immediately (0-3 months)",
        points: 30
      },
      firstTimeBuyer: {
        value: "yes",
        label: "Yes",
        points: 10
      },
      budget: {
        value: "above_500k",
        label: "Above $500k",
        points: 20
      },
      loanStatus: {
        value: "pre_approved",
        label: "Pre-approved",
        points: 20
      },
      propertyType: {
        value: "single_family",
        label: "Single Family Home",
        points: 10
      },
      creditScore: {
        value: "excellent",
        label: "Excellent (720+)",
        points: 20
      }
    };

    console.log(`Enviando datos con ID: ${testData._submissionId}`);
    console.log(`Email de prueba: ${testData.email.value}`);
    console.log(`Teléfono de prueba: ${testData.phone.value}`);
    
    // Determinar en qué puerto está corriendo el servidor
    let port = 3000;
    for (let i = 0; i <= 10; i++) {
      try {
        const testPort = 3000 + i;
        console.log(`Probando puerto ${testPort}...`);
        const testResponse = await fetch(`http://localhost:${testPort}`, { 
          method: 'HEAD',
          timeout: 1000
        }).catch(() => null);
        
        if (testResponse) {
          port = testPort;
          console.log(`Servidor encontrado en puerto ${port}`);
          break;
        }
      } catch (e) {
        // Continuar con el siguiente puerto
      }
    }
    
    // Enviar solicitud al endpoint
    const url = `http://localhost:${port}/api/submit-lead`;
    console.log(`Enviando solicitud a: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    // Verificar respuesta
    const responseText = await response.text();
    console.log(`Respuesta en texto: ${responseText}`);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Error al analizar la respuesta JSON:', e);
      console.log('Respuesta no es JSON válido:', responseText);
      return;
    }
    
    console.log(`Status: ${response.status}`);
    console.log('Respuesta:', result);
    
    if (response.status === 200 && result.success) {
      console.log('✅ Prueba exitosa: Formulario enviado correctamente');
      console.log(`URL de redirección: ${result.redirectUrl}`);
      if (result.note) {
        console.log(`Nota: ${result.note}`);
      }
    } else {
      console.log('❌ Prueba fallida: Error al enviar el formulario');
      if (result.error) console.error('Error:', result.error);
      if (result.message) console.error('Mensaje:', result.message);
      if (result.details) console.error('Detalles:', result.details);
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar prueba
console.log('Ejecutando prueba...');
testSubmitForm().catch(err => {
  console.error('Error fatal en la prueba:', err);
}); 