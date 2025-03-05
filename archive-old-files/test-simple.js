// Script simple para probar el endpoint
const http = require('http');

console.log('Iniciando prueba simple...');

// Crear datos de prueba
const testData = {
  _submissionId: `test-${Date.now()}`,
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

const data = JSON.stringify(testData);

console.log(`Datos a enviar: ${data.substring(0, 100)}...`);

// Opciones para la solicitud HTTP
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

// Crear solicitud
const req = http.request(options, (res) => {
  console.log(`Código de estado: ${res.statusCode}`);
  
  let responseData = '';
  
  // Recolectar datos de la respuesta
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  // Procesar respuesta completa
  res.on('end', () => {
    console.log('Respuesta completa:');
    console.log(responseData);
    
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Respuesta como objeto JSON:');
      console.log(parsedData);
      
      if (res.statusCode === 200 && parsedData.success) {
        console.log('✅ Prueba exitosa: Formulario enviado correctamente');
      } else {
        console.log('❌ Prueba fallida');
      }
    } catch (e) {
      console.error('Error al analizar la respuesta como JSON:', e);
    }
  });
});

// Manejar errores
req.on('error', (error) => {
  console.error('Error en la solicitud:', error);
});

// Enviar datos
req.write(data);
req.end();

console.log('Solicitud enviada, esperando respuesta...'); 