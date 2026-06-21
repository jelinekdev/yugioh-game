function runOpponentMainPhase() {
  const opponentState = gameState.field.opponent;

  if (!gameState.normalSummonUsed) {
    const summonedSomething = tryOpponentNormalSummon(opponentState);
    if (summonedSomething) {
      gameState.normalSummonUsed = true;
    }
  }

  setTimeout(() => {
    setPhase('end');
  }, 1000);
}

function tryOpponentNormalSummon(opponentState) {
  const freeZoneIndex = opponentState.monsters.findIndex(slot => slot === null);

  if (freeZoneIndex === -1) {
    return false;
  }

  const summonableCards = opponentState.hand.filter(card =>
    isMonsterCard(card) && getCardLevel(card) <= 4
  );

  if (summonableCards.length === 0) {
    return false;
  }

  const bestCard = summonableCards.reduce((strongest, card) => {
    return getCardAtk(card) > getCardAtk(strongest) ? card : strongest;
  }, summonableCards[0]);

  const handIndex = opponentState.hand.indexOf(bestCard);
  opponentState.hand.splice(handIndex, 1);

  opponentState.monsters[freeZoneIndex] = {
    card: bestCard,
    battlePosition: 'attack',
    faceUp: true
  };

  renderHands();
  renderField();

  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = `Der Gegner beschwoert ${bestCard.name} im Angriffsmodus.`;

  return true;
}

function getCardLevel(card) {
  return card.level ?? 0;
}

function getCardAtk(card) {
  return card.atk ?? 0;
}