// To jest "pośrednik" - pobiera CSV z BaseLinkera po stronie serwera
// (gdzie nie ma blokady CORS) i przekazuje go dalej do Twojej strony.

// ============================================================
// WKLEJ TUTAJ SWÓJ LINK Z BASELINKERA (między cudzysłowami):
// ============================================================
const CSV_URL = "https://panel-f.baselinker.com/inventory_export.php?hash=032334c9a61e99ade51ee0dbfad672f5";
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
    // Cachowanie: BaseLinker pozwala na max 10 pobrań / 8h dla tego linku.
    // 55 minut cache = maksymalnie ok. 8-9 realnych zapytań do BaseLinkera na 8h,
    // niezależnie od tego, ilu odwiedzających w tym czasie wejdzie na stronę -
    // wszyscy dostają tę samą, zapamiętaną przez Vercel odpowiedź.
    res.setHeader("Cache-Control", "s-maxage=3300, stale-while-revalidate=1800");

    res.status(200).send(csvText);
  } catch (err) {
    res.status(500).json({ error: "Nie udało się pobrać danych z BaseLinkera: " + err.message });
  }
}
