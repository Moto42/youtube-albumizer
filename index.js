const fs = (await import('fs')).default;
const client = (await import('https')).default;
const clipboardy = (await import('clipboardy')).default;
const ytconverter = (await import('youtube-mp3-converter')).default;
const ytfps = (await import('ytfps')).default;
const NodeID3 = (await import('node-id3')).default;

// Required Options. Move these to command-line inputs later
// path to folder to save album in.
const path = './mp3';
// url to youtube playlist
const playlist_url = 'URL_TO_PLAYLIST';
// the type/genre of the album
const tcon = 'audiobook';0


async function downloadMP3(video, album_title, track_number,tcon="music"){
    console.log(`Downloading ${video.title}`);
    const filename = video
    const filepath = await ytconverter(path)(video.url,{
        title: video.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
    });
    const tags = {
        title: video.title,
        artist: video.author.name,
        album: album_title,
        TRCK: track_number,
        APIC: `${path}/albumcover.jpg`,
        TCON: tcon,
        ALBUMARTIST: 'Wesley Williams',
    };
    NodeID3.update(tags, filepath);
    console.log(`Completed ${video.title}`);
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

            }
        });
    });
}
async function do_the_thing(){
    const playlist = await ytfps(playlist_url);
    //get the album cover;
    await downloadImage(playlist.thumbnail_url, `${path}/albumcover.jpg`);
    //asyncronously download the files
    playlist.videos.sort((a,b) => .5 - Math.random());
    for(let index in playlist.videos) {
        downloadMP3(playlist.videos[index], playlist.title, Number(index)+1, tcon);
    }
}
// iife that does the work.
(function(){
    do_the_thing();
})();