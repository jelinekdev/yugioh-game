let playerDeck = [];
let opponentDeck = [];
let playerHand = [];
let opponentHand = [];

function initDuelScreen() {
  document.querySelectorAll('.challenge-button').forEach(button => {
    button.addEventListener('click', () => {
      const difficulty = button.getAttribute('data-difficulty');
      startDuel(difficulty);
    });
  });

  const leaveButton = document.getElementById('leave-duel-button');
  leaveButton.addEventListener('click', leaveDuel);
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function drawCards(deck, amount) {
  return deck.splice(0, amount);
}

async function startDuel(difficulty) {
  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = 'Decks werden geladen...';

  try {
    const loadedPlayerDeck = await getPlayerDeck();
    const loadedOpponentDeck = await getOpponentDeck(difficulty);

    if (loadedPlayerDeck.length === 0 || loadedOpponentDeck.length === 0) {
      duelLog.textContent = 'Fehler beim Laden der Decks.';
      return;
    }

    playerDeck = shuffleDeck(loadedPlayerDeck);
    opponentDeck = shuffleDeck(loadedOpponentDeck);

    playerHand = drawCards(playerDeck, 5);
    opponentHand = drawCards(opponentDeck, 5);

    document.getElementById('opponent-select-view').classList.add('hidden');
    document.getElementById('duel-board-view').classList.remove('hidden');

    renderPlayerHand();
    renderOpponentHand();

    duelLog.textContent = `Duell gegen ${OPPONENTS[difficulty].name} gestartet. Jeder Spieler hat 5 Karten gezogen.`;

  } catch (error) {
    duelLog.textContent = 'Fehler beim Laden der Decks.';
  }
}

function renderPlayerHand() {
  const container = document.getElementById('player-hand');
  container.innerHTML = '';

  playerHand.forEach(card => {
    const imageUrl = card.card_images?.[0]?.image_url_small;

    const cardEl = document.createElement('div');
    cardEl.className = 'hand-card';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = card.name;
    img.loading = 'lazy';

    cardEl.appendChild(img);
    container.appendChild(cardEl);
  });
}

function renderOpponentHand() {
  const container = document.getElementById('opponent-hand');
  container.innerHTML = '';

  opponentHand.forEach(() => {
    const cardEl = document.createElement('div');
    cardEl.className = 'hand-card card-back';

    const backImg = document.createElement('img');
    backImg.src = 'assets/back_high.jpg';
    backImg.alt = 'Kartenrueckseite';

    cardEl.appendChild(backImg);
    container.appendChild(cardEl);
  });
}

function leaveDuel() {
  document.getElementById('duel-board-view').classList.add('hidden');
  document.getElementById('opponent-select-view').classList.remove('hidden');
}