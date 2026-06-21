function runOpponentMainPhase() {
  const opponentState = gameState.field.opponent;

  if (!gameState.normalSummonUsed) {
    const summonedSomething = tryOpponentSummon(opponentState);
    if (summonedSomething) {
      gameState.normalSummonUsed = true;
    }
  }

  trySetSpellOrTrap(opponentState);

  setTimeout(() => {
    setPhase('end');
  }, 1000);
}

function getCardLevel(card) {
  return card.level ?? 0;
}

function getCardAtk(card) {
  return card.atk ?? 0;
}

function getCardDef(card) {
  return card.def ?? 0;
}

function getStrongestOpponentMonster(playerSideMonsters) {
  const presentMonsters = playerSideMonsters.filter(slot => slot !== null);

  if (presentMonsters.length === 0) {
    return null;
  }

  return presentMonsters.reduce((strongest, slot) => {
    const slotAtk = slot.faceUp ? getCardAtk(slot.card) : 1000;
    const strongestAtk = strongest.faceUp ? getCardAtk(strongest.card) : 1000;
    return slotAtk > strongestAtk ? slot : strongest;
  }, presentMonsters[0]);
}

function tryOpponentSummon(opponentState) {
  const freeZoneIndex = opponentState.monsters.findIndex(slot => slot === null);

  if (freeZoneIndex === -1) {
    return false;
  }

  const normalSummonable = opponentState.hand.filter(card =>
    isMonsterCard(card) && getCardLevel(card) <= 4
  );

  const tributeSummonable = opponentState.hand.filter(card =>
    isMonsterCard(card) && getCardLevel(card) >= 5
  );

  const presentMonsterCount = opponentState.monsters.filter(slot => slot !== null).length;

  const bestTributeCard = tributeSummonable.length > 0
    ? pickBestMonsterToSummon(tributeSummonable)
    : null;

  if (bestTributeCard !== null) {
    const requiredTributeCount = getCardLevel(bestTributeCard) >= 7 ? 2 : 1;

    if (presentMonsterCount >= requiredTributeCount) {
      performOpponentTributeSummon(opponentState, bestTributeCard, requiredTributeCount, freeZoneIndex);
      return true;
    }
  }

  if (normalSummonable.length === 0) {
    return false;
  }

  const bestCard = pickBestMonsterToSummon(normalSummonable);
  const battlePosition = decideBattlePosition(bestCard);

  const handIndex = opponentState.hand.indexOf(bestCard);
  opponentState.hand.splice(handIndex, 1);

  opponentState.monsters[freeZoneIndex] = {
    card: bestCard,
    battlePosition: battlePosition,
    faceUp: battlePosition === 'attack'
  };

  renderHands();
  renderField();

  const duelLog = document.getElementById('duel-log');
  const positionText = battlePosition === 'attack'
    ? 'im Angriffsmodus'
    : 'verdeckt im Verteidigungsmodus';
  duelLog.textContent = `Der Gegner beschwoert ${battlePosition === 'attack' ? bestCard.name : 'eine Karte'} ${positionText}.`;

  return true;
}

function performOpponentTributeSummon(opponentState, card, requiredTributeCount, targetZoneIndex) {
  const monsterIndexes = opponentState.monsters
    .map((slot, index) => ({ slot, index }))
    .filter(entry => entry.slot !== null)
    .sort((a, b) => getCardAtk(a.slot.card) - getCardAtk(b.slot.card))
    .slice(0, requiredTributeCount)
    .map(entry => entry.index);

  monsterIndexes.forEach(index => {
    opponentState.monsters[index] = null;
  });

  const handIndex = opponentState.hand.indexOf(card);
  opponentState.hand.splice(handIndex, 1);

  const finalZoneIndex = monsterIndexes.includes(targetZoneIndex)
    ? targetZoneIndex
    : opponentState.monsters.findIndex(slot => slot === null);

  opponentState.monsters[finalZoneIndex] = {
    card: card,
    battlePosition: 'attack',
    faceUp: true
  };

  renderHands();
  renderField();

  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = `Der Gegner opfert ${requiredTributeCount} Monster und beschwoert ${card.name}.`;
}

function pickBestMonsterToSummon(candidates) {
  return candidates.reduce((best, card) => {
    const bestScore = getCardAtk(best) + getCardDef(best) + getCardLevel(best) * 50;
    const cardScore = getCardAtk(card) + getCardDef(card) + getCardLevel(card) * 50;
    return cardScore > bestScore ? card : best;
  }, candidates[0]);
}

function decideBattlePosition(card) {
  const strongestEnemy = getStrongestOpponentMonster(gameState.field.player.monsters);

  if (strongestEnemy === null) {
    return 'attack';
  }

  const enemyAtk = strongestEnemy.faceUp ? getCardAtk(strongestEnemy.card) : 1000;

  if (getCardAtk(card) > enemyAtk) {
    return 'attack';
  }

  if (getCardDef(card) >= enemyAtk) {
    return 'defense';
  }

  return getCardAtk(card) >= getCardDef(card) ? 'attack' : 'defense';
}

function trySetSpellOrTrap(opponentState) {
  const freeZoneIndex = opponentState.spellsTraps.findIndex(slot => slot === null);

  if (freeZoneIndex === -1) {
    return false;
  }

  const trapsInHand = opponentState.hand.filter(card => isTrapCard(card));
  const spellsInHand = opponentState.hand.filter(card => isSpellCard(card));

  const enemyMonsterCount = gameState.field.player.monsters.filter(slot => slot !== null).length;

  let cardToSet = null;

  if (trapsInHand.length > 0 && enemyMonsterCount > 0) {
    cardToSet = trapsInHand[0];
  } else if (spellsInHand.length > 0) {
    cardToSet = spellsInHand[0];
  }

  if (cardToSet === null) {
    return false;
  }

  const handIndex = opponentState.hand.indexOf(cardToSet);
  opponentState.hand.splice(handIndex, 1);

  opponentState.spellsTraps[freeZoneIndex] = {
    card: cardToSet,
    faceUp: false
  };

  renderHands();
  renderField();

  const duelLog = document.getElementById('duel-log');
  duelLog.textContent = 'Der Gegner setzt eine Karte verdeckt.';

  return true;
}