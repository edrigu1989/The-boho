// Test script para simular una solicitud de formulario a la API
require('dotenv').config();
// En Node.js v18+ podemos usar fetch nativo, pero para versiones anteriores:
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Script para probar el envío de datos a Google Sheets
const http = require('http');

// Generar un timestamp único para evitar duplicados
const timestamp = Date.now();
const uniqueEmail = `test_${timestamp}@example.com`;
const uniquePhone = `${timestamp.toString().slice(-8)}`;

// Datos de prueba para el formulario
const testFormData = {
  fullName: {
    value: "Usuario de Prueba",
    label: "Usuario de Prueba",
    points: 0
  },
  email: {
    value: uniqueEmail,
    label: uniqueEmail,
    points: 0
  },
  phone: {
    value: uniquePhone,
    label: uniquePhone,
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

console.log(`Iniciando prueba de envío de formulario con email: ${uniqueEmail} y teléfono: ${uniquePhone}`);

// Función para enviar datos al endpoint
function sendFormData(port) {
  return new Promise((resolve, reject) => {
    // Convertir los datos a JSON
    const postData = JSON.stringify(testFormData);
    
    // Opciones para la solicitud HTTP
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
    
    // Crear la solicitud
    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      
      let responseData = '';
      
      // Recopilar los datos de la respuesta
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      // Finalizar la solicitud
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log('Respuesta completa:', JSON.stringify(parsedData, null, 2));
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          console.log('Respuesta (no es JSON):', responseData);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    // Manejar errores
    req.on('error', (e) => {
      console.error(`Error en la solicitud al puerto ${port}:`, e.message);
      reject(e);
    });
    
    // Enviar los datos
    req.write(postData);
    req.end();
  });
}

// Función principal para intentar enviar datos a diferentes puertos
async function main() {
  // Intentar con el puerto 3000 primero
  try {
    console.log('Intentando enviar datos al puerto 3000...');
    const result = await sendFormData(3000);
    console.log(`Prueba exitosa en puerto 3000 con código de estado: ${result.status}`);
    return;
  } catch (error) {
    console.log('Error al enviar datos al puerto 3000, probando otros puertos...');
  }
  
  // Si falla, probar con puertos del 3001 al 3010
  for (let port = 3001; port <= 3010; port++) {
    try {
      console.log(`Intentando enviar datos al puerto ${port}...`);
      const result = await sendFormData(port);
      console.log(`Prueba exitosa en puerto ${port} con código de estado: ${result.status}`);
      return;
    } catch (error) {
      console.log(`Error al enviar datos al puerto ${port}, probando el siguiente...`);
    }
  }
  
  console.error('No se pudo conectar a ningún puerto. Asegúrate de que el servidor esté en ejecución.');
}

// Ejecutar la prueba
main().catch(error => {
  console.error('Error no capturado:', error);
}); 