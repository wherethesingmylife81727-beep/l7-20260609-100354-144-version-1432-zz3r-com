function initMoviePlayer(src){
var video=document.getElementById('movie-player');
if(!video||!src)return;
if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;return}
if(window.Hls&&window.Hls.isSupported()){var hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(video);hls.on(Hls.Events.ERROR,function(event,data){if(data&&data.fatal){if(data.type===Hls.ErrorTypes.NETWORK_ERROR){hls.startLoad()}else if(data.type===Hls.ErrorTypes.MEDIA_ERROR){hls.recoverMediaError()}else{hls.destroy()}}})}
}