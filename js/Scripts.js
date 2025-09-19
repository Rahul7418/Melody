console.log("Let's write JavaScript!"); // Initial console log to check if the script is running

let currFolder; // Stores the current folder containing the songs
let songs = []; // Array to hold the list of songs
let audio = new Audio(); // Creating an Audio object to play songs
let currentSong = null; // Stores the currently playing song

// Function to fetch the song list from the server
async function getSongs(folder) {
    currFolder = folder; // Set the current folder
    try {
        let response = await fetch(`http://127.0.0.1:3000/${folder}`); // Fetch the list of songs from the server
        let text = await response.text(); // Convert the response to text
        let div = document.createElement("div"); // Create a temporary div element
        div.innerHTML = text; // Insert the response text into the div
        let links = div.getElementsByTagName("a"); // Get all anchor (<a>) tags
        let songList = [];

        // Extract song names from the anchor tags
        for (let link of links) {
            if (link.href.endsWith(".mp3")) { // Check if the link is an MP3 file
                let songName = decodeURIComponent(link.href.split(`${folder}`).pop()).replace(".mp3", "").replace("/", "");
                songList.push(songName); // Add the song name to the list
            }
        }
        return songList; // Return the list of songs
    } catch (error) {
        console.error("Error fetching songs:", error);
        return []; // Return an empty list in case of an error
    }
}

// Function to update the song list in the UI
function updateSongList(songs) {
    let songUl = document.querySelector(".songlist ul"); // Get the <ul> element where songs will be listed
    if (!songUl) return; // If the element is not found, exit
    songUl.innerHTML = ""; // Clear the existing song list

    // Loop through each song and create an <li> element
    songs.forEach((song, index) => {
        let li = document.createElement("li");
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
        li.addEventListener("click", () => playSongAtIndex(index)); // Add click event to play the song
        songUl.appendChild(li); // Append the <li> to the song list
    });
}

// Function to play a song by index
function playSongAtIndex(index) {
    if (index < 0 || index >= songs.length) return; // Check if index is valid
    currentSong = songs[index]; // Set the current song
    audio.src = `http://127.0.0.1:3000/${currFolder}/${encodeURIComponent(currentSong)}.mp3`; // Set the audio source
    audio.play().then(() => {
        document.querySelector("#play").src = "img/pause.svg"; // Change play button to pause
        document.querySelector(".songinfo").textContent = currentSong; // Update song info
        updateActiveSong(index); // Highlight the active song in the UI
    }).catch(error => console.error("Error playing song:", error));
}

// Function to highlight the currently playing song in the UI
function updateActiveSong(index) {
    document.querySelectorAll(".songlist li").forEach(el => el.classList.remove("selected")); // Remove 'selected' class from all songs
    document.querySelectorAll(".songlist li")[index]?.classList.add("selected"); // Add 'selected' class to the active song
}

// Function to update the seekbar and song time display
function updateSongTime() {
    let songTime = document.querySelector(".songtime");
    if (!songTime) return;
    let currentTime = formatTime(audio.currentTime);
    let duration = formatTime(audio.duration);
    songTime.textContent = `${currentTime} / ${duration}`;
    document.querySelector('.circle').style.left = (audio.currentTime / audio.duration) * 100 + "%";
}

// Seekbar functionality - Allow clicking on seekbar to change song time
document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    audio.currentTime = ((audio.duration) * percent) / 100;
});

// Function to format time as MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Function to load a new playlist when clicking on a card
function setupCardListeners() {
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            let folder = `songs/${item.currentTarget.dataset.folder}`; // Get the folder name
            songs = await getSongs(folder); // Fetch songs from the folder
            if (songs.length > 0) {
                updateSongList(songs); // Update UI
                playSongAtIndex(0); // Play the first song
            } else {
                console.warn("No songs found in the selected folder.");
            }
        });
    });
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs`); // Fetch the list of songs
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

   let array = Array.from(anchors)
   for(let i = 0; i < array.length; i++){
    const e = array[i];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0]; // Extract folder name
            try {
                let metaResponse = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let metaData = await metaResponse.json();

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card rounded">
                        <div class="play">
                            <img src="img/play.svg" alt="play button">
                        </div>
                        <img class="rounded" src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${metaData.title}</h2>
                        <p>${metaData.description}</p>
                    </div>`;
            } catch (error) {
                console.error(`Error fetching metadata for ${folder}:`, error);
            }
        }
   }
   setupCardListeners(); 
}


// Main function to initialize the music player
async function main() {
    songs = await getSongs("songs/Aashiqui-2"); // Load default playlist
    updateSongList(songs); // Update song list in UI
    // Set up click events for playlist cards

    // Display all the Albums on the page
    displayAlbums(); 

    // Play/Pause button functionality
    document.querySelector("#play").addEventListener("click", () => {
        if (!currentSong) {
            playSongAtIndex(0);
        } else if(audio.paused){ 
            audio.play();
            document.getElementById("play").src = "img/pause.svg";
        }
        else{
             audio.pause(); // If playing, pause the song  
             document.getElementById("play").src = "img/play.svg"; 
        }
     });

    // Previous song button functionality
    document.querySelector("#previous").addEventListener("click", () => {
        let newIndex = (songs.indexOf(currentSong) - 1 + songs.length) % songs.length;
        playSongAtIndex(newIndex);
    });

    // Next song button functionality
    document.querySelector("#next").addEventListener("click", () => {
        let newIndex = (songs.indexOf(currentSong) + 1) % songs.length;
        playSongAtIndex(newIndex);
    });

    // Sidebar menu toggle functionality
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Volume control functionality
    document.querySelector(".range input").addEventListener("change", (e) => {
        audio.volume = parseInt(e.target.value) / 100;
    });

    // Auto-play next song when current song ends
    audio.addEventListener("ended", () => {
        let newIndex = (songs.indexOf(currentSong) + 1) % songs.length;
        playSongAtIndex(newIndex);
    });


    // Add EventListener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg") ){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            audio.volume = 0; 
            document.querySelector(".range input").value = 0;
        }else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            audio.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    })

    // Update seekbar during playback
    audio.addEventListener("timeupdate", updateSongTime);
}

// Start the application
main();
