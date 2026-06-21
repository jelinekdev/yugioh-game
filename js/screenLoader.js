const SCREEN_FILES = [
  'screens/menu.html',
  'screens/deckBuilder.html',
  'screens/play.html'
];

async function loadScreens() {
  const appContainer = document.getElementById('app');

  for (const filePath of SCREEN_FILES) {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Konnte ${filePath} nicht laden.`);
    }

    const html = await response.text();
    appContainer.insertAdjacentHTML('beforeend', html);
  }
}