/**
 * MELISA & ERAY - VINTAGE WEDDING INVITATION (MAIN JS LOGIC)
 * Sayfa etkileşimleri, 3D Zarf Animasyonu, Canlı Sayaç, Takvim ve RSVP
 */

document.addEventListener("DOMContentLoaded", () => {
  // 17 Kasım 2026, 16:00
  const TARGET_DATE = new Date("2026-11-17T16:00:00+03:00").getTime();

  // DOM Elemanları
  const envelopeLayer = document.getElementById("envelope-layer");
  const envelopeBox = document.getElementById("envelopeBox");
  const audio = document.getElementById("bgMusic");
  const toastPill = document.getElementById("toastPill");
  const toastMsg = document.getElementById("toastMsg");
  const mapModal = document.getElementById("mapModal");
  const petalsLayer = document.getElementById("petals-canvas-layer");

  const loaderOverlay = document.getElementById("wedding-loader");

  // -------------------------------------------------------------------------
  // GÖRSELLERİ ARKA PLANDA ÖN YÜKLEME & ZARİF LOADER'I KALDIRMA
  // -------------------------------------------------------------------------
  const criticalImages = [
    "assets/vintage_envelope.jpg",
    "assets/theme_lace_masterpiece.jpg",
    "assets/names_calligraphy.png"
  ];

  let loadedCount = 0;
  function removeLoader() {
    if (!loaderOverlay) return;
    loaderOverlay.classList.add("loaded");
    setTimeout(() => {
      loaderOverlay.remove();
    }, 600);
  }

  // Güvenlik zamanlayıcısı: En geç 1.8 saniyede loader kesinlikle kapanır
  const maxLoaderTimeout = setTimeout(removeLoader, 1800);

  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = img.onerror = () => {
      loadedCount++;
      if (loadedCount >= criticalImages.length) {
        clearTimeout(maxLoaderTimeout);
        // Hafif zarif bir geçiş hissi için minik bir gecikme
        setTimeout(removeLoader, 250);
      }
    };
  });

  const musicBtn = document.getElementById("musicBtn");
  const musicHintLabel = document.getElementById("musicHintLabel");
  let manuallyPaused = false;
  let playAttempt = 0;

  function syncMusicControl() {
    const playing = !audio.paused && !audio.ended && !audio.error;
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-pressed", String(playing));
    musicBtn.setAttribute("aria-label", playing ? "Müziği durdur" : "Müziği başlat");
    musicHintLabel.textContent = playing
      ? "Müziği durdurmak için dokunun"
      : "Müzik için lütfen dokunun";
  }

  function tryPlayAudio() {
    if (manuallyPaused || !audio.paused) return;
    const attempt = ++playAttempt;
    audio.volume = 0.8;
    audio.muted = false;
    // play() doğrudan kullanıcı olayı içinde çağrılır; animasyon beklenmez.
    try {
      const result = audio.play();
      if (result) result.catch(() => {
        if (attempt === playAttempt && audio.paused) syncMusicControl();
      });
    } catch (_) { syncMusicControl(); }
  }

  window.handleMusicBtn = function() {
    if (!audio.paused) {
      manuallyPaused = true;
      ++playAttempt;
      audio.pause();
    } else {
      manuallyPaused = false;
      if (audio.error) audio.load();
      tryPlayAudio();
    }
    syncMusicControl();
  };

  ["playing", "pause", "ended", "error"].forEach(event => {
    audio.addEventListener(event, syncMusicControl);
  });
  audio.addEventListener("error", () => {
    musicHintLabel.textContent = "Müzik yüklenemedi · Tekrar dokunun";
  });

  function unlockAudio(event) {
    if (event && event.target && event.target.closest("#musicHintWrap")) return;
    tryPlayAudio();
  }

  // Android ve iOS'ta parmak ekrana değer değmez veya kaydırmaya başladığı anda ses kilidini aç
  const interactionEvents = ["pointerdown", "touchstart", "touchmove", "touchend", "click"];
  interactionEvents.forEach(evt => {
    document.addEventListener(evt, unlockAudio, { passive: true });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") unlockAudio(event);
  });
  syncMusicControl();
  tryPlayAudio();

  // -------------------------------------------------------------------------
  // 1 & 2: ZARF AÇILIŞ ANİMASYONU
  // -------------------------------------------------------------------------
  window.handleOpenEnvelope = function() {
    if (envelopeLayer.classList.contains("unveiled")) return;

    tryPlayAudio();
    envelopeLayer.classList.add("unveiled");

    const appContainer = document.getElementById("invitation-app");
    if (appContainer) {
      appContainer.scrollTop = 0;
    }

    // Kutlama konfetisi
    try {
      if (typeof confetti === "function") {
        confetti({
          particleCount: 55,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#bda061', '#ebd7b2', '#6b7a60', '#ffffff']
        });
      }
    } catch (e) {}
  };

  // -------------------------------------------------------------------------
  // PARMAK İLE KAYDIRINCA ANINDA TEPKİ (SWIPE UP / DOWN)
  // -------------------------------------------------------------------------
  let touchStartY = 0;
  let touchStartX = 0;

  envelopeLayer.addEventListener("touchstart", (e) => {
    tryPlayAudio();
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  envelopeLayer.addEventListener("touchmove", (e) => {
    tryPlayAudio();
    const currentY = e.touches[0].clientY;
    const diffY = touchStartY - currentY;
    // Kullanıcı yukarı doğru 20px kaydırdığı anda BEKLETMEDEN ANINDA AÇ
    if (diffY > 20) {
      window.handleOpenEnvelope();
    }
  }, { passive: true });

  envelopeLayer.addEventListener("touchend", (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;
    if (Math.abs(diffY) > 20) {
      window.handleOpenEnvelope();
    }
  }, { passive: true });

  // Mouse tekerleği ile kaydırma desteği
  envelopeLayer.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > 10) {
      window.handleOpenEnvelope();
    }
  }, { passive: true });

  // -------------------------------------------------------------------------
  // DİĞER BÖLÜMLERE YUMUŞAK KAYDIRMA
  // -------------------------------------------------------------------------
  window.navigateTo = function(targetElementId) {
    const el = document.getElementById(targetElementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // -------------------------------------------------------------------------
  // CANLI GERİ SAYIM SAYACI (Opsiyonel)
  // -------------------------------------------------------------------------
  function updateCountdown() {
    const daysEl = document.getElementById("cntDays");
    if (!daysEl) return;
    const now = new Date().getTime();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
      daysEl.innerText = "0";
      const h = document.getElementById("cntHours"); if (h) h.innerText = "00";
      const m = document.getElementById("cntMins"); if (m) m.innerText = "00";
      const s = document.getElementById("cntSecs"); if (s) s.innerText = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.innerText = days;
    const h = document.getElementById("cntHours"); if (h) h.innerText = String(hours).padStart(2, '0');
    const m = document.getElementById("cntMins"); if (m) m.innerText = String(mins).padStart(2, '0');
    const s = document.getElementById("cntSecs"); if (s) s.innerText = String(secs).padStart(2, '0');
  }
  updateCountdown();

  // -------------------------------------------------------------------------
  // TAKVİME EKLE FONKSİYONLARI
  // -------------------------------------------------------------------------
  window.addGoogleEvent = function(e) {
    e.preventDefault();
    const title = encodeURIComponent("Melisa & Eray Düğün Töreni");
    const details = encodeURIComponent("Melisa ve Eray'ın düğün töreni. Sizleri de bu mutlu günümüzde aramızda görmekten onur duyarız.");
    const location = encodeURIComponent("Alanya Belediyesi Nikah Salonu, Alanya");
    const dates = "20261117T130000Z/20261117T160000Z";
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`, '_blank');
  };

  window.addAppleEvent = function(e) {
    e.preventDefault();
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Melisa & Eray//Dugun//TR",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "DTSTART:20261117T130000Z",
      "DTEND:20261117T160000Z",
      "SUMMARY:Melisa & Eray Düğün Töreni",
      "DESCRIPTION:Melisa ve Eray'ın düğün töreni. Sizleri de aramızda görmekten mutluluk duyarız.",
      "LOCATION:Alanya Belediyesi Nikah Salonu",
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "melisa-eray-davetiye.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------------------
  // HARİTA MODALI
  // -------------------------------------------------------------------------
  window.showMap = function() {
    mapModal.style.display = "flex";
  };

  window.hideMap = function(e) {
    if (e && e.target !== mapModal && !e.target.classList.contains("modal-close-trigger")) {
      return;
    }
    mapModal.style.display = "none";
  };

  // -------------------------------------------------------------------------
  // TELEGRAM BOT BİLDİRİM ENTEGRASYONU (@Davet12Bot)
  // -------------------------------------------------------------------------
  const TG_BOT_TOKEN = "8826023436:AAFqqHsxSfP8eGEgwCGkmJd1D0pIc1_p7bo";
  const TG_CHAT_ID = "5411477981";

  async function sendTelegramMessage(text) {
    try {
      await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: text,
          parse_mode: "HTML"
        })
      });
    } catch (err) {
      console.log("Telegram notification:", err);
    }
  }

  // -------------------------------------------------------------------------
  // KATILIM (RSVP) & MESAJ İŞLEMLERİ
  // -------------------------------------------------------------------------
  let selectedRsvpChoice = null;

  window.handleRsvpChoice = function(isComing) {
    const btnYes = document.getElementById("btnRsvpYes");
    const btnNo = document.getElementById("btnRsvpNo");
    const guestBlock = document.getElementById("guestAttendanceBlock");
    const guestCountSelect = document.getElementById("guestCountSelect");
    const guestNameInput = document.getElementById("guestNameInput");

    selectedRsvpChoice = isComing;

    if (isComing) {
      btnYes.classList.add("selected");
      btnNo.classList.remove("selected");
      guestBlock.style.display = "block";
      guestCountSelect.style.display = "block";
      guestNameInput.placeholder = "Adınız ve Soyadınız (Katılımcı)";
      showToastNotification("Harika! Lütfen adınızı yazıp onaylayın ✨");
      
      try {
        if (typeof confetti === "function") {
          confetti({
            particleCount: 50,
            spread: 65,
            origin: { y: 0.8 },
            colors: ['#879979', '#bda061', '#ffffff']
          });
        }
      } catch (e) {}
    } else {
      btnNo.classList.add("selected");
      btnYes.classList.remove("selected");
      guestBlock.style.display = "block";
      guestCountSelect.style.display = "none";
      guestNameInput.placeholder = "Adınız ve Soyadınız";
      showToastNotification("Gönülden yanımızda olduğunuzu biliyoruz 🤍");
    }
  };

  window.submitRsvpToTelegram = function() {
    const nameField = document.getElementById("guestNameInput");
    const countSelect = document.getElementById("guestCountSelect");
    const guestName = nameField.value.trim();

    if (!guestName) {
      showToastNotification("Lütfen adınızı ve soyadınızı yazın.");
      nameField.focus();
      return;
    }

    if (selectedRsvpChoice === null) {
      showToastNotification("Lütfen katılım durumunuzu seçin.");
      return;
    }

    const isYes = selectedRsvpChoice === true;
    const count = countSelect.value;
    const nowStr = new Date().toLocaleString("tr-TR");

    let tgMsg = "";
    if (isYes) {
      tgMsg = `🌸 <b>YENİ DAVETİYE KATILIM BİLDİRİMİ!</b>\n\n` +
              `✅ <b>Durum:</b> EVET, KATILACAĞIM\n` +
              `👤 <b>İsim:</b> ${guestName}\n` +
              `👥 <b>Kişi Sayısı:</b> ${count}\n` +
              `🕒 <b>Tarih:</b> ${nowStr}`;
      showToastNotification("Katılım cevabınız başarıyla iletildi! 🎉");
    } else {
      tgMsg = `🤍 <b>YENİ DAVETİYE BİLDİRİMİ</b>\n\n` +
              `❌ <b>Durum:</b> MAALESEF KATILAMAYACAĞIM\n` +
              `👤 <b>İsim:</b> ${guestName}\n` +
              `🕒 <b>Tarih:</b> ${nowStr}`;
      showToastNotification("Cevabınız sevgiyle iletildi, teşekkürler 🤍");
    }

    sendTelegramMessage(tgMsg);
    nameField.value = "";
    document.getElementById("guestAttendanceBlock").style.display = "none";
  };

  window.handleSendGuestNote = function() {
    const noteField = document.getElementById("guestNoteInput");
    const nameField = document.getElementById("guestNameInput");
    const note = noteField.value.trim();
    const guestName = nameField.value.trim() || "Bir Misafir";

    if (!note) {
      showToastNotification("Lütfen bir dilek veya mesaj yazın.");
      return;
    }

    const nowStr = new Date().toLocaleString("tr-TR");
    const tgMsg = `💌 <b>YENİ DİLEK / TEBRİK MESAJI!</b>\n\n` +
                  `👤 <b>Gönderen:</b> ${guestName}\n` +
                  `💬 <b>Mesaj:</b>\n"<i>${note}</i>"\n\n` +
                  `🕒 <b>Tarih:</b> ${nowStr}`;

    sendTelegramMessage(tgMsg);
    showToastNotification("Mesajınız sevgiyle iletildi! 💕");
    noteField.value = "";
    
    try {
      if (typeof confetti === "function") {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.85 }
        });
      }
    } catch (e) {}
  };

  function showToastNotification(text) {
    toastMsg.innerText = text;
    toastPill.classList.add("active");
    setTimeout(() => {
      toastPill.classList.remove("active");
    }, 3500);
  }

  // -------------------------------------------------------------------------
  // SÜREKLİ DÜŞEN GÜL YAPRAKLARI ANİMASYONU
  // -------------------------------------------------------------------------
  function spawnFallingPetal() {
    if (!petalsLayer) return;
    const petal = document.createElement("div");
    petal.classList.add("falling-petal");
    
    const size = Math.random() * 11 + 9;
    petal.style.width = size + "px";
    petal.style.height = (size * 1.35) + "px";
    petal.style.left = Math.random() * 100 + "vw";
    
    const duration = Math.random() * 3 + 5;
    petal.style.animationDuration = duration + "s";
    petal.style.setProperty("--dest-x", (Math.random() * 90 - 45) + "px");
    petal.style.setProperty("--dest-rot", (Math.random() * 360 + 180) + "deg");
    
    petalsLayer.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000);
  }

  setInterval(spawnFallingPetal, 1100);
});
