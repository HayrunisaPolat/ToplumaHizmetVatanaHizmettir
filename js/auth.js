// Basit prototip "veritabanı": gerçek backend gelene kadar kullanıcılar
// tarayıcının localStorage'ında tutulur.
const KULLANICI_ANAHTARI = "evarkadasim_kullanicilar";
const OTURUM_ANAHTARI = "evarkadasim_oturum";

function kullanicilariGetir() {
  try {
    const veri = JSON.parse(localStorage.getItem(KULLANICI_ANAHTARI));
    return Array.isArray(veri) ? veri : [];
  } catch {
    return [];
  }
}

function kullanicilariKaydet(liste) {
  localStorage.setItem(KULLANICI_ANAHTARI, JSON.stringify(liste));
}

function kullaniciEkle(kullanici) {
  const liste = kullanicilariGetir();
  liste.push(kullanici);
  kullanicilariKaydet(liste);
}

function kullaniciBul(adSoyad) {
  const normalize = (s) => s.trim().toLocaleLowerCase("tr-TR");
  return kullanicilariGetir().find(k => normalize(k.adSoyad) === normalize(adSoyad));
}

// Giriş e-posta ile yapılır (kayıtta alınan .edu.tr adresi).
function kullaniciBulEposta(eposta) {
  const normalize = (s) => String(s || "").trim().toLocaleLowerCase("tr-TR");
  return kullanicilariGetir().find(k => normalize(k.eposta) === normalize(eposta));
}

function oturumAc(kullanici) {
  localStorage.setItem(OTURUM_ANAHTARI, JSON.stringify({ adSoyad: kullanici.adSoyad }));
}

function oturumGetir() {
  try {
    return JSON.parse(localStorage.getItem(OTURUM_ANAHTARI));
  } catch {
    return null;
  }
}

function oturumKapat() {
  localStorage.removeItem(OTURUM_ANAHTARI);
}

// Öğrencilik doğrulaması: üniversite e-postası (.edu.tr) + e-postaya
// gönderilen tek kullanımlık koddur. Sahte barkod/numara girmekten farklı
// olarak, yalnızca o e-posta kutusuna erişimi olan kişi kodu görebilir.
function epostaFormatiGecerliMi(eposta) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.edu\.tr$/i.test(eposta.trim());
}

function dogrulamaKoduUret() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
