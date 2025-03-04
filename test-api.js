// Script para probar el endpoint de corrección de encabezados
const http = require('http');

// Función para hacer una solicitud HTTP
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Respuesta recibida (${res.statusCode}):`);
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          console.log('Respuesta no es JSON válido:', data);
          resolve(data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error en la solicitud:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

// Función principal
async function main() {
  try {
    console.log('Verificando encabezados...');
    const result = await makeRequest('/api/fix-sheet-headers');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.headersMatch === false) {
      console.log('\nCorrigiendo encabezados...');
      const fixResult = await makeRequest('/api/fix-sheet-headers?fix=true');
      console.log(JSON.stringify(fixResult, null, 2));
    } else {
      console.log('\nLos encabezados ya coinciden. No es necesario corregirlos.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar el script
main(); 