const envelope = document.getElementById("envelope");
const seal = document.getElementById("seal");

const screenEnvelope = document.getElementById("screen-envelope");
const screenInvite = document.getElementById("screen-invite");
const backBtn = document.getElementById("backBtn");

const ytAudio = document.getElementById("ytAudio");
const musicToggle = document.getElementById("musicToggle");

// ID de ta vidéo (depuis ton lien)
const YT_ID = "b9v96HD_3_U";

let musicStarted = false;
let musicMuted = false;

function startMusic() {
    if (musicStarted || !ytAudio) return;

    // Autoplay + loop (loop nécessite playlist=ID)
    ytAudio.src =
        `https://www.youtube-nocookie.com/embed/${YT_ID}` +
        `?autoplay=1&loop=1&playlist=${YT_ID}&controls=0&rel=0&modestbranding=1`;

    musicStarted = true;
    musicMuted = false;

    // montre le bouton muet
    if (musicToggle) {
        musicToggle.classList.add("is-on");
        musicToggle.textContent = "🔇 Muet";
        musicToggle.setAttribute("aria-pressed", "false");
    }
}

// “Mute” propre avec YouTube embed : on stoppe/restart (simple et fiable)
function toggleMusicMute() {
    if (!musicStarted || !ytAudio || !musicToggle) return;

    if (!musicMuted) {
        ytAudio.src = ""; // stop
        musicMuted = true;
        musicToggle.textContent = "🔊 Son";
        musicToggle.setAttribute("aria-pressed", "true");
    } else {
        // restart
        ytAudio.src =
            `https://www.youtube-nocookie.com/embed/${YT_ID}` +
            `?autoplay=1&loop=1&playlist=${YT_ID}&controls=0&rel=0&modestbranding=1`;
        musicMuted = false;
        musicToggle.textContent = "🔇 Muet";
        musicToggle.setAttribute("aria-pressed", "false");
    }
}

musicToggle.addEventListener("click", toggleMusicMute);

let isOpen = false;

function openEnvelope() {

    if (isOpen) return;
    isOpen = true;
    startMusic();
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