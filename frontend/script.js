// URLs de Microservicios y APIs externas
// CLAVE DE DOCKER: 'backend' es el nombre del servicio para Strapi
const STRAPI_API_URL = 'http://backend:1337/api/historiales'; 
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

// Asigna el controlador principal al formulario de búsqueda
document.getElementById('searchForm').addEventListener('submit', handleSearch);

// ====================================================================
// --- CONTROLADOR (C en MVC): Maneja el Flujo Principal ---
// ====================================================================
async function handleSearch(e) {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const statusMessage = document.getElementById('statusMessage');
    const errorMessage = document.getElementById('errorMessage');

    statusMessage.textContent = 'Buscando Pokémon...';
    errorMessage.textContent = '';
    
    if (!query) {
        errorMessage.textContent = 'Por favor, introduce un nombre o ID de Pokémon.';
        statusMessage.textContent = '';
        return;
    }

    // 1. Obtener datos de PokeAPI (Lógica externa)
    const pokemonData = await fetchPokemon(query, errorMessage);
    
    if (pokemonData) {
        // 2. Renderizar la tarjeta en la Vista
        renderPokemonCard(pokemonData);
        
        // 3. Guardar en el Historial de Strapi (Microservicio interno)
        await saveHistory(query, statusMessage, errorMessage);
    } else {
         statusMessage.textContent = ''; // Limpiar mensaje de "Buscando..." si falla la API
    }
}


// ====================================================================
// --- MODELO (M en MVC): Lógica de Interacción con APIs ---
// ====================================================================

/**
 * Comunicación 1: Consume PokeAPI (Lógica de Búsqueda).
 */
async function fetchPokemon(query, errorElement) {
    try {
        const response = await fetch(POKEAPI_BASE_URL + query);
        if (!response.ok) {
            errorElement.textContent = `Error: Pokémon "${query}" no encontrado en PokeAPI.`;
            // Limpiar la tarjeta si no se encuentra
            document.getElementById('resultsContainer').innerHTML = ''; 
            return null;
        }
        return response.json();
    } catch (error) {
        errorElement.textContent = 'Error de conexión con PokeAPI. Revisa tu red.';
        document.getElementById('resultsContainer').innerHTML = ''; 
        return null;
    }
}

/**
 * Comunicación 2: Envía el historial al Microservicio Strapi (Backend).
 */
async function saveHistory(query, statusElement, errorElement) {
    const data = {
        // Strapi espera los datos en el objeto 'data'
        data: { query: query } 
    };
    
    try {
        const response = await fetch(STRAPI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            // Este error ocurre si Docker no conecta bien o si faltan permisos en Strapi
            throw new Error(`Error HTTP ${response.status}. ¿Permisos de Strapi/Docker OK?`);
        }

        const savedData = await response.json();
        statusElement.textContent = `✅ Búsqueda de "${savedData.data.attributes.query}" guardada en el Historial (Microservicio Backend).`;
        document.getElementById('searchInput').value = '';
    } catch (error) {
        errorElement.textContent += ` | ❌ ERROR al guardar Historial en Strapi: ${error.message}`;
        statusElement.textContent = ''; 
        console.error('Error al guardar en Strapi:', error);
    }
}


// ====================================================================
// --- VISTA (V en MVC): Lógica de Renderizado ---
// ====================================================================

/**
 * Renderiza una tarjeta de Pokémon en el contenedor de resultados.
 */
function renderPokemonCard(pokemon) {
    const container = document.getElementById('resultsContainer');
    // Limpiamos el contenedor para mostrar solo el resultado actual
    container.innerHTML = ''; 

    // Mapeo de tipos para la descripción
    const types = pokemon.types.map(t => t.type.name.toUpperCase()).join(', ');

    // 1. Crear el elemento de la tarjeta
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    // 2. Llenar el contenido HTML de la tarjeta
    card.innerHTML = `
        <h2>${pokemon.name.toUpperCase()} (#${pokemon.id})</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>Tipo(s):</strong> ${types}</p>
        <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
    `;

    // 3. Insertar la tarjeta en la Vista
    container.appendChild(card);
}