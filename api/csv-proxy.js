// To jest "pośrednik" - pobiera CSV z BaseLinkera po stronie serwera
// (gdzie nie ma blokady CORS) i przekazuje go dalej do Twojej strony.

export default async function handler(req, res) {
  const csvUrl = "https://panel-f.baselinker.com/inventory_export.php?hash=d956b83f5929e02fe35f85d297232b2b";

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
