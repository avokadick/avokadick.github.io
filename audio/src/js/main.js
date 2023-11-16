const $ = document;
let track_name = $.querySelector(".track-name");
let track_artist = $.querySelector(".track-artist");
let track_img__desc = $.querySelector(".track_img__desc");

let playpause_btn;
let next_btn = $.querySelector(".next-track");
let prev_btn = $.querySelector(".prev-track");
let list = $.querySelector("ul");

let seek_slider = $.querySelector(".seek_slider");
let volume_slider = $.querySelector(".volume_slider");
let random_track = $.querySelector(".random-track");
let repeat_track = $.querySelector(".repeat-track");
let curr_time = $.querySelector(".current-time");
let total_duration = $.querySelector(".total-duration");
let curr_track = $.createElement("audio");

let list_container = $.querySelector(".list_container");
let playlist = $.querySelector(".playlist");
let track_index = 0;
let isPlaying;
let isRandom;
let updateTimer;
var name_artist;
var artist_image;

var music_list;
var seek_stopper = false;
var modal = $.querySelector(".modal");
var modalClose = $.querySelector(".modal__close");
var modal__text = $.querySelector(".text");
modal.style.cssText = `
visibility: hidden;
display: flex;

opacity: 0; 
transition: opacity 0.3s ease-in-out;
`;

var text_animation_index = 1;
var title;
var text;
var range;

if (!String.prototype.splice) {
  String.prototype.splice = function (index, del, ...chars) {
    return (
      this.slice(0, index) + chars.join("") + this.slice(index + Math.abs(del))
    );
  };
}
async function music() {
  try {
    const API = `https://api.jamendo.com/v3.0/artists/tracks/?client_id=c534c323&format=jsonpretty&order=track_name_desc&name=${name_artist}&&audiodlformat=mp31`;
    const response = await fetch(API);
    const data = await response.json();
    if (!data.results[0]) {
      text = `Unfortunately artist ${name_artist} is not in our library`;
      openModal(text);
    }
    return data.results[0];
  } catch (error) {
    alert(`Unfortunately artist ${name_artist} is not in our library`);
  }
}

function findonpage() {
  name_artist = $.getElementById("user_text").value.replace(/ /gi, "+");
  if (!name_artist) {
    text = "You did not enter an artist name";
    openModal(text);
    return;
  }
  track_index = 0;
  isRandom = false;
  if (isPlaying === true) {
    pauseTrack();
  }
  music()
    .then((res) => {
      artist_image = res.image;
      music_list = res.tracks;
      name_artist = res.name;
    })
    .then(renderTracks)
    .then(loadTrack)
    .then(removeDisabled);
  $.addEventListener("submit", (e) => {
    e.target.reset();
  });
}

function openModal(text) {
  console.log(text);
  modal__text.innerHTML = text;
  modal.style.visibility = "visible";
  modal.style.opacity = 1;
}

const closeModal = () => {
  const target = event.target;
  if (target === modalClose || target === modal) {
    modal.style.opacity = 0;
    setTimeout(() => {
      modal.style.visibility = "hidden";
    }, 300);
  }
};

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", closeModal);

function removeDisabled() {
  let bShow = $.querySelectorAll("button");
  for (let i = 0; i < bShow.length; i++) {
    bShow[i].removeAttribute("disabled");
  }
}

function renderTracks() {
  $.querySelector(".description").style.display = "none";
  $.querySelector(".search").style.animation =
    "search_anim 0.5s linear forwards";
  $.querySelector(".list_container").style.justifyContent = "normal";
  $.querySelector(".list_container").style.alignItems = "normal";
  $.querySelector(".search").style.setProperty("--anim_state", "running");
  playlist.style.display = "flex";
  list.innerHTML = "";
  let elem = "";
  for (let i = 0; i < music_list.length; i++) {
    elem += `
    <li onclick="toArist(${i})" class="track track__${i}" >
    <p class="track_num">${i + 1}</p>
    <button class="playpause-track track_btn" >
            <i class="fa fa-play fa-1x"></i>
    </button>
    <img class="track_img" src="${music_list[i].image}" alt="track image">
     <div class="track__descripton">
      <h3 class="track__name">${music_list[i].name}</h3>
      <h3 class="album__name">${music_list[i].album_name}</h3>
      <h3 class="track__duration">${timeNormalize(music_list[i].duration)}</h3>
    </div>
    </li>
    `;
  }

  list.insertAdjacentHTML("beforeend", elem);
  playpause_btn = $.querySelectorAll(".playpause-track");
}

function timeNormalize(time) {
  let min = parseInt(time / 60);
  let sec = time % 60;
  if (sec < 10) {
    sec = "0" + sec;
  }
  return min + ":" + sec;
}

function toArist(id) {
  if (track_index === id) {
    playpauseTrack(id);
  } else {
    if (isPlaying === true) {
      pauseTrack(track_index);
    }
    $.querySelector(`.track__${track_index}`).classList.toggle("active_track");
    track_index = id;
    loadTrack();
    playTrack(id);
  }
}

function loadTrack() {
  clearInterval(updateTimer);
  reset();
  track_name.textContent = music_list[track_index].name;
  curr_track.src = music_list[track_index].audio;
  track_artist.textContent = name_artist;
  updateTimer = setInterval(setUpdate, 1000);
  track_img__desc.src = music_list[track_index].image;
  text = $.querySelector(".track-name");
  title = $.querySelector(".track_disc");
  range = text.offsetWidth - title.offsetWidth;
  text.style.transform = `translateX(0)`;
  if (range > 20) {
    text_animation(text, range);
  } else {
    text.classList.remove("active");
  }
  $.querySelector(`.track__${track_index}`).classList.toggle("active_track");
  curr_track.addEventListener("ended", nextTrack);
  progress();
}

