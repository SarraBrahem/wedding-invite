const envelope = document.getElementById("envelope");
const seal = document.getElementById("seal");

const screenEnvelope = document.getElementById("screen-envelope");
const screenInvite = document.getElementById("screen-invite");
const backBtn = document.getElementById("backBtn");

// ===== Countdown elements =====
const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");
const cdNote = document.getElementById("cdNote");

/* =======================
   Wax sound (no file)
   ======================= */
let audioCtx;

function playWaxPop() {
    try {
        audioCtx = audioCtx || new(window.AudioContext || window.webkitAudioContext)();

        // iOS: parfois l’audio context est "suspended" => resume sur interaction
        if (audioCtx.state === "suspended") audioCtx.resume();

        const t0 = audioCtx.currentTime;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(240, t0);
        osc.frequency.exponentialRampToValueAtTime(95, t0 + 0.06);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, t0);

        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.28, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t0);
        osc.stop(t0 + 0.13);
    } catch (e) {
        console.error(e);
    }
}

/* =======================
   Music (YouTube Iframe API)
   ======================= */
const musicToggle = document.getElementById("musicToggle");
const YT_ID = "b9v96HD_3_U";

let player = null;
let musicStarted = false;
let musicMuted = false;

// YouTube API callback
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player("ytPlayer", {
        videoId: YT_ID,
        playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            loop: 1,
            playlist: YT_ID,
        },
        events: {
            onReady: () => {
                // prêt
            },
        },
    });
};

function startMusic() {
    if (musicStarted) return;
    if (!player || !player.playVideo) return;

    player.unMute();
    player.setVolume(60);

    // important mobile: playVideo doit venir d’un tap/click utilisateur
    player.playVideo();

    musicStarted = true;
    musicMuted = false;

    if (musicToggle) {
        musicToggle.classList.add("is-on");
        musicToggle.textContent = "🔇 Muet";
        musicToggle.setAttribute("aria-pressed", "false");
    }
}

function toggleMusicMute() {
    if (!player || !musicToggle) return;

    if (!musicMuted) {
        player.mute();
        musicMuted = true;
        musicToggle.textContent = "🔊 Son";
        musicToggle.setAttribute("aria-pressed", "true");
    } else {
        player.unMute();
        player.playVideo();
        musicMuted = false;
        musicToggle.textContent = "🔇 Muet";
        musicToggle.setAttribute("aria-pressed", "false");
    }
}

musicToggle.addEventListener("click", toggleMusicMute);

/* =======================
   Countdown (18/04/2026)
   ======================= */
// heure à adapter si tu veux
const WEDDING_DATE = new Date("2026-04-18T14:00:00+02:00");

function pad2(n) {
    return String(n).padStart(2, "0");
}

function updateCountdown() {
    if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

    const now = new Date();
    const diffMs = WEDDING_DATE.getTime() - now.getTime();

    if (diffMs <= 0) {
        cdDays.textContent = "00";
        cdHours.textContent = "00";
        cdMins.textContent = "00";
        cdSecs.textContent = "00";
        if (cdNote) cdNote.textContent = "C’est le grand jour 🤍";
        return;
    }

    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / (3600 * 24));
    const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    cdDays.textContent = pad2(days);
    cdHours.textContent = pad2(hours);
    cdMins.textContent = pad2(mins);
    cdSecs.textContent = pad2(secs);
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* =======================
   Gallery (Apps Script)
   ======================= */
const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbzpccJmkE7TpVlGdRtRIjI3qe3NXo9yxSKq_dhGOxOAyhZWda86UNQs9kFvbDzLEWGWhg/exec";
const GALLERY_KEY = "YS-2026"; // doit matcher SECRET_KEY du script

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    const status = document.getElementById("galleryStatus");
    if (!gallery || !status) return;

    status.textContent = "Chargement des photos…";

    try {
        const url = `${WEB_APP_URL}?action=list&key=${encodeURIComponent(GALLERY_KEY)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.ok) throw new Error(data.error || "Erreur");

        if (data.count === 0) {
            status.textContent = "Pas encore de photos. Revenez plus tard ✨";
            return;
        }

        status.textContent = `${data.count} photo(s) disponible(s).`;

        gallery.innerHTML = data.items
            .map(
                (it) => `
        <div class="gallery-item" data-id="${it.id}" title="${it.name}">
          <img src="${it.thumb}" alt="${it.name}">
        </div>
      `
            )
            .join("");

        gallery.addEventListener(
            "click",
            (e) => {
                const card = e.target.closest(".gallery-item");
                if (!card) return;
                const id = card.getAttribute("data-id");
                const fileUrl = `${WEB_APP_URL}?action=file&id=${encodeURIComponent(
          id
        )}&key=${encodeURIComponent(GALLERY_KEY)}`;
                window.open(fileUrl, "_blank");
            }, { once: true }
        );
    } catch (err) {
        console.error(err);
        status.textContent =
            "Impossible de charger la galerie (vérifie l’URL Apps Script + le code secret).";
    }
}

/* =======================
   Envelope logic
   ======================= */
let isOpen = false;

function openEnvelope() {
    if (isOpen) return;
    isOpen = true;

    // ✅ tout déclenché par le tap (mobile friendly)
    playWaxPop();
    startMusicSafe();
    loadGallery();

    envelope.classList.add("is-open");

    setTimeout(() => {
        screenEnvelope.style.display = "none";
        screenInvite.classList.add("is-visible");
    }, 1200);
}

function closeInvite() {
    screenInvite.classList.remove("is-visible");
    screenInvite.style.display = "none";
    screenEnvelope.style.display = "flex";

    envelope.classList.remove("is-open");
    isOpen = false;

    setTimeout(() => {
        screenInvite.style.display = "";
    }, 10);
}

seal.addEventListener("click", (e) => {
    e.stopPropagation();
    openEnvelope();
});

envelope.addEventListener("click", openEnvelope);

envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openEnvelope();
});

backBtn.addEventListener("click", closeInvite);

function startMusicSafe() {
    if (player && player.playVideo) {
        startMusic();
    } else {
        setTimeout(() => {
            if (player && player.playVideo) startMusic();
        }, 200);
    }
}