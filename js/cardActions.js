let selectedHandCard = null;
let selectedHandIndex = null;
let pendingAction = null;
let requiredTributes = 0;
let selectedTributeIndexes = [];

function canPlayCards() {
  if (gameState.currentTurn !== 'player') {
    return false;
  }
  return gameState.currentPhase === 'main1' || gameState.currentPhase === 'main2';
}

function isMonsterCard(card) {
  return card.type.includes('Monster');
}

function isSpellCard(card) {
  return card.type === 'Spell Card';
}

function isTrapCard(card) {
  return card.type === 'Trap Card';
}

function onHandCardClick(card, index, clickEvent) {
  if (!canPlayCards()) {
    return;
  }

  if (isMonsterCard(card) && gameState.normalSummonUsed) {
    const duelLog = document.getElementById('duel-log');
    duelLog.textContent = 'Normalbeschwoerung wurde diesen Zug bereits genutzt.';
    return;
  }

  selectedHandCard = card;
  selectedHandIndex = index;

  openCardActionMenu(card, clickEvent);
}

function openCardActionMenu(card, clickEvent) {
  const menu = document.getElementById('card-action-menu');
  const summonButton = document.getElementById('action-summon');
  const setMonsterButton = document.getElementById('action-set-monster');
  const activateButton = document.getElementById('action-activate');
  const setSpellButton = document.getElementById('action-set-spell');

  summonButton.classList.add('hidden');
  setMonsterButton.classList.add('hidden');
  activateButton.classList.add('hidden');
  setSpellButton.classList.add('hidden');

  if (isMonsterCard(card)) {
    summonButton.classList.remove('hidden');
    setMonsterButton.classList.remove('hidden');
  } else if (isSpellCard(card)) {
    activateButton.classList.remove('hidden');
    setSpellButton.classList.remove('hidden');
  } else if (isTrapCard(card)) {
    setSpellButton.classList.remove('hidden');
  }

  menu.style.left = `${clickEvent.clientX}px`;
  menu.style.top = `${clickEvent.clientY}px`;
  menu.classList.remove('hidden');
}

function closeCardActionMenu() {
  document.getElementById('card-action-menu').classList.add('hidden');
  selectedHandCard = null;
  selectedHandIndex = null;
  pendingAction = null;
  requiredTributes = 0;
  selectedTributeIndexes = [];
  clearZoneSelection();
}

function clearZoneSelection() {
  document.querySelectorAll('.zone-selectable').forEach(zone => {
    zone.classList.remove('zone-selectable');
  });
  document.querySelectorAll('.zone-tribute-selected').forEach(zone => {
    zone.classList.remove('zone-tribute-selected');
  });
}

function startZoneSelection(action) {
  pendingAction = action;
  document.getElementById('card-action-menu').classList.add('hidden');

  if ((action === 'summon' || action === 'set-monster') && getCardLevel(selectedHandCard) >= 5) {
    startTributeSelection(action);
    return;
  }

  const side = 'player';
  let zoneSelector;

  if (action === 'summon' || action === 'set-monster') {
    zoneSelector = `[data-zone^="${side}-monster"]`;
  } else {
    zoneSelector = `[data-zone^="${side}-spell"]`;
  }

  document.querySelectorAll(zoneSelector).forEach(zone => {
    const zoneName = zone.getAttribute('data-zone');
    const zoneIndex = parseInt(zoneName.split('-').pop(), 10);
    const isEmpty = action.includes('monster') || action === 'summon'
      ? gameState.field.player.monsters[zoneIndex] === null
      : gameState.field.player.spellsTraps[zoneIndex] === null;

    if (isEmpty) {
      zone.classList.add('zone-selectable');
    }
  });
}

function startTributeSelection(action) {
  const level = getCardLevel(selectedHandCard);
  requiredTributes = level >= 7 ? 2 : 1;
  selectedTributeIndexes = [];

  const availableMonsters = gameState.field.player.monsters.filter(slot => slot !== null).length;

  if (availableMonsters < requiredTributes) {
    const duelLog = document.getElementById('duel-log');
    duelLog.textContent = `Nicht genug Monster fuer ein Tributopfer (benoetigt: ${requiredTributes}).`;
    closeCardActionMenu();
    return;
  }

  pendingAction = `${action}-tribute`;

  document.querySelectorAll('[data-zone^="player-monster"]').forEach(zone => {
    const zoneName = zone.getAttribute('data-zone');
    const zoneIndex = parseInt(zoneName.split('-').pop(), 10);

    if (gameState.field.player.monsters[zoneIndex] !== null) {
      zone.classList.add('zone-selectable');
    }
  });

  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = `Waehle ${requiredTributes} Monster als Tributopfer.`;
}

