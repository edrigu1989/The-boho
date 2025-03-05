// Script para probar la detección de duplicados
const http = require('http');

console.log('Iniciando prueba de detección de duplicados...');

// Generar un ID de envío único que usaremos para ambas solicitudes
const submissionId = `test-${Date.now()}`;
console.log(`ID de envío para prueba: ${submissionId}`);

// Crear datos de prueba con el mismo ID para ambos envíos
function createTestData() {
  return {
    _submissionId: submissionId,
    fullName: {
      value: "Test User",
      label: "Test User",
      points: 0
    },
    email: {
      value: "test@example.com",
      label: "test@example.com",
      points: 0
    },
    phone: {
      value: "123456789",
      label: "123456789",
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
}

// Función para hacer la solicitud HTTP
function sendRequest(testData, label) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3001, // Ajusta este puerto según donde esté corriendo tu servidor
      path: '/api/submit-lead',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    console.log(`[${label}] Enviando solicitud...`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log(`[${label}] Código de estado: ${res.statusCode}`);
          console.log(`[${label}] Respuesta: `, parsedData);
          
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          console.error(`[${label}] Error al analizar la respuesta como JSON:`, e);
          reject(e);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`[${label}] Error en la solicitud:`, error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Ejecutar las pruebas secuencialmente
async function runTests() {
  try {
    // Primera solicitud
    console.log('Enviando primera solicitud...');
    const firstResponse = await sendRequest(createTestData(), 'Primera solicitud');
    
    // Pequeña pausa entre solicitudes
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Segunda solicitud (debería ser detectada como duplicado)
    console.log('Enviando segunda solicitud (duplicado)...');
    const secondResponse = await sendRequest(createTestData(), 'Segunda solicitud');
    
    // Verificar resultados
    if (firstResponse.statusCode === 200 && firstResponse.data.success) {
      console.log('✅ Primera solicitud exitosa como se esperaba');
    } else {
      console.log('❌ Primera solicitud falló inesperadamente');
    }
    
    if (secondResponse.statusCode === 200 && 
        secondResponse.data.success && 
        secondResponse.data.note && 
        secondResponse.data.note.includes('Duplicate')) {
      console.log('✅ Segunda solicitud detectada como duplicado correctamente');
    } else {
      console.log('❌ Fallo en la detección de duplicados');
    }
    
  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
}

// Iniciar pruebas
runTests(); 