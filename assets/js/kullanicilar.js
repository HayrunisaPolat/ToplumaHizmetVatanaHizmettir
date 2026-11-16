/* RooMee - kullanıcı filtreleme ve listeleme ekranı (kullanicilar.html).
   Filtreler "Uygula"ya basılınca uygulanır; sıralama anında değişir.
   Uygulanan filtreler sessionStorage'a yazılır, detaydan geri dönünce korunur.
   ASP.NET'te aynı alanlar bir GET action'ına (FiltreViewModel) bağlanabilir. */
(function () {
  "use strict";
  const { LABELS, HOBILER, maskName, initials, fmtTL, esc, tagsHTML, uyumDetay } = OE;
  const USERS = (window.USERS || []).map((u) => Object.assign({}, u, { uyum: uyumDetay(u).skor }));

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const STORE = "evarkadasim.kullanici-filtre";
  const GROUPS = ["cins", "statu", "uyku", "calisma", "hayvan", "sigara", "tur", "oda", "hobi"];

  /* ---------- Seçenekleri veriden kur ---------- */
  function buildOptions() {
    const cities = {}, unis = {};
    USERS.forEach((u) => {
      cities[u.sehir] = (cities[u.sehir] || 0) + 1;
      if (u.universite) unis[u.universite] = (unis[u.universite] || 0) + 1;
    });
    const sorted = (o) => Object.keys(o).sort((a, b) => a.localeCompare(b, "tr"));
    $("#f-sehir").innerHTML = `<option value="">Şehir: Tümü</option>` +
      sorted(cities).map((c) => `<option value="${esc(c)}">${esc(c)} (${cities[c]})</option>`).join("");
    $("#f-uni").innerHTML = `<option value="">Tümü</option>` +
      sorted(unis).map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join("");
    $("#hobi-list").innerHTML = HOBILER.map((h, i) =>
      `<div class="checkbox-row"><input type="checkbox" name="hobi" value="${esc(h)}" id="hb-${i}"><label for="hb-${i}">${esc(h)}</label></div>`).join("");
  }

  /* ---------- Form <-> durum ---------- */
  const num = (sel) => { const v = $(sel).value.trim(); return v === "" || isNaN(+v) ? null : +v; };
  const checked = (name) => $$(`input[name="${name}"]:checked`).map((i) => i.value);

  function readFilters() {
    const f = {
      sehir: $("#f-sehir").value, uni: $("#f-uni").value, q: $("#f-q").value.trim(),
      butceMin: num("#f-butce-min"), butceMax: num("#f-butce-max"),
      yasMin: num("#f-yas-min"), yasMax: num("#f-yas-max"),
      dogru: $("#f-dogru").checked,
    };
    GROUPS.forEach((g) => { f[g] = checked(g); });
    return f;
  }

  function writeFilters(f) {
    $("#f-sehir").value = f.sehir || ""; $("#f-uni").value = f.uni || ""; $("#f-q").value = f.q || "";
    $("#f-butce-min").value = f.butceMin ?? ""; $("#f-butce-max").value = f.butceMax ?? "";
    $("#f-yas-min").value = f.yasMin ?? ""; $("#f-yas-max").value = f.yasMax ?? "";
    $("#f-dogru").checked = !!f.dogru;
    GROUPS.forEach((g) => $$(`input[name="${g}"]`).forEach((i) => { i.checked = (f[g] || []).includes(i.value); }));
    // Filtre içeren grupları açık göster
    $$("details.acc").forEach((d) => {
      const dolu = $$("input[type=checkbox]:checked", d).length || $$("input[type=number],input[type=text]", d).some((i) => i.value) ||
        $$("select", d).some((s) => s.value);
      d.open = !!dolu;
    });
  }

  /* ---------- Filtre mantığı: gruplar arası AND, grup içi OR ---------- */
  const norm = (t) => String(t || "").toLocaleLowerCase("tr");

  function matches(u, f) {
    if (f.sehir && u.sehir !== f.sehir) return false;
    if (f.uni && u.universite !== f.uni) return false;
    if (f.butceMin != null && u.butce < f.butceMin) return false;
    if (f.butceMax != null && u.butce > f.butceMax) return false;
    if (f.yasMin != null && u.yas < f.yasMin) return false;
    if (f.yasMax != null && u.yas > f.yasMax) return false;
    if (f.cins.length && !f.cins.includes(u.cinsiyet)) return false;
    if (f.statu.length && !((f.statu.includes("ogrenci") && u.ogrenci) || (f.statu.includes("calisan") && u.calisiyor))) return false;
    if (f.dogru && !u.dogrulanmis) return false;
    if (f.uyku.length && !f.uyku.includes(u.uyku)) return false;
    if (f.calisma.length && !f.calisma.includes(u.calismaDuzeni)) return false;
    if (f.hayvan.length && !f.hayvan.includes(u.evcilHayvan)) return false;
    if (f.sigara.length && !f.sigara.includes(u.sigara)) return false;
    if (f.tur.length && !f.tur.includes(u.aramaTuru)) return false;
    if (f.oda.length && !f.oda.includes(u.odaTipi)) return false;
    if (f.hobi.length && !f.hobi.some((h) => u.hobiler.includes(h))) return false;
    if (f.q) {
      const hay = norm([u.bolum, u.is, u.ad].join(" "));
      if (!norm(f.q).split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  const SORTS = {
    yeni: (a, b) => b.ilanTarihi.localeCompare(a.ilanTarihi) || b.id - a.id,
    uyum: (a, b) => b.uyum - a.uyum,
    "butce-artan": (a, b) => a.butce - b.butce,
    "butce-azalan": (a, b) => b.butce - a.butce,
    "yas-artan": (a, b) => a.yas - b.yas,
  };

  /* ---------- Çizim ---------- */
  function cardHTML(u) {
    const ne = u.ogrenci ? u.bolum : u.is;
    return `
      <a class="listing-card" href="kullanici-detay.html?id=${u.id}" style="display:block"
         aria-label="${esc(maskName(u))} profilini görüntüle">
        <div class="listing-card-top">
          <div class="avatar${u.aramaTuru === "kiralik-ev" ? " alt" : ""}" aria-hidden="true">${esc(initials(u))}</div>
          <div class="meta">
            <h4>${esc(maskName(u))}</h4>
            <span>${esc(ne)} · ${esc(u.sehir.toLocaleUpperCase("tr"))}</span>
          </div>
          <span class="match-score">%${u.uyum} uyum</span>
        </div>
        <div class="tag-row">${tagsHTML(u)}</div>
        <div class="listing-card-footer">
          <div class="price">${fmtTL(u.butce)}<span> / ay</span></div>
          <span class="btn btn-ghost btn-sm">Detay Gör</span>
        </div>
      </a>`;
  }

  let applied = null;

  function render() {
    const list = USERS.filter((u) => matches(u, applied)).sort(SORTS[$("#f-sirala").value] || SORTS.yeni);
    $("#sonuc-sayisi").textContent = list.length;
    $("#listing-grid").innerHTML = list.map(cardHTML).join("");
    $("#empty-state").style.display = list.length ? "none" : "block";
  }

  function save() {
    try { sessionStorage.setItem(STORE, JSON.stringify({ f: applied, s: $("#f-sirala").value })); } catch (e) { /* depolama kapalı olabilir */ }
  }

  function apply(scroll) {
    applied = readFilters();
    save();
    render();
    if (scroll && window.matchMedia("(max-width: 900px)").matches) {
      const r = $("#sonuclar");
      r.scrollIntoView({ behavior: "smooth", block: "start" });
      r.focus({ preventScroll: true });
    }
  }

  /* ---------- Başlat ---------- */
  buildOptions();
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(STORE) || "null"); } catch (e) { saved = null; }
  if (saved && saved.f) { writeFilters(saved.f); if (saved.s) $("#f-sirala").value = saved.s; }

  $("#f-uygula").addEventListener("click", () => apply(true));
  $("#filtre-form").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.tagName !== "BUTTON") { e.preventDefault(); apply(true); } });
  $("#f-temizle").addEventListener("click", () => {
    writeFilters({});
    $$("details.acc").forEach((d) => { d.open = false; });
    apply(false);
  });
  $("#f-sirala").addEventListener("change", () => { save(); render(); });

  apply(false);
})();
