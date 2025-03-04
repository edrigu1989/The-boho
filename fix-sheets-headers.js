const http = require('http');

// Función para hacer la solicitud HTTP
function makeRequest() {
  return new Promise((resolve, reject) => {
    console.log('Iniciando solicitud para corregir encabezados de Google Sheets...');

    // Determina el puerto dinámicamente
    const determinePort = () => {
      // Si el script es ejecutado con un argumento, usa ese puerto
      if (process.argv.length > 2) {
        return process.argv[2];
      }
      // Puerto por defecto
      return '3000';
    };

    const port = determinePort();
    console.log(`Usando puerto: ${port}`);

    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/fix-sheet-headers',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      // Recopilar datos de respuesta
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Cuando la respuesta termina
      res.on('end', () => {
        console.log(`Estado de respuesta: ${res.statusCode}`);
        
        try {
          const jsonResponse = JSON.parse(data);
          console.log('Respuesta:', jsonResponse);
          resolve(jsonResponse);
        } catch (error) {
          console.error('Error al analizar la respuesta JSON:', error.message);
          console.log('Datos recibidos:', data);
          reject(error);
        }
      });
    });

    // Manejar errores
    req.on('error', (error) => {
      console.error('Error al realizar la solicitud:', error.message);
      reject(error);
    });

    // Finalizar la solicitud
    req.end();
  });
}

// Ejecutar la solicitud
makeRequest()
  .then((response) => {
    if (response.success) {
      console.log('✅ Encabezados corregidos exitosamente');
      process.exit(0);
    } else {
      console.error('❌ Error al corregir encabezados:', response.message);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error en la ejecución:', error);
    process.exit(1);
  }); 