// --- Elementos do DOM ---
const pokemonCatalogSearch = document.getElementById('pokemon-catalog-search');
const pokemonCatalogList = document.getElementById('pokemon-catalog-list');

const detailPokemonName = document.getElementById('detail-pokemon-name');
const detailPokemonImage = document.getElementById('detail-pokemon-image');
const detailPokemonId = document.getElementById('detail-pokemon-id');
const detailPokemonHeight = document.getElementById('detail-pokemon-height');
const detailPokemonWeight = document.getElementById('detail-pokemon-weight');
const detailPokemonTypes = document.getElementById('detail-pokemon-types');
const detailPokemonStats = document.getElementById('detail-pokemon-stats');
const detailPokemonAbilities = document.getElementById('detail-pokemon-abilities');
const initialMessage = document.getElementById('initial-message');

let allPokemonData = [];
let currentSelectedIndex = 0;

// --- Funções ---

// 1. Carregar o Catálogo
async function loadPokemonCatalog() {
    pokemonCatalogList.innerHTML = '<li>Carregando catálogo...</li>';
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        if (!response.ok) throw new Error('Failed to load Pokémon catalog');
        const data = await response.json();

        const pokemonPromises = data.results.map(async (pokemonEntry) => {
            const pokemonRes = await fetch(pokemonEntry.url);
            return pokemonRes.json();
        });
        allPokemonData = await Promise.all(pokemonPromises);
        allPokemonData.sort((a, b) => a.id - b.id);

        renderCatalogList(allPokemonData);
    } catch (error) {
        console.error('Error loading Pokémon catalog:', error);
        pokemonCatalogList.innerHTML = '<li>Erro ao carregar catálogo.</li>';
    }
}

// 2. Renderizar a lista
function renderCatalogList(pokemonList) {
    pokemonCatalogList.innerHTML = '';
    if (pokemonList.length === 0) {
        pokemonCatalogList.innerHTML = '<li>Nenhum Pokémon encontrado.</li>';
        return;
    }

    pokemonList.forEach((pokemon, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('catalog-item');
        listItem.dataset.pokemonId = pokemon.id;
        listItem.dataset.pokemonName = pokemon.name;
        listItem.textContent = `#${pokemon.id.toString().padStart(3, '0')} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;

        listItem.addEventListener('click', () => {
            currentSelectedIndex = index;
            highlightCatalogItem(currentSelectedIndex);
        });

        pokemonCatalogList.appendChild(listItem);
    });

    highlightCatalogItem(currentSelectedIndex);
}

// 3. Exibir detalhes
async function displayPokemonDetails(query) {
    if (!query) {
        detailPokemonName.textContent = 'Selecione um Pokémon';
        detailPokemonImage.style.display = 'none';
        detailPokemonId.textContent = '';
        detailPokemonHeight.textContent = '';
        detailPokemonWeight.textContent = '';
        detailPokemonTypes.innerHTML = '';
        detailPokemonStats.innerHTML = `<h3 class="group-title">Estatísticas Base</h3>`;
        detailPokemonAbilities.innerHTML = `<h3 class="group-title">Habilidades</h3>`;
        initialMessage.style.display = 'block';
        return;
    }

    initialMessage.style.display = 'none';
    detailPokemonName.textContent = 'Carregando...';
    detailPokemonImage.style.display = 'none';
    detailPokemonId.textContent = '';
    detailPokemonHeight.textContent = '';
    detailPokemonWeight.textContent = '';
    detailPokemonTypes.innerHTML = '';
    detailPokemonStats.innerHTML = `<h3 class="group-title">Estatísticas Base</h3>`;
    detailPokemonAbilities.innerHTML = `<h3 class="group-title">Habilidades</h3>`;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(query).toLowerCase()}`);
        if (!response.ok) throw new Error('Pokémon não encontrado!');
        const data = await response.json();

        detailPokemonName.textContent = `#${data.id.toString().padStart(3, '0')} ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}`;
        detailPokemonImage.src = data.sprites.front_default || data.sprites.other['official-artwork'].front_default;
        detailPokemonImage.alt = data.name;
        detailPokemonImage.style.display = 'block';

        detailPokemonId.textContent = `ID: #${data.id}`;
        detailPokemonHeight.textContent = `Altura: ${(data.height / 10).toFixed(1)} m`;
        detailPokemonWeight.textContent = `Peso: ${(data.weight / 10).toFixed(1)} kg`;

        data.types.forEach(typeInfo => {
            const typeBadge = document.createElement('span');
            typeBadge.classList.add('type-badge-detail', `type-${typeInfo.type.name}`);
            typeBadge.textContent = typeInfo.type.name;
            detailPokemonTypes.appendChild(typeBadge);
        });

        const statsListContainer = document.createElement('div');
        data.stats.forEach(statInfo => {
            const statName = statInfo.stat.name.replace('-', ' ').toUpperCase();
            const statValue = statInfo.base_stat;

            const statItem = document.createElement('div');
            statItem.classList.add('stat-item');
            statItem.innerHTML = `<span>${statName}: ${statValue}</span>
                                  <div class="stat-bar-container">
                                      <div class="stat-bar" style="width: ${Math.min(100, (statValue / 255) * 100)}%;"></div>
                                  </div>`;
            statsListContainer.appendChild(statItem);
        });
        detailPokemonStats.appendChild(statsListContainer);

        const abilitiesUl = document.createElement('ul');
        data.abilities.forEach(abilityInfo => {
            const abilityItem = document.createElement('li');
            abilityItem.textContent = abilityInfo.ability.name.replace('-', ' ');
            abilitiesUl.appendChild(abilityItem);
        });
        detailPokemonAbilities.appendChild(abilitiesUl);

    } catch (error) {
        console.error('Error fetching Pokémon details:', error);
        detailPokemonName.textContent = 'Erro!';
        detailPokemonImage.style.display = 'none';
        detailPokemonId.textContent = '';
        detailPokemonHeight.textContent = '';
        detailPokemonWeight.textContent = '';
        detailPokemonTypes.innerHTML = '';
        detailPokemonStats.innerHTML = `<h3 class="group-title">Estatísticas Base</h3><p style="font-size: 0.7em;">Não encontrado.</p>`;
        detailPokemonAbilities.innerHTML = `<h3 class="group-title">Habilidades</h3><p style="font-size: 0.7em;">Não encontrado.</p>`;
        initialMessage.style.display = 'block';
        initialMessage.textContent = 'Pokémon não encontrado ou erro de conexão.';
    }
}

