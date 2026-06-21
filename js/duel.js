function initDuelScreen() {
  document.querySelectorAll('.challenge-button').forEach(button => {
    button.addEventListener('click', () => {
      const difficulty = button.getAttribute('data-difficulty');
      startDuel(difficulty);
    });
  });

  const leaveButton = document.getElementById('leave-duel-button');
  leaveButton.addEventListener('click', leaveDuel);

  document.getElementById('go-to-battle-button').addEventListener('click', () => {
    setPhase('battle');
  });

  document.getElementById('end-battle-button').addEventListener('click', () => {
    setPhase('main2');
  });

  document.getElementById('end-turn-button').addEventListener('click', () => {
    setPhase('end');
  });
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

    resetGameState();

    gameState.field.player.deck = shuffleDeck(loadedPlayerDeck);
    gameState.field.opponent.deck = shuffleDeck(loadedOpponentDeck);

    gameState.field.player.hand = drawCards(gameState.field.player.deck, 5);
    gameState.field.opponent.hand = drawCards(gameState.field.opponent.deck, 5);

    gameState.currentTurn = Math.random() < 0.5 ? 'player' : 'opponent';
    gameState.turnCount = 1;

    document.getElementById('opponent-select-view').classList.add('hidden');
    document.getElementById('duel-board-view').classList.remove('hidden');

    renderHands();
    renderDeckZones();

    const starterName = gameState.currentTurn === 'player' ? 'Du beginnst.' : 'Der Gegner beginnt.';
    duelLog.textContent = `Duell gegen ${OPPONENTS[difficulty].name} gestartet. ${starterName}`;

    const startPhase = gameState.turnCount === 1 ? 'standby' : 'draw';
    setPhase(startPhase);

  } catch (error) {
    duelLog.textContent = 'Fehler beim Laden der Decks.';
  }
}

function setPhase(phase) {
  gameState.currentPhase = phase;
  renderPhaseBar();
  updatePhaseActionButtons();

  if (phase === 'draw') {
    handleDrawPhase();
    setTimeout(() => setPhase('standby'), 800);
    return;
  }

  if (phase === 'standby') {
    setTimeout(() => setPhase('main1'), 800);
    return;
  }

  if (phase === 'end') {
    setTimeout(() => endTurn(), 800);
  }
}

function handleDrawPhase() {
  const activeState = getCurrentPlayerState();
  const drawn = drawCards(activeState.deck, 1);

  if (drawn.length === 0) {
    const duelLog = document.getElementById('duel-log');
    duelLog.textContent = `${gameState.currentTurn === 'player' ? 'Du hast' : 'Der Gegner hat'} keine Karten mehr im Deck. Niederlage durch Deckout.`;
    return;
  }

  activeState.hand.push(...drawn);
  renderHands();
  renderDeckZones();
}

function endTurn() {
  gameState.normalSummonUsed = false;
  gameState.turnCount += 1;
  gameState.currentTurn = getOpponentOf(gameState.currentTurn);

  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = `${gameState.currentTurn === 'player' ? 'Dein' : 'Gegnerischer'} Zug (Runde ${gameState.turnCount}).`;

  setPhase('draw');
}

function renderPhaseBar() {
  document.querySelectorAll('.phase-button').forEach(button => {
    const phase = button.getAttribute('data-phase');
    button.classList.toggle('active', phase === gameState.currentPhase);
  });
}

function updatePhaseActionButtons() {
  const goToBattleButton = document.getElementById('go-to-battle-button');
  const endBattleButton = document.getElementById('end-battle-button');
  const endTurnButton = document.getElementById('end-turn-button');

  goToBattleButton.classList.add('hidden');
  endBattleButton.classList.add('hidden');
  endTurnButton.classList.add('hidden');

  if (gameState.currentTurn !== 'player') {
    return;
  }

  if (gameState.currentPhase === 'main1') {
    goToBattleButton.classList.remove('hidden');
    endTurnButton.classList.remove('hidden');
  }

  if (gameState.currentPhase === 'battle') {
    endBattleButton.classList.remove('hidden');
  }

  if (gameState.currentPhase === 'main2') {
    endTurnButton.classList.remove('hidden');
  }
}

function renderHands() {
  renderPlayerHand();
  renderOpponentHand();
}

function renderPlayerHand() {
  const container = document.getElementById('player-hand');
  container.innerHTML = '';

  gameState.field.player.hand.forEach(card => {
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

  gameState.field.opponent.hand.forEach(() => {
    const cardEl = document.createElement('div');
    cardEl.className = 'hand-card card-back';

    const backImg = document.createElement('img');
    backImg.src = 'assets/back_high.jpg';
    backImg.alt = 'Kartenrueckseite';

    cardEl.appendChild(backImg);
    container.appendChild(cardEl);
  });
}

function renderDeckZones() {
  const playerDeckZone = document.querySelector('[data-zone="player-deck"]');
  const opponentDeckZone = document.querySelector('[data-zone="opponent-deck"]');

  renderDeckZone(playerDeckZone, gameState.field.player.deck.length);
  renderDeckZone(opponentDeckZone, gameState.field.opponent.deck.length);
}

function renderDeckZone(zoneEl, cardCount) {
  zoneEl.innerHTML = '';

  if (cardCount === 0) {
    return;
  }

  const img = document.createElement('img');
  img.src = 'assets/back_high.jpg';
  img.alt = 'Deck';
  img.className = 'deck-stack-image';

  zoneEl.appendChild(img);
}

function leaveDuel() {
  document.getElementById('duel-board-view').classList.add('hidden');
  document.getElementById('opponent-select-view').classList.remove('hidden');
}