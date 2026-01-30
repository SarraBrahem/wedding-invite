const envelope = document.getElementById("envelope");
const seal = document.getElementById("seal");

const screenEnvelope = document.getElementById("screen-envelope");
const screenInvite = document.getElementById("screen-invite");
const backBtn = document.getElementById("backBtn");

const ytAudio = document.getElementById("ytAudio");
const musicToggle = document.getElementById("musicToggle");

// ===== Countdown elements (doivent exister dans le HTML) =====
const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");
const cdNote = document.getElementById("cdNote");

// ID de ta vidéo (depuis ton lien)
const YT_ID = "b9v96HD_3_U";

let musicStarted = false;
let musicMuted = false;

/* =======================
   Wax sound (sans fichier)
   ======================= */
let audioCtx;

function playWaxPop() {
    try {
        audioCtx = audioCtx || new(window.AudioContext || window.webkitAudioContext)();

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
   Music (YouTube hidden)
   ======================= */
function startMusic() {
    if (musicStarted || !ytAudio) return;

    ytAudio.src =
        `https://www.youtube-nocookie.com/embed/${YT_ID}` +
        `?autoplay=1&loop=1&playlist=${YT_ID}&controls=0&rel=0&modestbranding=1`;

    musicStarted = true;
    musicMuted = false;

    if (musicToggle) {
        musicToggle.classList.add("is-on");
        musicToggle.textContent = "🔇 Muet";
        musicToggle.setAttribute("aria-pressed", "false");
    }
}

function toggleMusicMute() {
    if (!musicStarted || !ytAudio || !musicToggle) return;

    if (!musicMuted) {
        ytAudio.src = ""; // stop
        musicMuted = true;
        musicToggle.textContent = "🔊 Son";
        musicToggle.setAttribute("aria-pressed", "true");
    } else {
        ytAudio.src =
            `https://www.youtube-nocookie.com/embed/${YT_ID}` +
            `?autoplay=1&loop=1&playlist=${YT_ID}&controls=0&rel=0&modestbranding=1`;
        musicMuted = false;
        musicToggle.textContent = "🔇 Muet";
        musicToggle.setAttribute("aria-pressed", "false");
    }
}

musicToggle.addEventListener("click", toggleMusicMute);

/* =======================
   Countdown (18/04/2026)
   ======================= */
// Heure par défaut 14:00 (modifie si tu veux)
const WEDDING_DATE = new Date("2026-04-18T14:00:00+02:00");

function pad2(n) {
    return String(n).padStart(2, "0");
}

function updateCountdown() {
    // si les éléments n'existent pas, on ignore sans casser le site
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
   Envelope logic
   ======================= */
let isOpen = false;

function openEnvelope() {
    if (isOpen) return;
    isOpen = true;

    // ✅ important: musique + wax au moment du clic (autoplay OK)
    startMusic();
    playWaxPop();
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

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzpccJmkE7TpVlGdRtRIjI3qe3NXo9yxSKq_dhGOxOAyhZWda86UNQs9kFvbDzLEWGWhg/exec";
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

        gallery.innerHTML = data.items.map(it => `
      <div class="gallery-item" data-id="${it.id}" title="${it.name}">
        <img src="${it.thumb}" alt="${it.name}">
      </div>
    `).join("");

        // clic -> ouvre l'image via Apps Script (sans partager le Drive)
        gallery.addEventListener("click", (e) => {
            const card = e.target.closest(".gallery-item");
            if (!card) return;
            const id = card.getAttribute("data-id");
            const fileUrl = `${WEB_APP_URL}?action=file&id=${encodeURIComponent(id)}&key=${encodeURIComponent(GALLERY_KEY)}`;
            window.open(fileUrl, "_blank");
        }, { once: true });

    } catch (err) {
        console.error(err);
        status.textContent = "Impossible de charger la galerie (vérifie l’URL Apps Script + le code secret).";
    }
}

// Option: charger la galerie quand l’invitation est affichée
// (appelle loadGallery() dans openEnvelope() après l’ouverture)