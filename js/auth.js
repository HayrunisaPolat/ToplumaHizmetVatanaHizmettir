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

// Giriş e-posta ile yapılır (kayıtta alınan adres).
function kullaniciBulEposta(eposta) {
  // E-posta için dilden bağımsız küçük harf: "tr-TR" ile "I" -> "ı" olur ve eşleşme bozulur.
  const normalize = (s) => String(s || "").trim().toLowerCase();
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

// Kayıt ve giriş herhangi bir e-postayla yapılabilir (öğrenci olmayanlar da katılır).
// Yalnızca .edu.tr adresi "Doğrulanmış öğrenci" rozeti verir.
function epostaGecerliMi(eposta) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(eposta || "").trim());
}

function ogrenciEpostasiMi(eposta) {
  return epostaFormatiGecerliMi(String(eposta || ""));
}

function dogrulamaKoduUret() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
