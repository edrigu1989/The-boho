// Script para probar la corrección de encabezados en Google Sheets
const fetch = require('node-fetch');

async function testFixHeaders() {
  console.log('Iniciando prueba de corrección de encabezados...');
  
  try {
    // Primero, verificar los encabezados actuales
    console.log('Verificando encabezados actuales...');
    
    try {
      const checkResponse = await fetch('http://localhost:3000/api/fix-sheet-headers');
      console.log('Respuesta recibida:', checkResponse.status, checkResponse.statusText);
      
      if (!checkResponse.ok) {
        console.error('Error en la respuesta:', checkResponse.status, checkResponse.statusText);
        const errorText = await checkResponse.text();
        console.error('Detalles del error:', errorText);
        return;
      }
      
      const checkResult = await checkResponse.json();
      console.log('Respuesta completa:', JSON.stringify(checkResult, null, 2));
      
      console.log('Estado de los encabezados:');
      console.log('- Encabezados actuales:', checkResult.currentHeaders);
      console.log('- Encabezados esperados:', checkResult.expectedHeaders);
      console.log('- Encabezados duplicados:', checkResult.duplicateHeaders);
      console.log('- Encabezados faltantes:', checkResult.missingHeaders);
      console.log('- Encabezados extra:', checkResult.extraHeaders);
      console.log('- ¿Coinciden los encabezados?', checkResult.headersMatch ? 'Sí' : 'No');
      
      // Si los encabezados no coinciden, corregirlos
      if (!checkResult.headersMatch) {
        console.log('\nLos encabezados no coinciden. Corrigiendo...');
        
        try {
          const fixResponse = await fetch('http://localhost:3000/api/fix-sheet-headers?fix=true');
          console.log('Respuesta de corrección recibida:', fixResponse.status, fixResponse.statusText);
          
          if (!fixResponse.ok) {
            console.error('Error en la respuesta de corrección:', fixResponse.status, fixResponse.statusText);
            const errorText = await fixResponse.text();
            console.error('Detalles del error:', errorText);
            return;
          }
          
          const fixResult = await fixResponse.json();
          console.log('Resultado de la corrección:', JSON.stringify(fixResult, null, 2));
          
          // Verificar nuevamente los encabezados
          console.log('\nVerificando encabezados después de la corrección...');
          
          try {
            const recheckResponse = await fetch('http://localhost:3000/api/fix-sheet-headers');
            console.log('Respuesta de verificación recibida:', recheckResponse.status, recheckResponse.statusText);
            
            if (!recheckResponse.ok) {
              console.error('Error en la respuesta de verificación:', recheckResponse.status, recheckResponse.statusText);
              const errorText = await recheckResponse.text();
              console.error('Detalles del error:', errorText);
              return;
            }
            
            const recheckResult = await recheckResponse.json();
            console.log('Nuevo estado de los encabezados:', JSON.stringify(recheckResult, null, 2));
          } catch (recheckError) {
            console.error('Error al verificar después de la corrección:', recheckError);
          }
        } catch (fixError) {
          console.error('Error al corregir los encabezados:', fixError);
        }
      } else {
        console.log('\nLos encabezados ya coinciden. No es necesario corregirlos.');
      }
    } catch (checkError) {
      console.error('Error al verificar los encabezados:', checkError);
    }
    
    console.log('\nPrueba completada.');
  } catch (error) {
    console.error('Error general en la prueba:', error);
  }
}

// Ejecutar la prueba
testFixHeaders().catch(error => {
  console.error('Error no capturado:', error);
}); 