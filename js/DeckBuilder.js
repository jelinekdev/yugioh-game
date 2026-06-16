const MAX_DECK_SIZE = 60;
const MAX_COPIES = 3;

let deck = [];

function initDeckBuilder() {
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  const saveDeckButton = document.getElementById('save-deck-button');

  searchButton.addEventListener('click', handleSearch);
  saveDeckButton.addEventListener('click', saveDeck);

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });

  loadDeck();
}

async function handleSearch() {
  const input = document.getElementById('search-input');
  const query = input.value.trim();

  if (!query) return;

  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = '<p>Suche...</p>';

  try {
    const cards = await searchCards(query);
    renderSearchResults(cards);
  } catch (error) {
    resultsContainer.innerHTML = '<p>Fehler beim Laden der Karten.</p>';
  }
}

function showCardDetail(card) {
  const preview = document.getElementById('card-preview');
  const imageUrl = card.card_images?.[0]?.image_url;

  preview.innerHTML = '';

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = card.name;
    preview.appendChild(img);
  }

  document.getElementById('card-info-name').textContent = card.name;
  document.getElementById('card-info-type').textContent = `${card.type} / ${card.race}`;

  const atkDef = card.atk !== undefined
    ? `ATK: ${card.atk} / DEF: ${card.def ?? '-'}`
    : '';
  document.getElementById('card-info-atk-def').textContent = atkDef;
  document.getElementById('card-info-desc').textContent = card.desc;
}

function renderSearchResults(cards) {
  const container = document.getElementById('search-results');
  container.innerHTML = '';

  if (cards.length === 0) {
    container.innerHTML = '<p>Keine Karten gefunden.</p>';
    return;
  }

  cards.forEach(card => {
    const imageUrl = card.card_images?.[0]?.image_url_small;
    if (!imageUrl) return;

    const cardEl = document.createElement('div');
    cardEl.className = 'card-result';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = card.name;
    img.loading = 'lazy';
    img.addEventListener('click', () => showCardDetail(card));

    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.addEventListener('click', () => addCardToDeck(card));

    cardEl.appendChild(img);
    cardEl.appendChild(addButton);
    container.appendChild(cardEl);
  });
}

function addCardToDeck(card) {
  if (deck.length >= MAX_DECK_SIZE) {
    alert('Deck ist voll (max. 60 Karten).');
    return;
  }

  const copies = deck.filter(c => c.id === card.id).length;
  if (copies >= MAX_COPIES) {
    alert('Maximal 3 Kopien einer Karte erlaubt.');
    return;
  }

  deck.push(card);
  renderDeck();
}

function removeCardFromDeck(cardId) {
  const index = deck.findIndex(c => c.id === cardId);
  if (index !== -1) {
    deck.splice(index, 1);
    renderDeck();
  }
}

function renderDeck() {
  const container = document.getElementById('deck-list');
  const countEl = document.getElementById('deck-count');
  container.innerHTML = '';
  countEl.textContent = deck.length;

  deck.forEach((card) => {
    const imageUrl = card.card_images?.[0]?.image_url_small;

    const cardEl = document.createElement('div');
    cardEl.className = 'deck-card';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = card.name;
    img.loading = 'lazy';
    img.addEventListener('click', () => showCardDetail(card));

    const removeButton = document.createElement('button');
    removeButton.textContent = '-';
    removeButton.addEventListener('click', () => removeCardFromDeck(card.id));

    cardEl.appendChild(img);
    cardEl.appendChild(removeButton);
    container.appendChild(cardEl);
  });
}

function saveDeck() {
  localStorage.setItem('yugioh-deck', JSON.stringify(deck));
  alert('Deck gespeichert!');
}

function loadDeck() {
  const saved = localStorage.getItem('yugioh-deck');
  if (saved) {
    deck = JSON.parse(saved);
    renderDeck();
  }
}