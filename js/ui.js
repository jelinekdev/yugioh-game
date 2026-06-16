document.addEventListener('DOMContentLoaded', () => {
    initDeckBuilder();
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