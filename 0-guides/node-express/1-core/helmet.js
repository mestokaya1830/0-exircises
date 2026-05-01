const express = require("express");
const helmet = require("helmet");
const app = express();

app.use(
  helmet({
    // 1. CONTENT SECURITY POLICY (CSP)
    // Koşul: Dışarıdan Google Fonts, Scripts veya Analytics çekiyorsanız
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(), // Varsayılanları koru
        "script-src": ["'self'", "https://www.google-analytics.com"],
        "style-src": ["'self'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },

    // 2. CROSS-ORIGIN EMBEDDER POLICY (COEP)
    // Koşul: Dış kaynaklı (CDN) resim/video yüklerken hata alıyorsanız kapatın
    crossOriginEmbedderPolicy: false, 

    // 3. CROSS-ORIGIN OPENER POLICY (COOP)
    // Koşul: Google ile Giriş gibi pop-up pencereler kullanıyorsanız
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },

    // 4. CROSS-ORIGIN RESOURCE POLICY (CORP)
    // Koşul: Kendi resimlerinize başka sitelerin erişmesini istiyorsanız
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // 5. REFERRER POLICY
    // Koşul: Google Analytics'e hangi sayfadan gelindiği bilgisini tam iletmek için
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },

    // 6. HSTS (Strict-Transport-Security)
    // Koşul: Siteniz yayındaysa (Production) ve HTTPS zorunluysa süreyi uzatın
    hsts: {
      maxAge: 31536000, // 1 Yıl (Saniye cinsinden)
      includeSubDomains: true,
      preload: true,
    },

    // 7. FRAMEGUARD (X-Frame-Options)
    // Koşul: Siteniz bir widget olarak başka sitelere gömülecekse kapatın
    // Koşul: Hiçbir yerde (kendinizde dahil) iframe olmasın istiyorsanız: "deny"
    frameguard: { action: "sameorigin" },

    // 8. DNS PREFETCH CONTROL
    // Koşul: Sayfadaki linklerin domainlerini tarayıcı önceden çözsün (Hız için)
    dnsPrefetchControl: { allow: true },

    // 9. X-POWERED-BY
    // Koşul: Express kullandığınızı gizlemek için (Genelde default true yeterli)
    hidePoweredBy: true,
  })
);


