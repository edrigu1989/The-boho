const http = require('http');

// Función para hacer la solicitud HTTP
function makeRequest() {
  return new Promise((resolve, reject) => {
    console.log('Iniciando solicitud para corregir encabezados de Google Sheets...');
    console.log('Starting request to fix Google Sheets headers...');

    // Obtener el puerto del argumento o usar 3000 por defecto
    // Get port from argument or use 3000 by default
    const port = process.argv[2] || 3000;
    console.log(`Usando puerto: ${port}`);
    console.log(`Using port: ${port}`);

    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/fix-sheet-headers',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Código de estado de la respuesta: ${res.statusCode}`);
      console.log(`Response status code: ${res.statusCode}`);

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Encabezados de Google Sheets corregidos exitosamente:');
            console.log('✅ Google Sheets headers fixed successfully:');
            console.log(JSON.stringify(parsedData, null, 2));
            resolve(parsedData);
          } else {
            console.log('❌ Error al corregir encabezados:');
            console.log('❌ Error fixing headers:');
            console.log(JSON.stringify(parsedData, null, 2));
            reject(new Error(`Estado: ${res.statusCode}, Mensaje: ${parsedData.message || 'Error desconocido'}`));
            reject(new Error(`Status: ${res.statusCode}, Message: ${parsedData.message || 'Unknown error'}`));
          }
        } catch (error) {
          console.log('❌ Error al analizar la respuesta:');
          console.log('❌ Error parsing response:');
          console.log(data);
          reject(new Error(`Error al analizar la respuesta: ${error.message}`));
          reject(new Error(`Error parsing response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('Error al realizar la solicitud:');
      console.log('Error making request:');
      console.log(`❌ Error en la ejecución: ${error}`);
      console.log(`❌ Error in execution: ${error}`);
      reject(error);
    });

    req.end();
  });
}

// Ejecutar la solicitud
makeRequest()
  .then(() => {
    console.log('Solicitud completada exitosamente');
    console.log('Request completed successfully');
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  }); 