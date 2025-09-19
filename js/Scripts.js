// Scripts.js (Static, GitHub Pages compatible)

let audio = new Audio();
let currentSong = null;
let currentAlbum = null;
let songs = [];

// ----- Hardcoded Albums -----
const albums = [
  { 
    folder: "songs1/Aashiqui-2", 
    songs: ["Aasan Nahin Yahah", "Aashiqui (The Love Theme)"], 
    cover: "songs1/Aashiqui-2/cover.jpg",
    title: "Aashiqui 2",
    description: "Popular songs from Aashiqui 2"
  },
  { 
    folder: "songs1/Rowdy- Rathore", 
    songs: ["Chandaniya Chup jana re"], 
    cover: "songs1/Rowdy- Rathore/cover.jpg",
    title: "Rowdy Rathore",
    description: "Hit songs from Rowdy Rathore"
  },
  { 
    folder: "songs1/Chill_(mood)", 
    songs: ["chill1", "chill2"], 
    cover: "songs1/Chill_(mood)/cover.jpg",
    title: "Chill Vibes",
    description: "Relaxing chill songs"
  }
];

// ----- Functions -----

function loadAlbum(album) {
  currentAlbum = album;
  songs = album.songs;
  document.querySelector(".spotifyPlaylist h1").textContent = album.title;
  document.querySelector(".cardContainer").innerHTML = `
    <div class="card rounded" data-folder="${album.folder}">
      <div class="play">
        <img src="img/play.svg" alt="play button">
      </div>
      <img src="${album.cover}" class="rounded" alt="cover" style="width:200px;">
      <h2>${album.title}</h2>
      <p>${album.description}</p>
    </div>`;
  updateSongList(songs);
  setupCardListener();
}

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

function playSongAtIndex(index) {
  if (!songs.length || index < 0 || index >= songs.length) return;
  currentSong = songs[index];
  audio.src = `${currentAlbum.folder}/${encodeURIComponent(currentSong)}.mp3`;
  audio.play().then(() => {
    document.querySelector("#play").src = "img/pause.svg";
    document.querySelector(".songinfo").textContent = currentSong;
    highlightSong(index);
  }).catch(err => console.error("Error playing song:", err));
}

function highlightSong(index) {
  document.querySelectorAll(".songlist li").forEach(el => el.classList.remove("selected"));
  document.querySelectorAll(".songlist li")[index]?.classList.add("selected");
}

// ----- Buttons -----

document.querySelector("#play").addEventListener("click", () => {
  if (!currentSong) playSongAtIndex(0);
  else if (audio.paused) { audio.play(); document.querySelector("#play").src = "img/pause.svg"; }
  else { audio.pause(); document.querySelector("#play").src = "img/play.svg"; }
});

document.querySelector("#next").addEventListener("click", () => {
  let newIndex = (songs.indexOf(currentSong) + 1) % songs.length;
  playSongAtIndex(newIndex);
});

document.querySelector("#previous").addEventListener("click", () => {
  let newIndex = (songs.indexOf(currentSong) - 1 + songs.length) % songs.length;
  playSongAtIndex(newIndex);
});

// ----- Seekbar -----
audio.addEventListener("timeupdate", () => {
  const songTime = document.querySelector(".songtime");
  if (!songTime) return;
  const currentTime = formatTime(audio.currentTime);
  const duration = formatTime(audio.duration);
  songTime.textContent = `${currentTime} / ${duration}`;
  document.querySelector('.circle').style.left = (audio.currentTime / audio.duration) * 100 + "%";
});

document.querySelector(".seekbar").addEventListener("click", e => {
  const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  audio.currentTime = (audio.duration * percent) / 100;
});

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

// ----- Sidebar -----
document.querySelector(".hamburger").addEventListener("click", () => { document.querySelector(".left").style.left = "0"; });
document.querySelector(".close").addEventListener("click", () => { document.querySelector(".left").style.left = "-120%"; });

// ----- Volume -----
document.querySelector(".range input").addEventListener("change", e => { audio.volume = parseInt(e.target.value)/100; });

// ----- Auto next song -----
audio.addEventListener("ended", () => {
  let newIndex = (songs.indexOf(currentSong) + 1) % songs.length;
  playSongAtIndex(newIndex);
});

// ----- Album Card Click -----
function setupCardListener() {
  const card = document.querySelector(".card");
  if (!card) return;
  card.addEventListener("click", () => {
    const folder = card.dataset.folder;
    const album = albums.find(a => a.folder === folder);
    if (album) loadAlbum(album);
  });
}

// ----- Init -----
function main() { if(albums.length > 0) loadAlbum(albums[0]); }
main();
