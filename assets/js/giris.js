/* RooMee - giriş ekranı (giris.html).
   Akış: e-posta -> 6 haneli kod -> oturum. Kayıt ekranıyla aynı doğrulama mantığı.
   Gerçek e-posta gönderimi backend gelene kadar yoktur; kod ekranda gösterilir. */
(function () {
  "use strict";
  const MAKS_DENEME = 5;
  const $ = (id) => document.getElementById(id);

  let bekleyen = null; // { kullanici, kod, deneme }

  function goster(adim) {
    $("adim-1").hidden = adim !== 1;
    $("adim-2").hidden = adim !== 2;
    const odak = adim === 1 ? $("eposta") : $("kod");
    if (odak) odak.focus();
  }

  function hata(alanId, girdiId, mesaj, html) {
    const el = $(alanId);
    if (html) el.innerHTML = mesaj; else el.textContent = mesaj;
    const girdi = $(girdiId);
    if (mesaj) girdi.setAttribute("aria-invalid", "true"); else girdi.removeAttribute("aria-invalid");
  }

  function yeniKod() {
    bekleyen.kod = dogrulamaKoduUret();
    bekleyen.deneme = 0;
    $("demo-kod").textContent = bekleyen.kod;
    $("kod").value = "";
    hata("kod-hata", "kod", "");
  }

  // Zaten giriş yapılmışsa
  const oturum = oturumGetir();
  if (oturum) {
    $("adim-1").hidden = true;
    $("oturum-var").hidden = false;
    $("oturum-ad").textContent = oturum.adSoyad;
    $("cikis-yap").addEventListener("click", () => {
      oturumKapat();
      window.location.reload();
    });
    return;
  }

  $("giris-form-1").addEventListener("submit", (e) => {
    e.preventDefault();
    const eposta = $("eposta").value.trim();
    if (!eposta || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta)) {
      hata("eposta-hata", "eposta", "Lütfen geçerli bir e-posta adresi gir.");
      return;
    }
    const kullanici = kullaniciBulEposta(eposta);
    if (!kullanici) {
      hata("eposta-hata", "eposta", 'Bu e-postayla kayıtlı bir hesap bulunamadı. <a href="kayit.html">Kayıt ol</a>', true);
      return;
    }
    hata("eposta-hata", "eposta", "");
    bekleyen = { kullanici, kod: "", deneme: 0 };
    $("hedef-eposta").textContent = kullanici.eposta;
    yeniKod();
    goster(2);
  });

  $("giris-form-2").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!bekleyen) return goster(1);
    const girilen = $("kod").value.trim();
    if (!/^\d{6}$/.test(girilen)) {
      hata("kod-hata", "kod", "Kod 6 haneli olmalı.");
      return;
    }
    if (girilen !== bekleyen.kod) {
      bekleyen.deneme += 1;
      if (bekleyen.deneme >= MAKS_DENEME) {
        yeniKod();
        hata("kod-hata", "kod", "Çok fazla hatalı deneme. Yeni bir kod oluşturuldu.");
      } else {
        hata("kod-hata", "kod", `Kod yanlış. Kalan hak: ${MAKS_DENEME - bekleyen.deneme}`);
      }
      return;
    }
    oturumAc(bekleyen.kullanici);
    window.location.href = "index.html";
  });

  $("kod-tekrar").addEventListener("click", () => { if (bekleyen) { yeniKod(); $("kod").focus(); } });
  $("eposta-degistir").addEventListener("click", () => { bekleyen = null; goster(1); });
})();