// 4. Destacar item selecionado
function highlightCatalogItem(index) {
    const items = document.querySelectorAll('.catalog-item');
    items.forEach((item, i) => {
        item.classList.toggle('selected', i === index);
    });

    const selectedPokemon = items[index];
    if (selectedPokemon) {
        const name = selectedPokemon.dataset.pokemonName;
        displayPokemonDetails(name);
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    loadPokemonCatalog();
    displayPokemonDetails('');

    // Botão UP
    document.querySelector('.up').addEventListener('click', () => {
        const items = document.querySelectorAll('.catalog-item');
        if (currentSelectedIndex > 0) {
            currentSelectedIndex--;
            highlightCatalogItem(currentSelectedIndex);
        }
    });

    // Botão DOWN
    document.querySelector('.down').addEventListener('click', () => {
        const items = document.querySelectorAll('.catalog-item');
        if (currentSelectedIndex < items.length - 1) {
            currentSelectedIndex++;
            highlightCatalogItem(currentSelectedIndex);
        }
    });

    // Botão A — mostra apenas habilidades
    document.querySelector('.a-button').addEventListener('click', () => {
        const items = document.querySelectorAll('.catalog-item');
        const selected = items[currentSelectedIndex];
        if (selected) {
            displayPokemonDetails(selected.dataset.pokemonName);
            detailPokemonStats.innerHTML = `<h3 class="group-title">Estatísticas Base</h3>`;
        }
    });

    // Botão B — mostra apenas estatísticas
    document.querySelector('.b-button').addEventListener('click', () => {
        const items = document.querySelectorAll('.catalog-item');
        const selected = items[currentSelectedIndex];
        if (selected) {
            displayPokemonDetails(selected.dataset.pokemonName);
            detailPokemonAbilities.innerHTML = `<h3 class="group-title">Habilidades</h3>`;
        }
    });

        // Filtro de busca
    pokemonCatalogSearch.addEventListener('input', () => {
        const searchTerm = pokemonCatalogSearch.value.toLowerCase();
        const filteredPokemon = allPokemonData.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm) ||
            pokemon.id.toString().includes(searchTerm)
        );
        renderCatalogList(filteredPokemon);
        currentSelectedIndex = 0;
        highlightCatalogItem(currentSelectedIndex);
    });
});