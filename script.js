console.log("Let's javascript started")



let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {

    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
     songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
   // show all playlist of the songss
    let songUl = document.querySelector(".songslists").getElementsByTagName("ul")[0]
    songUl.innerHTML= ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">

                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div> vishu </div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>

                                <img class="invert" src="img/playbutton.svg" alt="">
                            </div>  </li>`;




}
 // Atach an event listener to each song
    Array.from(document.querySelector(".songslists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
    return songs;
}
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {

        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
    


}
async function displayAlbums() {
    let res = await fetch(`/songs/`);
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;

    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");

    let array = Array.from(anchors);
    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        if (e.getAttribute("href").includes("/songs") && !e.getAttribute("href").includes(".htaccess")) {
        
            let folder = e.getAttribute("href").split("/").filter(Boolean).pop();

            try {
                let infoRes = await fetch(`/songs/${folder}/info.json`);
                let info = await infoRes.json();

                cardcontainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                 <div class="play">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg></div>
                        <img src="/songs/${folder}/cover.jpg" alt="${info.title}">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            } catch (err) {
                console.error(` Could not load info.json for folder "${folder}"`, err);
            }
        }
    }

    // load playlist when load the file
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getsongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // get the all list of songs
      await getsongs("songs/ncs")
    playMusic(songs[0], true);

     // display the album of the page
       await displayAlbums()

     


    

    // Atach an event listner to play , previous and next

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/playbutton.svg"
        }
    })
    //   listen song to update timeevent
    currentSong.addEventListener("timeupdate", () => {
       
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} /${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // Add an event listener seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener on hamburger
    document.querySelector(".hugeburger").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener on close 
    document.querySelector(".close").addEventListener("click" , () =>{
        document.querySelector(".left").style.left = "-120%"
    }) 

   
 // add event listener on previous 
 previous.addEventListener("click", () =>{
    currentSong.pause()
    console.log("previous clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index-1)>=0){
        playMusic(songs[index-1]);
    }
 })

   // Add event listner on next 
   next.addEventListener("click" , () => {
     currentSong.pause()
    console.log("next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index+1) < songs.length){
        playMusic(songs[index+1]);
    }
   })
   // Add event listener on volume
   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" , (e) => {
    console.log("setting volume to " , e.target.value,"/100")
    currentSong.volume = parseInt(e.target.value)/100
    if(currentSong.volume > 0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
   })

   // Add event listener to mute the track
   document.querySelector(".volume>img").addEventListener("click", e => {
 
     if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg" , "mute.svg")
        currentSong.volume = 0;
         document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
     }
     else{
        e.target.src = e.target.src.replace("mute.svg" , "volume.svg")
        currentSong.volume = .10;
         document.querySelector(".range").getElementsByTagName("input")[0].value =10;
     }
   })
   

}
main()

