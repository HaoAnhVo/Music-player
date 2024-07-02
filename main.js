import { listMusic, newMusic } from "./assets/js/list-music.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "Hao_Vo";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const subHeading = $("header h3");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playlist = $(".playlist");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const currentTime = $(".time--current");
const timeRight = $(".time--total");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const volBtn = $(".btn-volume");
const volBar = $(".volume-bar");
const iconMute = $(".icon-mute");
const iconUnmute = $(".icon-unmute");
const faceBtn = $(".btn-face");
const dashboard = $(".dashboard");
const searchInput = $("#searchInput");
const addSongButton = $(".add-btn");

const wave = $$(".wave");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    currentVol: 1,
    lockVol: 1,
    isFace: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) ?? {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [...listMusic],
    render: function () {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? "active" : ""} ${
                this.isFace ? "bg" : ""
            }" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option" data-index=${index}>
                        <i class="fas fa-ellipsis"></i>
                        <div class = "option-child">
                            <a class = "download" href = "" download = "" data-index = ${index}>
                                <i class="fa-solid fa-cloud-arrow-down"></i>
                                Tải xuống   
                            </a>
                            <a class = "delete" data-index = ${index}>
                                <i class="fa-solid fa-trash-can"></i>
                                Xóa khỏi danh sách
                            </a>
                        </div> 
                    </div>
            </div>
            `;
        });
        playlist.innerHTML = html.join("");
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function () {
        const cdWidth = cd.offsetWidth;
        let i = 0;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate(
            [
                {
                    transform: "rotate(360deg)",
                },
            ],
            {
                duration: 10000,
                iterations: Infinity,
            }
        );
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi click play
        playBtn.onclick = () => {
            if (this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        //Khi bài hát played
        audio.onplay = () => {
            this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
            wave.forEach((element) => {
                element.style.width = "3px";
                element.classList.remove("paused");
            });
        };

        // Khi bài hát paused
        audio.onpause = () => {
            this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
            wave.forEach((element) => {
                element.style.width = "3px";
                element.classList.add("paused");
            });
        };

        //Load ra độ dài của bài hát
        audio.onloadedmetadata = () => {
            timeRight.textContent = this.formatTime(audio.duration);
            currentTime.textContent = this.formatTime(audio.currentTime);
        };

        //Load ra thời gian hiện tại của bài hát
        progress.oninput = (e) => {
            const timeChange = (audio.duration / 100) * e.target.value;
            currentTime.textContent = this.formatTime(timeChange);
        };

        // xử khi khi tua bài hát
        progress.addEventListener("change", (e) => {
            const seekTime = (audio.duration / 100) * e.target.value;

            audio.currentTime = seekTime;
        });

        // xử lý khi tiến độ bài hát
        audio.addEventListener("timeupdate", () => {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
                currentTime.textContent = this.formatTime(audio.currentTime);
                progress.style.background = `linear-gradient(to right, var(--primary-color) ${
                    (audio.currentTime / audio.duration) * 100
                }%, #d3d3d3 ${(audio.currentTime / audio.duration) * 100}% )`;
            }
        });

        // Khi prev bài hát
        prevBtn.onclick = () => {
            if (this.isRandom) {
                this.randomSong();
            } else {
                this.prevSong();
            }
            audio.play();
            this.render();
            this.scrollToActiveSong();
        };

        // Khi next bài hát
        nextBtn.onclick = () => {
            if (this.isRandom) {
                this.randomSong();
            } else {
                this.nextSong();
            }

            audio.play();
            this.render();
            this.scrollToActiveSong();
        };

        // Xử lý next bài hát khi hết bài đang phát
        audio.onended = () => {
            if (this.isRepeat) {
                audio.play();
            } else if (this.isRandom) {
                nextBtn.click();
            }
        };

        // Xử lý bật / tắt repeat
        repeatBtn.onclick = () => {
            if (this.isRandom) {
                alert("Chọn 1 thôi ông ơi -_- tức á!!");
            } else {
                this.isRepeat = !this.isRepeat;
                this.setConfig("isRepeat", this.isRepeat);
                repeatBtn.classList.toggle("active", this.isRepeat);
            }
        };

        // Xử lý bật / tắt random
        randomBtn.onclick = () => {
            if (this.isRepeat) {
                alert("Chọn 1 thôi ông ơi -_- tức á!!");
            } else {
                this.isRandom = !this.isRandom;
                this.setConfig("isRandom", this.isRandom);
                randomBtn.classList.toggle("active", this.isRandom);
            }
        };

        playlist.onclick = (e) => {
            const songNode = e.target.closest(".song:not(.active)");
            const optionNode = e.target.closest(".option");
            const optionChildNode = e.target.closest(".option-child");
            const downloadNode = e.target.closest(".download");
            const deleteNode = e.target.closest(".delete");

            const handleClick = (index) => {
                this.currentIndex = index;
                this.loadCurrentSong();
                this.scrollToActiveSong();
                this.render();
                audio.play();
            };

            if (songNode && !optionNode) {
                handleClick(Number(songNode.dataset.index));
            }

            if (optionNode && !optionChildNode) {
                this.currentIndex = Number(optionNode.dataset.index);
                optionNode.classList.toggle("active");
            }

            if (downloadNode && !deleteNode) {
                e.stopPropagation();
                handleClick(Number(downloadNode.dataset.index));
                downloadNode.href = this.currentSong.path;
                downloadNode.download = `${this.currentSong.name} - ${this.currentSong.singer}.mp3`;
                setTimeout(() => {
                    this.toastMessage({
                        title: "Đã tải xong !",
                        message: "Hãy kiểm tra trong thư mục download của bạn",
                        type: "success",
                        duration: 3000,
                    });
                }, 2000);
            }

            if (deleteNode && !downloadNode) {
                const indexDelete = Number(deleteNode.dataset.index);
                if (this.isPlaying) {
                    alert("Bài hát đang được phát, hãy tắt nó để có thể xóa bài hát !");
                    return;
                }
                if (this.songs.length <= 1) {
                    this.toastMessage({
                        title: "Thất bại !",
                        message: "Không thể xóa bài hát cuối cùng",
                        type: "error",
                        fadeTime: 1000,
                        duration: 3000,
                    });
                    return;
                }
                const checkDelete = confirm("Bạn chắn chắn muốn xóa bài này !");

                if (checkDelete) {
                    this.removeSong(indexDelete);
                    this.toastMessage({
                        title: "Thành công !",
                        message: "Đã xóa bài hát khỏi danh sách",
                        type: "success",
                        fadeTime: 1000,
                        duration: 3000,
                    });
                } else {
                    return;
                }
            }
        };

        //Volume-Bar
        volBar.oninput = (e) => {
            this.setConfig("currentVol", e.target.value);
            audio.volume = volBar.value;
            this.setConfig("currentVol", audio.volume);
        };

        //Change-Volume
        audio.onvolumechange = () => {
            volBar.value = audio.volume;
            volBar.style.background = `linear-gradient(to right, var(--primary-color) ${audio.volume * 100}%, #d3d3d3 ${
                10 - audio.volume
            }% )`;
            if (audio.volume === 0) {
                iconMute.style.visibility = "visible";
                iconUnmute.style.visibility = "hidden";
            } else {
                iconMute.style.visibility = "hidden";
                iconUnmute.style.visibility = "visible";
            }
        };

        //Mute-Volume
        iconUnmute.onclick = (e) => {
            this.setConfig("lockVol", audio.volume);
            audio.volume = 0;
            this.setConfig("currentVol", audio.volume);
        };

        //Unmute-Volume
        iconMute.onclick = (e) => {
            audio.volume = this.config.lockVol;
            this.setConfig("currentVol", audio.volume);
        };

        //Background-Theme
        faceBtn.onclick = () => {
            const songs = $$(".song");
            this.isFace = !this.isFace;
            if (this.isFace) {
                dashboard.classList.add("bg");
                songs.forEach((song) => {
                    song.classList.add("bg");
                });
            } else {
                dashboard.classList.remove("bg");
                songs.forEach((song) => {
                    song.classList.remove("bg");
                });
            }
            faceBtn.classList.toggle("active", this.isFace);
            this.setConfig("isFace", this.isFace);
        };

        searchInput.oninput = () => {
            const searchText = searchInput.value.toLowerCase();
            if (searchText === "") {
                this.songs = [...listMusic];
                this.render();
            } else {
                const filteredSongs = this.songs.filter((song) => song.name.toLowerCase().includes(searchText));
                this.songs.splice(0, this.songs.length, ...filteredSongs);
                this.render();
            }
        };

        // Action
        addSongButton.onclick = () => {
            console.log(newMusic[i]);
            const songName = prompt("Enter song name:");
            if (songName) {
                if (i < newMusic.length) {
                    this.songs.push({
                        ...newMusic[i],
                    });
                    i++;
                } else {
                    alert("Hết bài rùi chưa lấy về kịp ông ơi :( !");
                }
            } else {
                alert("Chưa nhập kìa!!!");
            }

            this.render();
        };
    },

    // Toast
    toastMessage: function ({ title = "", message = "", type = "", fadeTime = "", duration = "" }) {
        const toastParent = document.querySelector("#toast");

        if (toastParent) {
            const toastChild = document.createElement("div");

            //xóa toast tự động
            const autoRemoveId = setTimeout(() => {
                toastParent.removeChild(toastChild);
            }, duration + fadeTime);

            //xóa toast khi click close
            toastChild.onclick = (e) => {
                if (e.target.closest(".toast__close")) {
                    toastParent.removeChild(toastChild);
                    clearTimeout(autoRemoveId);
                }
            };
            const icons = {
                success: "fa-solid fa-circle-check",
                error: "fa-solid fa-exclamation-circle",
            };
            const icon = icons[type];
            const fadeTimeOut = (fadeTime / 1000).toFixed(2);
            const delayTime = (duration / 1000).toFixed(2);

            toastChild.classList.add("toast", `toast--${type}`);
            toastChild.style.animation = `slideInLeft ease 0.3s, fadeOut linear ${fadeTimeOut}s ${delayTime}s forwards`;
            toastChild.innerHTML = `
                <div class="toast__icon">
                    <i class="${icon}"></i>
                </div>
                <div class="toast__body">
                    <h3 class="toast__title">${title}</h3>
                    <p class="toast__msg">${message}</p>
                </div>
                <div class="toast__close">
                    <i class="fa-solid fa-circle-mark"></i>
                </div>
            `;
            toastParent.appendChild(toastChild);
        }
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "end",
            });
        }, 200);
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        subHeading.textContent = this.currentSong.singer;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    // định dạng thời gian thành xx:xx
    formatTime: function (time) {
        let min = Math.floor(time / 60);
        let sec = Math.floor(time % 60);
        min = min < 10 ? "0" + min : min;
        sec = sec < 10 ? "0" + sec : sec;
        return min + ":" + sec;
    },

    //Xử lý khi prev bài hát
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    //Xử lý khi next bài hát
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex > this.songs.length - 1) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    // Xử lý random
    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    removeSong: function (index) {
        this.songs.splice(index, 1);
        this.render();
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.isFace = this.config.isFace;
    },

    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Render playlist
        this.render();

        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();

        //Tải thông tin bài hát hiện tại
        this.loadCurrentSong();

        // Hiển thị trạng thái ban đầu của button repeat & random, background-theme và volume
        repeatBtn.classList.toggle("active", this.isRepeat);
        randomBtn.classList.toggle("active", this.isRandom);
        faceBtn.classList.toggle("active", this.isFace);
        if (this.isFace) {
            dashboard.classList.add("bg");
        }
        volBar.style.background = `var(--primary-color)`;
    },
};

app.start();
