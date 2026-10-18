// Mobil menü aç/kapat
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }
});

// Giriş yapılmışsa üst menüde "Giriş Yap / Kayıt Ol" yerine kullanıcı adını göster
document.addEventListener("DOMContentLoaded", () => {
  if (typeof oturumGetir !== "function") return; // js/auth.js yüklenmemiş
  const oturum = oturumGetir();
  const navActions = document.querySelector(".nav-actions");
  if (!oturum || !navActions) return;

  navActions.innerHTML = `
    <span style="font-weight:600;font-size:0.9rem;color:var(--color-primary-dark);">
      Merhaba, ${oturum.adSoyad.split(" ")[0]}
    </span>
    <button class="btn btn-ghost btn-sm" id="cikis-btn" type="button">Çıkış Yap</button>
  `;
  document.getElementById("cikis-btn").addEventListener("click", () => {
    oturumKapat();
    window.location.href = "index.html";
  });
});
