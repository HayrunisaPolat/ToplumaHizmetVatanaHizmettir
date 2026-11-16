# Kullanıcı Filtreleme ve Görüntüleme Ekranları (HTML prototipi)

Teklif formundaki görev: **Frontend – kullanıcı filtreleme ve görüntüleme ekranı**.
Şimdilik saf HTML/CSS/JS; ASP.NET'e geçişte her dosyanın karşılığı aşağıda.

## Çalıştırma
Derleme gerekmez: `kullanicilar.html` dosyasını tarayıcıda açmak yeterli.
Veriyi yeniden üretmek için: `python3 tools/generate_users.py`

## Ekranlar
| Dosya | Açıklama |
|-------|----------|
| `kullanicilar.html` | Filtre paneli + kullanıcı kartları (listeleme) |
| `kullanici-detay.html?id=N` | Kullanıcı profili (görüntüleme) |

Görünüm sitenin ortak stilini kullanır (`css/style.css`, header/footer); yalnızca ek parçalar
`assets/css/kullanicilar.css` içindedir.

## Filtreler ("Uygula" ile uygulanır, "Filtreleri Temizle" sıfırlar)

| Grup | Filtre |
|------|--------|
| Lokasyon | Şehir (kişi sayısıyla) |
| Bütçe | Minimum / maksimum aylık bütçe (₺) |
| 👤 Kişisel Bilgiler | Yaş aralığı, cinsiyet, statü (öğrenci / çalışan), sadece doğrulanmış öğrenciler |
| 🎓 Eğitim Bilgileri | Üniversite, bölüm / meslek (serbest metin) |
| 👥 Yaşam Tercihleri | Uyku düzeni, ders / çalışma düzeni, evcil hayvan, sigara |
| 🏠 Oda Tercihleri | İlan türü (ev arkadaşı arıyor / kiralık ev), oda tipi (paylaşımlı / tek kişilik / stüdyo) |
| ⭐ Hobiler & İlgi Alanları | 10 hobi (seçilenlerden en az biri ortak olmalı) |

Mantık: **gruplar arası AND, grup içi OR**; hiçbiri seçili değilse o filtre uygulanmaz.
Sıralama: En yeni, en uyumlu, bütçe (artan/azalan), yaş. Uygulanan filtreler `sessionStorage`'da
tutulur, profilden geri dönünce korunur.

## Uyum yüzdesi
Kartlardaki **%N uyum** değeri, `assets/js/ortak.js` içindeki örnek tercih profiline (`BENIM`)
göre hesaplanır: uyku (15), ders/çalışma düzeni (10), evcil hayvan (10), sigara (15), bütçe (20),
yaş (10), ortak hobiler (20) ağırlıklarıyla. Giriş sistemi bağlanınca `BENIM`, oturumdaki
kullanıcının profiliyle değiştirilecek. Profil sayfasında kriter kriter döküm gösterilir.

## Gizlilik (KVKK / teklif formu)
E-posta, telefon ve tam soyad veri modelinde **yoktur**. Soyadın yalnızca ilk harfi tutulur
(`Deniz R.`). Fotoğraf yerine baş harfli avatar kullanılır. Tüm kullanıcılar örnek (sahte) veridir.

## Veri modeli (`data/users.json`) → ASP.NET sınıfı
```
int Id; string Ad; string SoyadBas; Cinsiyet Cinsiyet;      // kadin | erkek
int Yas; string Sehir; string Ilce;
AramaTuru AramaTuru;                                          // ev-arkadasi | kiralik-ev
bool Ogrenci; bool Calisiyor; string? Is;
string? Universite; string? Bolum; string? Sinif; bool Dogrulanmis;
int Butce; EvBilgisi? Ev {Tip, BosOda}; OdaTipi OdaTipi;      // paylasimli | tek-kisilik | studyo
Uyku Uyku; CalismaDuzeni CalismaDuzeni;                       // erken|gece|esnek ; sessiz|disari|esnek
EvcilHayvan EvcilHayvan; Sigara Sigara;                       // sahibi|sorun-degil|istemiyor ; icmiyor|icer
List<string> Hobiler; string Hakkinda; DateOnly IlanTarihi;
```

## ASP.NET'e geçiş eşlemesi
| Prototip | ASP.NET |
|----------|---------|
| `assets/js/users.js` / `data/users.json` | EF Core `Kullanici` tablosu + seed |
| `kullanicilar.js` → `matches()` | `IQueryable` üzerinde `Where(...)` (servis katmanı) |
| Filtre alanları | GET action + `FiltreViewModel` (model binding) |
| `kullanicilar.html` | `Views/Kullanici/Index.cshtml` (+ kart için partial view) |
| `kullanici-detay.html` | `Views/Kullanici/Detay.cshtml` (`/Kullanici/Detay/5`) |
| `ortak.js` → `maskName`, `LABELS`, `uyumDetay` | ViewModel'de maskeleme, enum `[Display(Name=...)]`, uyum servisi |
