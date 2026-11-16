/* RooMee - kullanıcı filtreleme/görüntüleme ekranları için ortak yardımcılar.
   ASP.NET'e geçişte: LABELS -> enum + display name, uyumDetay -> servis katmanı. */
(function () {
  "use strict";

  const LABELS = {
    aramaTuru: { "ev-arkadasi": "Ev arkadaşı arıyor", "kiralik-ev": "Kiralık ev ilanı" },
    cinsiyet: { kadin: "Kadın", erkek: "Erkek" },
    uyku: { erken: "Sabahçı", gece: "Gececi", esnek: "Uyku düzeni esnek" },
    calismaDuzeni: { sessiz: "Evde sessiz ortam", disari: "Dışarıda çalışır", esnek: "Çalışma düzeni esnek" },
    evcilHayvan: { sahibi: "Evcil hayvanı var", "sorun-degil": "Evcil hayvan dostu", istemiyor: "Evcil hayvan istemiyor" },
    sigara: { icmiyor: "Sigara içmez", icer: "Sigara içer" },
    odaTipi: { paylasimli: "Paylaşımlı Oda", "tek-kisilik": "Tek Kişilik Oda", studyo: "Stüdyo Daire" },
  };

  const HOBILER = ["Spor", "Müzik", "Kitap okuma", "Oyun", "Yemek yapma", "Film / Dizi",
                   "Seyahat", "Doğa yürüyüşü", "Fotoğrafçılık", "Teknoloji"];

  // Gizlilik: yalnızca soyadın ilk harfi tutulur ve gösterilir -> "Deniz R."
  const maskName = (u) => `${u.ad} ${u.soyadBas}.`;
  const initials = (u) => (u.ad[0] + u.soyadBas).toLocaleUpperCase("tr");
  const fmtTL = (n) => Number(n).toLocaleString("tr-TR") + "₺";

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const formatDate = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  // Etiket listesi: kart ve detay sayfasında aynı sırayla gösterilir
  function tagsOf(u) {
    const t = [];
    t.push({ text: u.aramaTuru === "kiralik-ev" && u.ev ? `Kiralık ev · ${u.ev.tip}` : LABELS.aramaTuru[u.aramaTuru], cls: "solid" });
    t.push({ text: `${u.yas} yaş, ${LABELS.cinsiyet[u.cinsiyet]}` });
    if (u.ogrenci) t.push({ text: "Öğrenci" });
    if (u.calisiyor) t.push({ text: "Çalışan" });
    t.push({ text: LABELS.odaTipi[u.odaTipi] });
    t.push({ text: LABELS.uyku[u.uyku] });
    if (u.evcilHayvan !== "istemiyor") t.push({ text: LABELS.evcilHayvan[u.evcilHayvan] });
    t.push({ text: LABELS.sigara[u.sigara] });
    if (u.dogrulanmis) t.push({ text: "Doğrulanmış öğrenci", cls: "accent" });
    return t;
  }
  const tagsHTML = (u) => tagsOf(u).map((x) => `<span class="tag${x.cls ? " " + x.cls : ""}">${esc(x.text)}</span>`).join("");

  // ---------- Uyum skoru ----------
  // Prototipte giriş yapan kullanıcı yok; örnek bir tercih profiline göre hesaplanır.
  // Giriş sistemi bağlanınca BENIM, oturumdaki kullanıcının profiliyle değiştirilecek.
  const BENIM = {
    yas: 22, butce: 5500, uyku: "erken", calismaDuzeni: "sessiz",
    evcilHayvan: "sorun-degil", sigara: "icmiyor",
    hobiler: ["Müzik", "Kitap okuma", "Seyahat", "Film / Dizi"],
  };

  const pair = (a, b) => (a === b ? 1 : a === "esnek" || b === "esnek" ? 0.6 : 0);
  function hayvanPuan(a, b) {
    if (a === b) return 1;
    const s = [a, b].sort().join("|");
    if (s === "istemiyor|sahibi") return 0;
    if (s === "istemiyor|sorun-degil") return 0.6;
    return 1; // sahibi + sorun-degil
  }
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  function uyumDetay(u) {
    const ortak = u.hobiler.filter((h) => BENIM.hobiler.includes(h));
    const rows = [
      { ad: "Uyku düzeni", w: 15, p: pair(BENIM.uyku, u.uyku) },
      { ad: "Ders / çalışma düzeni", w: 10, p: pair(BENIM.calismaDuzeni, u.calismaDuzeni) },
      { ad: "Evcil hayvan", w: 10, p: hayvanPuan(BENIM.evcilHayvan, u.evcilHayvan) },
      { ad: "Sigara", w: 15, p: BENIM.sigara === u.sigara ? 1 : 0.2 },
      { ad: "Bütçe", w: 20, p: clamp01(1 - Math.abs(u.butce - BENIM.butce) / BENIM.butce) },
      { ad: "Yaş", w: 10, p: clamp01(1 - Math.abs(u.yas - BENIM.yas) / 10) },
      { ad: "Ortak hobiler", w: 20, p: clamp01(ortak.length / 2), not: ortak.join(", ") },
    ];
    const toplamW = rows.reduce((a, r) => a + r.w, 0);
    const skor = Math.round((rows.reduce((a, r) => a + r.w * r.p, 0) / toplamW) * 100);
    rows.forEach((r) => { r.durum = r.p >= 0.8 ? "Uyumlu" : r.p >= 0.4 ? "Kısmen" : "Uyumsuz"; });
    return { skor, rows };
  }

  window.OE = { LABELS, HOBILER, maskName, initials, fmtTL, esc, formatDate, tagsOf, tagsHTML, uyumDetay, BENIM };
})();
