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

function startDuel(difficulty) {
  document.getElementById('opponent-select-view').classList.add('hidden');
  document.getElementById('duel-board-view').classList.remove('hidden');
}

function leaveDuel() {
  document.getElementById('duel-board-view').classList.add('hidden');
  document.getElementById('opponent-select-view').classList.remove('hidden');
}