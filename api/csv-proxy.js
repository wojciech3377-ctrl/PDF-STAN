// To jest "pośrednik" - pobiera CSV z BaseLinkera po stronie serwera
// (gdzie nie ma blokady CORS) i przekazuje go dalej do Twojej strony.

// ============================================================
// WKLEJ TUTAJ SWÓJ LINK Z BASELINKERA (między cudzysłowami):
// ============================================================
const CSV_URL = "https://panel-f.baselinker.com/inventory_export.php?hash=3eda4f2b4a6bafdd60ccd037caa00114";
// ============================================================

export default async function handler(req, res) {
  const csvUrl = CSV_URL;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: `BaseLinker zwrócił błąd: ${response.status}` });
    }
    const csvText = await response.text();

    // Zezwól przeglądarce na odczyt tej odpowiedzi (to właśnie naprawia CORS)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    // Krótkie cachowanie, żeby nie odpytywać BaseLinkera przy każdym wejściu na stronę
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    res.status(200).send(csvText);
  } catch (err) {
    res.status(500).json({ error: "Nie udało się pobrać danych z BaseLinkera: " + err.message });
  }
}
