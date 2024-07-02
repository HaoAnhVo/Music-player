

addSongButton.addEventListener('click', function() {
    const songURL = songURLInput.value;
    if (songURL) {
        const songName = prompt("Enter song name:");
        if (songName) {
            songs.push({ name: songName, url: songURL });
            renderSongList(songs);
            songURLInput.value = '';
        }
    }
});