function onZoneClick(zoneEl) {
  if (pendingAction === null || selectedHandCard === null) {
    return;
  }

  if (!zoneEl.classList.contains('zone-selectable')) {
    return;
  }

  const zoneName = zoneEl.getAttribute('data-zone');
  const zoneIndex = parseInt(zoneName.split('-').pop(), 10);

  if (pendingAction === 'summon-tribute' || pendingAction === 'set-monster-tribute') {
    handleTributeZoneClick(zoneIndex);
    return;
  }

  if (pendingAction === 'summon') {
    placeMonster(zoneIndex, 'attack', true);
  } else if (pendingAction === 'set-monster') {
    placeMonster(zoneIndex, 'defense', false);
  } else if (pendingAction === 'activate') {
    activateSpell(zoneIndex);
  } else if (pendingAction === 'set-spell') {
    setSpellOrTrap(zoneIndex);
  }

  closeCardActionMenu();
}

function handleTributeZoneClick(zoneIndex) {
  if (selectedTributeIndexes.includes(zoneIndex)) {
    return;
  }

  selectedTributeIndexes.push(zoneIndex);

  const zoneEl = document.querySelector(`[data-zone="player-monster-${zoneIndex}"]`);
  zoneEl.classList.remove('zone-selectable');
  zoneEl.classList.add('zone-tribute-selected');

  if (selectedTributeIndexes.length < requiredTributes) {
    return;
  }

  const baseAction = pendingAction.replace('-tribute', '');
  const targetZoneIndex = selectedTributeIndexes[0];

  selectedTributeIndexes.forEach(index => {
    gameState.field.player.monsters[index] = null;
  });

  document.querySelectorAll('.zone-tribute-selected').forEach(zone => {
    zone.classList.remove('zone-tribute-selected');
  });

  if (baseAction === 'summon') {
    placeMonster(targetZoneIndex, 'attack', true);
  } else {
    placeMonster(targetZoneIndex, 'defense', false);
  }

  closeCardActionMenu();
}

function placeMonster(zoneIndex, battlePosition, faceUp) {
  const card = selectedHandCard;

  gameState.field.player.monsters[zoneIndex] = {
    card: card,
    battlePosition: battlePosition,
    faceUp: faceUp
  };

  gameState.field.player.hand.splice(selectedHandIndex, 1);
  gameState.normalSummonUsed = true;

  renderHands();
  renderField();

  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = faceUp
    ? `${card.name} wurde offen im Angriffsmodus beschworen.`
    : `${card.name} wurde verdeckt im Verteidigungsmodus gesetzt.`;
}

function setSpellOrTrap(zoneIndex) {
  const card = selectedHandCard;

  gameState.field.player.spellsTraps[zoneIndex] = {
    card: card,
    faceUp: false
  };

  gameState.field.player.hand.splice(selectedHandIndex, 1);

  renderHands();
  renderField();

  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = `${card.name} wurde verdeckt gesetzt.`;
}

function activateSpell(zoneIndex) {
  const card = selectedHandCard;

  gameState.field.player.spellsTraps[zoneIndex] = {
    card: card,
    faceUp: true
  };

  gameState.field.player.hand.splice(selectedHandIndex, 1);

  renderHands();
  renderField();

  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = `${card.name} wurde aktiviert.`;
}

function initCardActions() {
  document.getElementById('action-summon').addEventListener('click', () => startZoneSelection('summon'));
  document.getElementById('action-set-monster').addEventListener('click', () => startZoneSelection('set-monster'));
  document.getElementById('action-activate').addEventListener('click', () => startZoneSelection('activate'));
  document.getElementById('action-set-spell').addEventListener('click', () => startZoneSelection('set-spell'));
  document.getElementById('action-cancel').addEventListener('click', closeCardActionMenu);

  document.querySelectorAll('.zone').forEach(zone => {
    zone.addEventListener('click', () => onZoneClick(zone));
  });
}