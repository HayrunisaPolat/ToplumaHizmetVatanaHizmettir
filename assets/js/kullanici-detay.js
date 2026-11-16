/* RooMee - kullanıcı profili görüntüleme ekranı (kullanici-detay.html?id=N). */
(function () {
  "use strict";
  const { LABELS, maskName, initials, fmtTL, esc, formatDate, tagsHTML, uyumDetay } = OE;
  const USERS = window.USERS || [];
  const alan = document.getElementById("detay-alani");
  const id = Number(new URLSearchParams(location.search).get("id"));
  const u = USERS.find((x) => x.id === id);

  if (!u) {
    document.title = "Profil bulunamadı | RooMee";
    alan.style.display = "block";
    alan.innerHTML = `<div class="detail-card text-center"><h3>Profil bulunamadı</h3>
      <p>Aradığınız kullanıcı kaldırılmış ya da bağlantı hatalı olabilir.</p>
      <a class="btn btn-primary" href="kullanicilar.html">Kullanıcılara dön</a></div>`;
    return;
  }

  document.title = `${maskName(u)} | RooMee`;
  const home = u.aramaTuru === "kiralik-ev";
  const uyum = uyumDetay(u);

  const tablo = (satirlar) =>
    `<table class="compat-table">${satirlar.filter(Boolean)
      .map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>`;

  const kisisel = [
    ["Şehir / İlçe", `${u.sehir} · ${u.ilce}`],
    ["Yaş", u.yas],
    ["Cinsiyet", LABELS.cinsiyet[u.cinsiyet]],
    ["Statü", [u.ogrenci && "Öğrenci", u.calisiyor && "Çalışan"].filter(Boolean).join(" ve ")],
    u.universite && ["Üniversite", u.universite],
    u.bolum && ["Bölüm", `${u.bolum} (${u.sinif})`],
    u.is && [u.ogrenci ? "Çalışma durumu" : "Meslek", u.is],
    ["Öğrencilik durumu", u.ogrenci ? (u.dogrulanmis ? "Doğrulandı (.edu.tr)" : "Doğrulanmadı") : "Öğrenci değil"],
  ];
  const yasam = [
    ["Uyku düzeni", LABELS.uyku[u.uyku]],
    ["Ders / çalışma düzeni", LABELS.calismaDuzeni[u.calismaDuzeni]],
    ["Evcil hayvan", LABELS.evcilHayvan[u.evcilHayvan]],
    ["Sigara", LABELS.sigara[u.sigara]],
  ];
  const oda = [
    ["İlan türü", LABELS.aramaTuru[u.aramaTuru]],
    ["Oda tipi", LABELS.odaTipi[u.odaTipi]],
    home && u.ev && ["Ev / boş oda", `${u.ev.tip} · ${u.ev.bosOda} boş oda`],
    ["Aylık bütçe", fmtTL(u.butce)],
    ["İlan tarihi", formatDate(u.ilanTarihi)],
  ];

  const durumCls = { Uyumlu: "ok", Kısmen: "mid", Uyumsuz: "low" };

  alan.innerHTML = `
    <div>
      <div class="detail-card">
        <div class="detail-header">
          <div class="avatar${home ? " alt" : ""}" aria-hidden="true">${esc(initials(u))}</div>
          <div>
            <h1>${esc(maskName(u))}</h1>
            <span class="badge-verify">${u.dogrulanmis ? "✓ Doğrulanmış öğrenci" : u.ogrenci ? "Doğrulama bekleniyor" : "Çalışan profili"}</span>
          </div>
        </div>
        <p>${esc(u.hakkinda)}</p>
        <div class="tag-row">${tagsHTML(u)}</div>
      </div>

      <div class="detail-card">
        <h3>Kişisel Bilgiler</h3>
        ${tablo(kisisel)}
      </div>

      <div class="detail-card">
        <h3>Yaşam Tercihleri</h3>
        ${tablo(yasam)}
      </div>

      <div class="detail-card">
        <h3>Oda ve Bütçe</h3>
        ${tablo(oda)}
      </div>

      <div class="detail-card">
        <h3>Hobiler &amp; İlgi Alanları</h3>
        <div class="tag-row" style="margin-bottom:0">${u.hobiler.map((h) => `<span class="tag">${esc(h)}</span>`).join("")}</div>
      </div>
    </div>

    <div>
      <div class="detail-card side-card">
        <div class="price" style="font-size:1.3rem;margin-bottom:4px;">
          ${fmtTL(u.butce)}<span style="font-size:0.85rem;"> / ay</span>
        </div>
        <div class="match-score" style="display:inline-block;margin-bottom:8px;">%${uyum.skor} uyum skoru</div>
        <ul class="uyum-list">
          ${uyum.rows.map((r) => `
            <li><span>${esc(r.ad)}${r.not ? `<small>${esc(r.not)}</small>` : ""}</span>
                <span class="durum ${durumCls[r.durum]}">${r.durum}</span></li>`).join("")}
        </ul>
        <p class="form-hint" style="margin-top:12px;">
          Uyum, örnek bir tercih profiline göre hesaplanır. E-posta ve telefon numaraları gizlidir.
        </p>
      </div>
      <div class="detail-card">
        <h3 style="font-size:1rem;">Güvenlik Hatırlatması</h3>
        <p style="font-size:0.88rem;">
          Kapora veya önden ödeme talep eden ilanları bildirin. Görüşmelerde kişisel ve
          finansal bilgilerinizi paylaşmadan önce karşı tarafın doğrulama rozetini kontrol edin.
        </p>
      </div>
    </div>`;
})();
