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
  const musicBtn = document.getElementById("musicBtn");
  const toastPill = document.getElementById("toastPill");
  const toastMsg = document.getElementById("toastMsg");
  const mapModal = document.getElementById("mapModal");
  const petalsLayer = document.getElementById("petals-canvas-layer");

  let isAudioActive = false;

  // -------------------------------------------------------------------------
  // MÜZİK KONTROLÜ
  // -------------------------------------------------------------------------
  musicBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isAudioActive) {
      audio.pause();
      musicBtn.classList.remove("is-playing");
    } else {
      audio.play().then(() => {
        musicBtn.classList.add("is-playing");
      }).catch(err => console.log("Audio playback:", err));
    }
    isAudioActive = !isAudioActive;
  });

  // -------------------------------------------------------------------------
  // 1 & 2: ZARF AÇILIŞ ANİMASYONU
  // -------------------------------------------------------------------------
  window.handleOpenEnvelope = function() {
    // 3D Kapağın açılması ve kartın çıkışı
    envelopeBox.classList.add("anim-open");

    // Kutlama konfetisi
    try {
      if (typeof confetti === "function") {
        confetti({
          particleCount: 65,
          spread: 80,
          origin: { y: 0.62 },
          colors: ['#bda061', '#ebd7b2', '#6b7a60', '#ffffff']
        });
      }
    } catch (e) {}

    // Müziği ilk dokunuşta başlat
    if (!isAudioActive) {
      audio.play().then(() => {
        isAudioActive = true;
        musicBtn.classList.add("is-playing");
      }).catch(() => {});
    }

    // 1 saniye sonra zarf katmanını kaldırıp ana davetiyeye geç
    setTimeout(() => {
      envelopeLayer.classList.add("unveiled");
    }, 1000);
  };

  // -------------------------------------------------------------------------
  // PARMAK İLE KAYDIRINCA (SWIPE UP / DOWN) AÇILMA ÖZELLİĞİ
  // -------------------------------------------------------------------------
  let touchStartY = 0;
  let touchStartX = 0;

  envelopeLayer.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  envelopeLayer.addEventListener("touchend", (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = touchStartY - touchEndY;
    const diffX = Math.abs(touchStartX - touchEndX);

    // Kullanıcı yukarı doğru en az 40px kaydırdıysa (veya aşağı kaydırdıysa)
    if (Math.abs(diffY) > 40 && Math.abs(diffY) > diffX) {
      window.handleOpenEnvelope();
    }
  }, { passive: true });

  // Mouse tekerleği (wheel) ile kaydırma desteği
  envelopeLayer.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > 20) {
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
  // CANLI GERİ SAYIM SAYACI (17 KASIM 2026)
  // -------------------------------------------------------------------------
  function updateCountdown() {
    const now = new Date().getTime();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
      document.getElementById("cntDays").innerText = "0";
      document.getElementById("cntHours").innerText = "00";
      document.getElementById("cntMins").innerText = "00";
      document.getElementById("cntSecs").innerText = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("cntDays").innerText = days;
    document.getElementById("cntHours").innerText = String(hours).padStart(2, '0');
    document.getElementById("cntMins").innerText = String(mins).padStart(2, '0');
    document.getElementById("cntSecs").innerText = String(secs).padStart(2, '0');
  }
  setInterval(updateCountdown, 1000);
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
  // KATILIM (RSVP) & MESAJ İŞLEMLERİ
  // -------------------------------------------------------------------------
  window.handleRsvpChoice = function(isComing) {
    const btnYes = document.getElementById("btnRsvpYes");
    const btnNo = document.getElementById("btnRsvpNo");
    const guestBlock = document.getElementById("guestAttendanceBlock");

    if (isComing) {
      btnYes.classList.add("selected");
      btnNo.classList.remove("selected");
      guestBlock.style.display = "block";
      showToastNotification("Harika! Katılımınızı heyecanla bekliyoruz ✨");
      
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
      guestBlock.style.display = "none";
      showToastNotification("Gönülden yanımızda olduğunuzu biliyoruz, teşekkürler 🤍");
    }
  };

  window.handleSendGuestNote = function() {
    const noteField = document.getElementById("guestNoteInput");
    if (!noteField.value.trim()) {
      showToastNotification("Lütfen bir dilek veya mesaj yazın.");
      return;
    }
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
