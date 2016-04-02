// the playlist is just a JSON-style object.
var playlist = [{
		url : "http://m5.file.xiami.com/381/40381/314266/3485719_2572825_l.mp3?auth_key=44162feb5b9708ea65bf38790e712b47-1459641600-0-null",
		title : "Danke"
	}, {
		url : "http://m5.file.xiami.com/827/14827/466785/1770498941_2676508_l.mp3?auth_key=782539abe3ab0d4d0eba53fa2d28ef73-1459641600-0-null",
		title : "Liebe Ist"
	}, {
		url : "http://m5.file.xiami.com/270/37270/225444/2639637_16045804_l.mp3?auth_key=1b04a09968f154992f90294305066c04-1459641600-0-null",
		title : "One fo Da Money"
	}, {
		url : "http://m5.file.xiami.com/1/701/46701/267350/3031877_137003_l.mp3?auth_key=dcf2fb685fcda1f06822b5799ef84965-1459641600-0-null",
		title : "Schlaflied"
	}
];

$(document).ready(function () {

	var aud = $('#jukebox .aud').get(0);
	var isplay = false;
	aud.pos = -1;

	$('#jukebox .play').bind('click', function (evt) {
		evt.preventDefault();
		if (aud.pos < 0) {
			$('#jukebox .next').trigger('click');
		} else {
			if (!isplay) {
				aud.play();
				document.getElementById('play').className = "pause";
				isplay = true;
			} else {
				aud.pause();
				document.getElementById('play').className = "play";
				isplay = false;
			}

		}
	});

	$('#jukebox .next').bind('click', function (evt) {
		evt.preventDefault();
		aud.pause();
		aud.pos++;
		if (aud.pos == playlist.length)
			aud.pos = 0;
		aud.setAttribute('src', playlist[aud.pos].url);
		$('#jukebox .info').html(playlist[aud.pos].title);
		if (isplay) {
			aud.play();
		} else { ;
		}
	});

	$('#jukebox .prev').bind('click', function (evt) {
		evt.preventDefault();
		aud.pause();
		aud.pos--;
		if (aud.pos < 0)
			aud.pos = playlist.length - 1;
		aud.setAttribute('src', playlist[aud.pos].url);
		$('#jukebox .info').html(playlist[aud.pos].title);
		if (isplay) {
			aud.play();
		} else { ;
		}
	});

	// JQuery doesn't seem to like binding to these HTML 5
	// media events, but addEventListener does just fine

	aud.addEventListener('progress', function (evt) {
		var width = parseInt($('#jukebox').css('width'));
		var percentLoaded = Math.round(evt.loaded / evt.total * 100);
		var barWidth = Math.ceil(percentLoaded * (width / 100));
		$('#jukebox .load-progress').css('width', barWidth);

	});

	aud.addEventListener('timeupdate', function (evt) {
		var width = parseInt($('#jukebox').css('width'));
		var percentPlayed = Math.round(aud.currentTime / aud.duration * 100);
		var barWidth = Math.ceil(percentPlayed * (width / 100));
		$('#jukebox .play-progress').css('width', barWidth);
	});

	aud.addEventListener('ended', function (evt) {
		$('#jukebox .next').trigger('click');
	});

	$('#jukebox .info').html(playlist[0].title);
	$('#jukebox .play').trigger('click');
	$('#jukebox .play').trigger('click');
});
