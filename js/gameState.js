const PHASES = ['draw', 'standby', 'main1', 'battle', 'main2', 'end'];

const gameState = {
  currentTurn: null,
  currentPhase: null,
  turnCount: 1,
  normalSummonUsed: false,
  field: {
    player: {
      monsters: [null, null, null, null, null],
      spellsTraps: [null, null, null, null, null],
      deck: [],
      hand: [],
      graveyard: [],
      extra: [],
      banished: [],
      lifePoints: 8000
    },
    opponent: {
      monsters: [null, null, null, null, null],
      spellsTraps: [null, null, null, null, null],
      deck: [],
      hand: [],
      graveyard: [],
      extra: [],
      banished: [],
      lifePoints: 8000
    }
  }
};

function resetGameState() {
  gameState.currentTurn = null;
  gameState.currentPhase = null;
  gameState.turnCount = 1;
  gameState.normalSummonUsed = false;

  gameState.field.player.monsters = [null, null, null, null, null];
  gameState.field.player.spellsTraps = [null, null, null, null, null];
  gameState.field.player.deck = [];
  gameState.field.player.hand = [];
  gameState.field.player.graveyard = [];
  gameState.field.player.extra = [];
  gameState.field.player.banished = [];
  gameState.field.player.lifePoints = 8000;

  gameState.field.opponent.monsters = [null, null, null, null, null];
  gameState.field.opponent.spellsTraps = [null, null, null, null, null];
  gameState.field.opponent.deck = [];
  gameState.field.opponent.hand = [];
  gameState.field.opponent.graveyard = [];
  gameState.field.opponent.extra = [];
  gameState.field.opponent.banished = [];
  gameState.field.opponent.lifePoints = 8000;
}

function getCurrentPlayerState() {
  return gameState.field[gameState.currentTurn];
}

function getOpponentOf(side) {
  return side === 'player' ? 'opponent' : 'player';
}