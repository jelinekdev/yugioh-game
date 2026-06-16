const API_BASE_URL = 'https://db.ygoprodeck.com/api/v7';

async function searchCards(query) {
  const url = `${API_BASE_URL}/cardinfo.php?fname=${encodeURIComponent(query)}&num=20&offset=0`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API Fehler: ${response.status}`);
  }

  const data = await response.json();
  return data.data ?? [];
}

async function getCardById(id) {
  const url = `${API_BASE_URL}/cardinfo.php?id=${encodeURIComponent(id)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API Fehler: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0] ?? null;
}