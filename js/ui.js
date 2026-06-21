document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadScreens();
  } catch (error) {
    document.getElementById('app').textContent = 'Fehler beim Laden der Seite.';
    return;
  }

  initDeckBuilder();
  initDuelScreen();
  initCardActions();

  document.querySelectorAll('button[data-target]').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      showScreen(target);
    });
  });
});

function showScreen(id) {
  document.querySelectorAll('#app > div').forEach(screen => {
    screen.classList.add('hidden');
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('hidden');
  }
}
