console.log("GitHub Pages compatible music player");

let audio = new Audio();
let currentSong = null;
let currentAlbum = null;
let songs = [];

// --- Albums configuration ---
const albums = [
  { folder: "Aashiqui-2", path: "songs1/Aashiqui-2/" },
  { folder: "Rowdy- Rathore", path: "songs1/Rowdy- Rathore/" },
  { folder: "Angry_(mood)", path: "songs1/Angry_(mood)/" },
  { folder: "Bright_(mood)", path: "songs1/Bright_(mood)/" },
  { folder: "Chill_(mood)", path: "songs1/Chill_(mood)/" },
  { folder: "Dark_(mood)", path: "songs1/Dark_(mood)/" },
  { folder: "Diljit", path: "songs1/Diljit/" },
  { folder: "Funky_(mood)", path: "songs1/Funky_(mood)/" },
  { folder: "Love_(mood)", path: "songs1/Love_(mood)/" }
];

// --- Load album songs from info.json ---
async function loadAlbum(album) {
  currentAlbum = album;
  try {
    const res = await fetch(`${album.path}info.json`);
    const info = await res.json();

    document.querySelector(".spotifyPlaylist h1").textContent = info.title || album.folder;

    // Songs array from info.json or empty
    songs = info.songs || [];

    updateSongList(songs);
    updateAlbumCover(info.cover ? `${album.path}${info.cover}` : "");
  } catch (err) {
    console.error("Error loading album info:", err);
    songs = [];
    updateSongList(songs);
  }
}

// --- Update album cover ---
function updateAlbumCover(src) {
  const cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = src ? `<img src="${src}" alt="Album Cover" class="rounded" style="width:200px;"/>` : "";
}

// --- Update song list ---
function updateSongList(songs) {
  const songUl = document.querySelector(".songlist ul");
  if (!songUl) return;
  songUl.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img class="invert" src="img/music.svg" alt="Music" />
      <div class="info">
        <div>${song}</div>
        <div>Unknown</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img src="img/play.svg" alt="" class="invert" />
      </div>
    `;
    li.addEventListener("click", () => playSongAtIndex(index));
    songUl.appendChild(li);
  });
}

// --- Play song ---
function playSongAtIndex(index) {
  if (!songs.length || index < 0 || index >= songs.length) return;
  currentSong = songs[index];
  audio.src = `${currentAlbum.path}${encodeURIComponent(currentSong)}.mp3`;
  audio.play().then(() => {
    document.querySelector("#play").src = "img/pause.svg";
    document.querySelector(".songinfo").textContent = currentSong;
    updateActiveSong(index);
  }).catch(err => console.error("Error playing song:", err));
}

// --- Highlight current song ---
function updateActiveSong(index) {
  document.querySelectorAll(".songlist li").forEach(el => el.classList.remove("selected"));
  document.querySelectorAll(".songlist li")[index]?.classList.add("selected");
}

// --- Buttons ---
document.querySelector("#play").addEventListener("click", () => {
  if (!currentSong) playSongAtIndex(0);
  else if (audio.paused) { audio.play(); document.getElementById("play").src = "img/pause.svg"; }
  else { audio.pause(); document.getElementById("play").src = "img/play.svg"; }
});

document.querySelector("#next").addEventListener("click", () => {
  let newIndex = (songs.indexOf(currentSong) + 1) % songs.length;
  playSongAtIndex(newIndex);
});
document.querySelector("#previous").addEventListener("click", () => {
  let newIndex = (songs.indexOf(currentSong) - 1 + songs.length) % songs.length;
  playSongAtIndex(newIndex);
});

// --- Seekbar ---
audio.addEventListener("timeupdate", () => {
  let songTime = document.querySelector(".songtime");
  if (!songTime) return;
  let currentTime = formatTime(audio.currentTime);
  let duration = formatTime(audio.duration);
  songTime.textContent = `${currentTime} / ${duration}`;
  document.querySelector('.circle').style.left = (audio.currentTime / audio.duration) * 100 + "%";
});

document.querySelector(".seekbar").addEventListener("click", e => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  audio.currentTime = ((audio.duration) * percent) / 100;
});

// --- Format time ---
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  let minutes = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

// --- Sidebar toggle ---
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120%";
});

// --- Volume control ---
document.querySelector(".range input").addEventListener("change", e => {
  audio.volume = parseInt(e.target.value)/100;
});

// --- Auto next song ---
audio.addEventListener("ended", () => {
  let newIndex = (songs.indexOf(currentSong) + 1) % songs.length;
  playSongAtIndex(newIndex);
});

// --- Initialize ---
function main() {
  if (albums.length > 0) loadAlbum(albums[0]); // Load first album by default
}
main();

