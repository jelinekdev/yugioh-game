const OPPONENTS = {
  easy: {
    name: 'Anfaenger',
    cardSet: 'Starter Deck: Yugi'
  },
  medium: {
    name: 'Fortgeschrittener',
    cardSet: 'Starter Deck: Kaiba'
  },
  hard: {
    name: 'Meister',
    cardSet: 'Structure Deck: Dragons Collide'
  }
};

const DEFAULT_PLAYER_SETS = [
  'Starter Deck: Yugi',
  'Starter Deck: Joey',
  'Starter Deck: Kaiba'
];

async function buildDeckFromSet(setName) {
  const cards = await getCardsBySet(setName);
  return cards.filter(card => card.frameType !== 'skill');
}

async function getPlayerDeck() {
  const saved = localStorage.getItem('yugioh-deck');

  if (saved) {
    const parsedDeck = JSON.parse(saved);
    if (parsedDeck.length > 0) {
      return parsedDeck;
    }
  }

  const randomIndex = Math.floor(Math.random() * DEFAULT_PLAYER_SETS.length);
  const randomSet = DEFAULT_PLAYER_SETS[randomIndex];
  return buildDeckFromSet(randomSet);
}

async function getOpponentDeck(difficulty) {
  const opponent = OPPONENTS[difficulty];
  return buildDeckFromSet(opponent.cardSet);
}