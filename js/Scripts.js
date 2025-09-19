// Scripts.js (GitHub Pages ready)
let audio = new Audio();
let currentSong = null;
let currentAlbum = null;
let songs = [];

// Albums configuration
const albums = [
  { 
    folder: "songs1/Aashiqui-2", 
    songs: ["Aasan Nahin Yahah", "Aashiqui (The Love Theme)"], 
    cover: "cover.jpg",
    title: "Aashiqui 2",
    description: "Popular songs from Aashiqui 2"
  },
  {
    folder: "songs1/Rowdy- Rathore",
    songs: ["Chandaniya Chup jana re"],
    cover: "cover.jpg",
    title: "Rowdy Rathore",
    description: "Hit songs from Rowdy Rathore"
  },
  {
    folder: "songs1/Chill_(mood)",
    songs: ["chill1", "chill2"],
    cover: "cover.jpg",
    title: "Chill Vibes",
    description: "Relaxing chill songs"
  }
];

// Load album
function loadAlbum(album) {
  currentAlbum = album;
  songs = album.songs || [];
  document.querySelector(".spotifyPlaylist h1").textContent = album.title || album.folder;
  document.querySelector(".cardContainer").innerHTML = `<img src="${album.folder}/${album.cover}" alt="Album Cover" class="rounded" style="width:200px"/>`;
  updateSongList(songs);
}

// Update song list
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

// Play song
function playSongAtIndex(index) {
  if (!songs.length || index < 0 || index >= songs.length) return;
  currentSong = songs[index];
  audio.src = `${currentAlbum.folder}/${encodeURIComponent(currentSong)}.mp3`;
  audio.play().then(() => {
    document.querySelector("#play").src = "img/pause.svg";
    document.querySelector(".songinfo").textContent = currentSong;
    updateActiveSong(index);
  }).catch(err => console.error("Error playing song:", err));
}

// Highlight current song
function updateActiveSong(index) {
  document.querySelectorAll(".songlist li").forEach(el => el.classList.remove("selected"));
  document.querySelectorAll(".songlist li")[index]?.classList.add("selected");
}

// Play/Pause buttons
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

// Seekbar
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

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  let minutes = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

// Sidebar toggle
document.querySelector(".hamburger").addEventListener("click", () => { document.querySelector(".left").style.left = "0"; });
document.querySelector(".close").addEventListener("click", () => { document.querySelector(".left").style.left = "-120%"; });

// Volume
document.querySelector(".range input").addEventListener("change", e => { audio.volume = parseInt(e.target.value)/100; });

// Auto next song
audio.addEventListener("ended", () => {
  let newIndex = (songs.indexOf(currentSong) + 1) % songs.length;
  playSongAtIndex(newIndex);
});

// Init
function main() { if(albums.length>0) loadAlbum(albums[0]); }
main();
