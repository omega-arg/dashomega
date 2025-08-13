// Prueba directa de la API de chat
async function testChatAPIEndpoint() {
  console.log('🔍 Probando endpoint de chat...\n');
  
  try {
    // Hacer una petición GET a la API
    const response = await fetch('http://localhost:3001/api/chat');
    
    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:');
      console.log('📊 Número de mensajes:', data.length);
      
      data.forEach((message, index) => {
        console.log(`\n   Mensaje ${index + 1}:`);
        console.log(`   - ID: ${message.id}`);
        console.log(`   - Contenido: "${message.content}"`);
        console.log(`   - Canal: ${message.group?.name || 'No especificado'}`);
        console.log(`   - Autor: ${message.sender?.name || 'No especificado'}`);
        console.log(`   - Fecha: ${message.createdAt}`);
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Error en la respuesta:');
      console.log(errorText);
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

// Ejecutar la prueba
testChatAPIEndpoint();
