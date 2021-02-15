
var flvPlayer = null;
var bPlaying = false;

function play_pause() {
	if (bPlaying)
	{
		pause();
	}
	else
	{
		play();
	}
	var button = document.getElementById('play_button').firstChild;
	button.data = bPlaying ? "Pause" : "Play";
}

function mute_unmute() {
	var videoElement = document.getElementById('videoElement');
	videoElement.muted = !videoElement.muted;

	var button = document.getElementById('mute_button').firstChild;
	button.data = videoElement.muted ? "Unmute" : "Mute";
}

function set_volume(volume)
{
	var videoElement = document.getElementById('videoElement');
	videoElement.volume = volume / 100.0;
}
// New play/pause function that properly handle live stream
function play() {
	if (flvPlayer != null)
		pause();

	if (flvjs.isSupported()) {
		try
		{
			flvPlayer = flvjs.createPlayer({
				type: 'flv',
				isLive: true,
				url: 'ws://localhost:8000/live/live.flv'
			});
		} catch(error)
		{
			flvPlayer = null;
			return;
		}
	}

	if (null != flvPlayer)
	{
		var videoElement = document.getElementById('videoElement');
		flvPlayer.attachMediaElement(videoElement);
		flvPlayer.load();
		flvPlayer.play();
		bPlaying = true;
	}
}

function pause() {
	if (null != flvPlayer)
	{
		// Completely unload player is the only way we stop client from caching video
		bPlaying = false;
		flvPlayer.pause();
		flvPlayer.unload();
		flvPlayer.detachMediaElement();
		flvPlayer = null;
	}
}

$(document).ready(function() {
	play_pause();
});