function text_animation(text, range) {
  text.style.setProperty("--trans-x", -range + "px");
  text.style.setProperty("--time-anim", range / 31.6 + "s");
  text.classList.add("active");
}

function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}
function randomTrack() {
  isRandom ? pauseRandom() : playRandom();
}
function playRandom() {
  isRandom = true;
}
function pauseRandom() {
  isRandom = false;
}
function repeatTrack() {
  let current_index = track_index;
  loadTrack(current_index);
  curr_track.play();
  isPlaying = true;
}
function playpauseTrack(id = music_list.length) {
  isPlaying ? pauseTrack(id) : playTrack(id);
}
function playTrack(id = music_list.length) {
  curr_track.play();
  isPlaying = true;
  if (id != music_list.length) {
    playpause_btn[id].innerHTML = `<div class="box">
      <div class="line-1"></div>
      <div class="line-2"></div>
      <div class="line-3"></div>

    </div>`;
    playpause_btn[music_list.length].innerHTML =
      '<i class="fa fa-pause fa-2x"></i>';
  } else {
    playpause_btn[id].innerHTML = '<i class="fa fa-pause fa-2x"></i>';
    playpause_btn[track_index].innerHTML = `<div class="box">
      <div class="line-1"></div>
      <div class="line-2"></div>
      <div class="line-3"></div>

    </div>`;
  }
}

function pauseTrack(id = music_list.length) {
  curr_track.pause();
  isPlaying = false;
  if (id != music_list.length) {
    playpause_btn[id].innerHTML = '<i class="fa fa-play fa-1x"></i>';

    playpause_btn[music_list.length].innerHTML =
      '<i class="fa fa-play fa-2x"></i>';
  } else {
    playpause_btn[id].innerHTML = '<i class="fa fa-play fa-2x"></i>';
    playpause_btn[track_index].innerHTML = '<i class="fa fa-play fa-1x"></i>';
  }
}

function nextTrack() {
  $.querySelector(`.track__${track_index}`).classList.toggle("active_track");
  if (isPlaying === true) {
    curr_track.pause();
    isPlaying = false;
  }
  if (track_index < music_list.length - 1 && isRandom === false) {
    track_index += 1;
  } else if (track_index < music_list.length - 1 && isRandom === true) {
    let random_index = Number.parseInt(Math.random() * music_list.length);
    track_index = random_index;
  } else {
    track_index = 0;
  }

  $.querySelector(`.track__${track_index}`).scrollIntoView({
    block: "end",
    behavior: "smooth",
  });

  loadTrack();
  playTrack();
}

function prevTrack() {
  $.querySelector(`.track__${track_index}`).classList.toggle("active_track");
  if (isPlaying === true) {
    curr_track.pause();
    isPlaying = false;
  }
  if (track_index > 0) {
    track_index -= 1;
  } else {
    track_index = music_list.length - 1;
  }

  $.querySelector(`.track__${track_index}`).scrollIntoView({
    block: "end",
    behavior: "smooth",
  });
  loadTrack();
  playTrack();
}
function seekTo() {
  seek_stopper = false;
  let seekto =
    curr_track.duration *
    (seek_slider.value /
      ($.querySelector('input[type="range"].slider-progress').getAttribute(
        "max"
      ) +
        3));
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}
function progresSeek() {
  let seek = $.querySelector('input[type="range"].slider-progress').value;

  seek_stopper = true;
  let current_time = timeNormalize(seek);
  curr_time.textContent = "0" + current_time;
}

function setUpdate() {
  let seekPosition = 0;
  if (
    !isNaN(curr_track.duration) &&
    isPlaying === true &&
    seek_stopper == false
  ) {
    seekPosition =
      curr_track.currentTime *
      (($.querySelector('input[type="range"].slider-progress').getAttribute(
        "max"
      ) +
        3) /
        curr_track.duration);
    seek_slider.value = seekPosition;
    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(
      curr_track.currentTime - currentMinutes * 60
    );
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(
      curr_track.duration - durationMinutes * 60
    );
    if (currentSeconds < 10) {
      currentSeconds = "0" + currentSeconds;
    }
    if (durationSeconds < 10) {
      durationSeconds = "0" + durationSeconds;
    }
    if (currentMinutes < 10) {
      currentMinutes = "0" + currentMinutes;
    }
    if (durationMinutes < 10) {
      durationMinutes = "0" + durationMinutes;
    }
    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
  progress();
}

let inputs = $.querySelectorAll('input[type="range"].slider-progress');

function progress() {
  if (!isNaN(curr_track.duration)) {
    inputs[0].style.setProperty("--value", inputs[0].value);
    inputs[0].style.setProperty(
      "--min",
      inputs[0].min == "" ? "0" : inputs[0].min
    );
    inputs[0].style.setProperty("--max", curr_track.duration);
    inputs[0].setAttribute("max", curr_track.duration);
    inputs[0].addEventListener("input", () =>
      inputs[0].style.setProperty("--value", inputs[0].value)
    );
    inputs[1].style.setProperty("--value", inputs[1].value);
    inputs[1].style.setProperty(
      "--min",
      inputs[1].min == "" ? "0" : inputs[1].min
    );
    inputs[1].style.setProperty(
      "--max",
      inputs[1].max == "" ? "100" : inputs[1].max
    );
    inputs[1].addEventListener("input", () =>
      inputs[1].style.setProperty("--value", inputs[1].value)
    );
  }
}

list_container.onscroll = function () {
  if (list_container.scrollTop > 30) {
    playlist.classList.add("playlist_move");
  } else {
    playlist.classList.remove("playlist_move");
  }
};
