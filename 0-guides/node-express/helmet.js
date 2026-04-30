app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://www.google-analytics.com"], // Analytics'e izin ver
        "img-src": ["'self'", "https://resim-servisi.com", "data:"], // Dış resimlere izin ver
      },
    },
    crossOriginEmbedderPolicy: false, // Dış kaynakların yüklenmesini kolaylaştırır
    frameguard: { action: "sameorigin" }, // Sadece kendi sitemdeki frame'lere izin ver
  })
);