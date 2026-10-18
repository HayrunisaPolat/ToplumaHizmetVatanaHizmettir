document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id")) || ILANLAR[0].id;
  const ilan = ILANLAR.find(i => i.id === id) || ILANLAR[0];
  const alan = document.getElementById("detay-alani");

  alan.innerHTML = `
    <div>
      <div class="detail-card">
        <div class="detail-header">
          <div class="avatar">${initial(ilan.ad)}</div>
          <div>
            <h1>${ilan.ad}</h1>
            <span class="badge-verify">${ilan.dogrulanmis ? "✓ Doğrulanmış öğrenci" : "Doğrulama bekleniyor"}</span>
          </div>
        </div>
        <p>
          ${ilan.bolum} bölümü öğrencisi, ${ilan.sehir} şehrinde ev arkadaşı arıyor.
          Yaşam tarzı tercihleri ve uyum kriterlerine göre eşleştirme yapılmaktadır.
        </p>
        <div class="tag-row">
          <span class="tag">${ilan.uyku}</span>
          ${ilan.evcilDostu ? '<span class="tag">Evcil hayvan dostu</span>' : '<span class="tag">Evcil hayvan yok</span>'}
          ${ilan.sigarasiz ? '<span class="tag">Sigara içmez</span>' : '<span class="tag">Sigara içebilir</span>'}
        </div>
      </div>

      <div class="detail-card">
        <h3>Uyumluluk Kriterleri</h3>
        <table class="compat-table">
          <tr><td>Şehir</td><td>${ilan.sehir}</td></tr>
          <tr><td>Bölüm</td><td>${ilan.bolum}</td></tr>
          <tr><td>Uyku düzeni</td><td>${ilan.uyku}</td></tr>
          <tr><td>Aylık bütçe hedefi</td><td>${ilan.butce.toLocaleString("tr-TR")}₺</td></tr>
          <tr><td>Evcil hayvan</td><td>${ilan.evcilDostu ? "Dostu" : "İstemiyor"}</td></tr>
          <tr><td>Sigara</td><td>${ilan.sigarasiz ? "İçmiyor" : "İçebilir"}</td></tr>
          <tr><td>Öğrencilik durumu</td><td>${ilan.dogrulanmis ? "Doğrulandı (.edu.tr)" : "Doğrulanmadı"}</td></tr>
        </table>
      </div>
    </div>

    <div>
      <div class="detail-card side-card">
        <div class="price" style="font-size:1.3rem;margin-bottom:4px;">
          ${ilan.butce.toLocaleString("tr-TR")}₺<span style="font-size:0.85rem;"> / ay</span>
        </div>
        <div class="match-score" style="display:inline-block;margin-bottom:16px;">%${ilan.uyum} uyum skoru</div>
        <button class="btn btn-primary btn-block" id="iletisim-btn" type="button">Platform Üzerinden İletişime Geç</button>
        <p class="form-hint" style="margin-top:12px;">
          E-posta ve telefon numaraları gizlidir. İletişim, kayıt olduktan sonra platform içi
          mesajlaşma üzerinden sağlanır.
        </p>
      </div>
      <div class="detail-card">
        <h3 style="font-size:1rem;">Güvenlik Hatırlatması</h3>
        <p style="font-size:0.88rem;">
          Kapora veya önden ödeme talep eden ilanları bildirin. Görüşmelerde kişisel ve
          finansal bilgilerinizi paylaşmadan önce karşı tarafın doğrulama rozetini kontrol edin.
        </p>
      </div>
    </div>
  `;

  document.getElementById("iletisim-btn").addEventListener("click", () => {
    alert("Bu özellik prototip aşamasındadır. Mesajlaşma, geliştirme sürecinin ilerleyen haftalarında eklenecektir.");
  });
});
