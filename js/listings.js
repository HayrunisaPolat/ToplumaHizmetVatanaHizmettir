// Örnek ilan verisi (prototip aşamasında statik; ileride API'den gelecek)
const ILANLAR = [
  { id: 1, ad: "Ayşe K.", sehir: "Konya", bolum: "Bilgisayar Mühendisliği", uyku: "Sabahçı", evcilDostu: true, sigarasiz: true, dogrulanmis: true, butce: 4500, uyum: 92 },
  { id: 2, ad: "Mert Y.", sehir: "İstanbul", bolum: "Mimarlık", uyku: "Gececi", evcilDostu: true, sigarasiz: false, dogrulanmis: true, butce: 7500, uyum: 81 },
  { id: 3, ad: "Selin D.", sehir: "Konya", bolum: "İşletme", uyku: "Sabahçı", evcilDostu: false, sigarasiz: true, dogrulanmis: true, butce: 5000, uyum: 88 },
  { id: 4, ad: "Burak T.", sehir: "Ankara", bolum: "Hukuk", uyku: "Gececi", evcilDostu: false, sigarasiz: true, dogrulanmis: false, butce: 6200, uyum: 74 },
  { id: 5, ad: "Zeynep A.", sehir: "İzmir", bolum: "Tıp", uyku: "Sabahçı", evcilDostu: true, sigarasiz: true, dogrulanmis: true, butce: 8800, uyum: 95 },
  { id: 6, ad: "Can E.", sehir: "Konya", bolum: "Bilgisayar Mühendisliği", uyku: "Gececi", evcilDostu: true, sigarasiz: false, dogrulanmis: true, butce: 4000, uyum: 79 },
  { id: 7, ad: "Elif S.", sehir: "İstanbul", bolum: "İşletme", uyku: "Sabahçı", evcilDostu: false, sigarasiz: true, dogrulanmis: true, butce: 9500, uyum: 85 },
  { id: 8, ad: "Deniz R.", sehir: "Ankara", bolum: "Mimarlık", uyku: "Sabahçı", evcilDostu: true, sigarasiz: true, dogrulanmis: false, butce: 5600, uyum: 69 },
];

function initial(ad) {
  return ad.split(" ").map(p => p[0]).join("").toUpperCase();
}

function renderListings(list) {
  const grid = document.getElementById("listing-grid");
  const empty = document.getElementById("empty-state");
  const sayac = document.getElementById("sonuc-sayisi");

  sayac.textContent = list.length;
  grid.innerHTML = "";

  if (list.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  list.forEach(ilan => {
    const card = document.createElement("a");
    card.href = `ilan-detay.html?id=${ilan.id}`;
    card.className = "listing-card";
    card.style.display = "block";
    card.innerHTML = `
      <div class="listing-card-top">
        <div class="avatar">${initial(ilan.ad)}</div>
        <div class="meta">
          <h4>${ilan.ad}</h4>
          <span>${ilan.bolum} · ${ilan.sehir}</span>
        </div>
        <span class="match-score">%${ilan.uyum} uyum</span>
      </div>
      <div class="tag-row">
        <span class="tag">${ilan.uyku}</span>
        ${ilan.evcilDostu ? '<span class="tag">Evcil hayvan dostu</span>' : ""}
        ${ilan.sigarasiz ? '<span class="tag">Sigara içmez</span>' : ""}
        ${ilan.dogrulanmis ? '<span class="tag accent">Doğrulanmış öğrenci</span>' : ""}
      </div>
      <div class="listing-card-footer">
        <div class="price">${ilan.butce.toLocaleString("tr-TR")}₺<span> / ay</span></div>
        <span class="btn btn-ghost btn-sm">Detay Gör</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function applyFilters() {
  const sehir = document.getElementById("f-sehir").value;
  const bolum = document.getElementById("f-bolum").value;
  const uyku = document.getElementById("f-uyku").value;
  const maxButce = Number(document.getElementById("f-butce").value);
  const evcilOnly = document.getElementById("f-evcil").checked;
  const sigarasizOnly = document.getElementById("f-sigarasiz").checked;
  const dogrulanmisOnly = document.getElementById("f-dogrulanmis").checked;

  const filtered = ILANLAR.filter(ilan => {
    if (sehir && ilan.sehir !== sehir) return false;
    if (bolum && ilan.bolum !== bolum) return false;
    if (uyku && ilan.uyku !== uyku) return false;
    if (ilan.butce > maxButce) return false;
    if (evcilOnly && !ilan.evcilDostu) return false;
    if (sigarasizOnly && !ilan.sigarasiz) return false;
    if (dogrulanmisOnly && !ilan.dogrulanmis) return false;
    return true;
  }).sort((a, b) => b.uyum - a.uyum);

  renderListings(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  const butceInput = document.getElementById("f-butce");
  if (!butceInput) return; // bu sayfa ilanlar.html değil (örn. ilan detay sayfası)
  const butceDeger = document.getElementById("f-butce-deger");

  butceInput.addEventListener("input", () => {
    butceDeger.textContent = Number(butceInput.value).toLocaleString("tr-TR") + "₺";
    applyFilters();
  });

  ["f-sehir", "f-bolum", "f-uyku", "f-evcil", "f-sigarasiz", "f-dogrulanmis"].forEach(id => {
    document.getElementById(id).addEventListener("change", applyFilters);
  });

  document.getElementById("f-temizle").addEventListener("click", () => {
    document.getElementById("f-sehir").value = "";
    document.getElementById("f-bolum").value = "";
    document.getElementById("f-uyku").value = "";
    document.getElementById("f-evcil").checked = false;
    document.getElementById("f-sigarasiz").checked = false;
    document.getElementById("f-dogrulanmis").checked = false;
    butceInput.value = 12000;
    butceDeger.textContent = "12.000₺";
    applyFilters();
  });

  applyFilters();
});
