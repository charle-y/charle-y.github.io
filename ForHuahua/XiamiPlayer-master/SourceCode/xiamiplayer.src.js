/**
 * @name XiamiPlayer
 * @version 1.0.4
 * @create 2013.6.4
 * @lastmodified 2013.7.4
 * @description XiamiPlayer Plugin
 * @author MuFeng (http://mufeng.me)
 * @url http://mufeng.me/xiamiplayer.html
 **/
(function(window, undefined) {

	"use strict";

	var // 回车, 制表符, 空格正则
		rclass = /[\n\t]/g,
		rspaces = /\s+/,
		rsleft = /^(\s|\u00A0)+/,
		rsright = /(\s|\u00A0)+$/,
		
		rios = /iPhone|iPad|iPod/i,
		rie  = /MSIE\s[\d]+/,
		
		
		//是否支持触摸
		inTouch = ("createTouch" in document) || ('ontouchstart' in window),
		
		// 是否是ios
		isIos = !! navigator.userAgent.match(rios),
		
		// 是否是ie
		isIE = !! navigator.userAgent.match(rie),
		
		// 判断是否支持 localStorage
		isLocalStorage = !(typeof window.localStorage == "undefined"),
		
		// 全局 audio 数组变量
		audioList = [],
		
		// flash播放器地址
		getSwfUrl = function(){
			var i = 0, got = -1, len = document.getElementsByTagName('script').length;
			while ( i <= len && got == -1){
				var js_url = document.getElementsByTagName('script')[i].src,
				got = js_url.indexOf('xiamiplayer.js'); i++;
			}
			return  js_url.replace('.js','.swf');
		},
		
		// 获取元素位置
		getObjPoint = function(el) {
			var x = 0;
			do {
				x += el.offsetLeft || 0;
				el = el.offsetParent
			} while (el) return x;
		},
		
		// 获取鼠标位置
		getMousePoint = function(ev) {
			ev = ev || window.event;
			var x = 0;
			if (inTouch) {
				x = ev.touches.item(0).pageX;
			} else {
				x = ev.clientX + document.body.scrollLeft;
			}
			return x;
		},
		
		// jquery之addclass
		addClass = function(el, value) {
			if (value && typeof value === "string") {

				var classNames = (value || "").split(rspaces);

				if (el.nodeType === 1) {
					if (!el.className) {
						el.className = value;

					} else {
						var className = " " + el.className + " ",
							setClass = el.className;

						for (var c = 0, cl = classNames.length; c < cl; c++) {
							if (className.indexOf(" " + classNames[c] + " ") < 0) {
								setClass += " " + classNames[c];
							}
						}
						el.className = setClass.replace(rsleft, '').replace(rsright, '');
					}
				}
			}
		},
		
		// jquery之removeclass
		removeClass = function(el, value) {
			if ((value && typeof value === "string") || value === undefined) {
				var classNames = (value || "").split(rspaces);

				if (el.nodeType === 1 && el.className) {
					if (value) {
						var className = (" " + el.className + " ").replace(rclass, " ");
						for (var c = 0, cl = classNames.length; c < cl; c++) {
							className = className.replace(" " + classNames[c] + " ", " ");
						}
						el.className = className.replace(rsleft, '').replace(rsright, '');

					} else {
						el.className = "";
					}
				}
			}
		},
		
		xiamiplayer = function(el, cfg) {
			this.songid = cfg.songid;
			this.title = cfg.title;
			this.autoplay = cfg.autoplay || false;
			this.loop = cfg.loop || false;

			this.audio = window['Audio'] && new Audio();
			this.audio && audioList.push(this.audio);

			if (el.nodeType) this.element = el;
			if (this.songid) this.init();
		};

	xiamiplayer.prototype = {
		init: function() {
			this.ajax();
		},
		supportMp3: function() { // 判断是否支持 audio 播放mp3
			return (((this.audio && this.audio.canPlayType('audio/mpeg')) || isIos) && !isIE) ? true : false;
		},
		flash: function(data) { // 不支持 audio 播放mp3, 一律采用flash
			var container = this.element,
				id = "xiami-" + this.songid + Math.floor(Math.random() * 99999),
				src = data.src,
				descri = this.title || (data.title + " - " + data.author),
				autoplay = this.autoplay ? 1 : 0,
				loop = this.loop ? 1 : 0,
				swf_url = getSwfUrl();

			container.innerHTML = '<embed id="' + id + '" src="'+swf_url+'?url=' + src + '&amp;autoplay=' + autoplay + '&amp;loop=' + loop + '&amp;descri=' + descri + '" type="application/x-shockwave-flash" wmode="transparent" allowscriptaccess="always" width="350" height="40">';
		},
		html5: function(data) {
			var container = this.element,
				id = "xiami-" + this.songid + Math.floor(Math.random() * 99999),
				src = data.src,
				descri = this.title || (data.title + " - " + data.author),
				autoplay = this.autoplay ? 1 : 0,
				loop = this.loop ? 1 : 0;
				
			container.innerHTML = '<div id="' + id + '" class="audio-player"><div class="play-button"></div><div class="play-box"><div class="play-title">' + descri + '</div><div class="play-data"><div class="play-prosess"><div class="play-loaded"></div><div class="play-prosess-bar"><div class="play-prosess-thumb"></div></div></div><div class="play-right"><div class="play-timer">--:--</div><div class="play-volume"></div></div></div></div></div>';
			this.elementid = id;
			this.buildPlayer(src);
		},
		audioElements: function() { // html5部分需要用到的元素集合
			var el = document.getElementById(this.elementid),
				arr = [".play-button", ".play-prosess", ".play-prosess-bar", ".play-loaded", ".play-timer", ".play-volume"];
			arr.forEach(function(val, i) {
				arr[i] = el.querySelectorAll(val)[0];
			});
			return arr;
		},
		buildPlayer: function(src) {
			var that = this,
				autoplay = that.autoplay,
				audio_id = that.elementid.replace("xiami", "xiamiaudio"),
				elems = that.audioElements();
			
			if (autoplay && !isIos) { // 判断autoplay, ios不支持自动播放
				if (!document.getElementById(audio_id)) {
					that.hookEvent(src);
				}
			} else { // 非autoplay, 必须要点击播放按钮之后, 才会插入audio
				elems[0].addEventListener("click", function() {
					if (!document.getElementById(audio_id)) {
						that.hookEvent(src);
					}
				}, false);
			}
		},
		hookEvent: function(src) { // 事件绑定
			var that = this,
				audioDom = document.getElementById(that.elementid),
				audio_id = that.elementid.replace("xiami", "xiamiaudio"),
				elems = that.audioElements(),
				volume = isLocalStorage ? localStorage.getItem("xiami-volume") : "undefined";
			
			// 初始音量赋值
			volume = (volume!="undefined" && volume!=null) ? volume : 6;
			this.audio.volume = Math.abs(volume/6).toFixed(2);
			
			// 音量图标背景
			elems[5].style.backgroundPosition = "0 " + -volume * 15 + "px";

			this.audio.src = src;
			this.audio.id = audio_id;
			audioDom.appendChild(this.audio);
			this.audio.play();
			
			elems[0].addEventListener("click", function() {
				if (that.audio.error) {
					return;
				} else if (that.audio.readyState < 4) {
					that.config.autoplay && (that.audio.autoplay ^= true)
				} else if (that.audio.paused) {
					that.audio.play()
				} else {
					that.audio.pause()
				}
			}, false);
			
			this.play();
			this.pause();
			this.ended();
			this.loadeddata();
			this.prosess();
			this.adjustProsess();
			this.adjustVolume();
		},
		play: function() { // 播放事件
			var that = this;
			this.audio.addEventListener("play", function() {
				addClass(that.audioElements()[0], "playing");
				that.singlePlayer(this);
			}, false);
		},
		pause: function() { // 暂定事件
			var that = this;
			this.audio.addEventListener("pause", function() {
				removeClass(that.audioElements()[0], "playing")
			}, false);
		},
		ended: function() { // 播放完事件
			var loop = this.loop;
			this.audio.addEventListener("ended", function() {
				this.pause();
				this.currentTime = 0;
				loop && this.play();
			}, false);
		},
		loadeddata: function() { // mp3缓冲事件
			var that = this;
			this.audio.addEventListener("loadeddata", function() {
				var interval = setInterval(function() {
					if (that.audio.buffered.length < 1) return true;
					that.audioElements()[3].style.width = (that.audio.buffered.end(0) / that.audio.duration) * 100 + '%';
					if (Math.floor(that.audio.buffered.end(0)) >= Math.floor(that.audio.duration)) clearInterval(interval)
				}, 100)
			});
		},
		prosess: function() { // 播放中事件
			var that = this;
			this.audio.addEventListener("timeupdate", function() {
				that.audioElements()[2].style.width = this.currentTime / this.duration * 100 + "%";
				that.audioElements()[4].innerHTML = that.formatTime(this.currentTime);
			}, false);
		},
		adjustProsess: function() { // 调整播放进度
			var that = this,
				elems = that.audioElements(),
				_bar = elems[1],
				_barOffleft = getObjPoint(_bar),
				_barWidth = parseInt(document.defaultView.getComputedStyle(_bar, null).getPropertyValue("width")),
				_prosess = elems[2],

				startEvent = inTouch ? "touchstart" : "mousedown",
				moveEvent = inTouch ? "touchmove" : "mousemove",
				endEvent = inTouch ? "touchend" : "mouseup",

				drag = function() {
					var count = 0,
						doc = document.body,
						move = function(e) {
							count++;
							
							// 当计数器为偶数的时候不执行mousemove
							if( count % 2 === 0 ){
								return;
							}
							
							var pageX = getMousePoint(e),
								thePos = pageX - _barOffleft;
							if (0 < thePos && thePos < _barWidth) {
								that.audio.currentTime = Math.round(that.audio.duration * thePos / _barWidth);
								that.audio.play()
							}
						},
						up = function() {
							doc.removeEventListener(moveEvent, move, false);
							doc.removeEventListener(endEvent, up, false)
						};
					doc.addEventListener(moveEvent, move, false);
					doc.addEventListener(endEvent, up, false)
				};

			_bar.addEventListener(startEvent, drag, false);
			_bar.removeEventListener(endEvent, drag, false);
			_bar.onclick = function(e) {
				var pageX = getMousePoint(e),
					thePos = pageX - _barOffleft;
				if (0 < thePos && thePos < _barWidth) {
					that.audio.currentTime = Math.round(that.audio.duration * thePos / _barWidth);
					that.audio.play()
				}
			}
		},
		adjustVolume: function() { // 调整音量, 不支持ios
			var that = this,
				elems = that.audioElements(),
				volumeBar = elems[5],
				volumeBarOffleft = getObjPoint(volumeBar),
				volumeBarWidth = parseInt(document.defaultView.getComputedStyle(volumeBar, null).getPropertyValue("width"));

			volumeBar.addEventListener("click", function(e) {
				var pageX = getMousePoint(e),
					thePos = pageX - volumeBarOffleft;
				if (0 < thePos && thePos < volumeBarWidth) {
					// 音量算法改成Math.ceil, 向下取整
					var v = Math.ceil(thePos/4);
					
					// 音量大小保留两位小数
					that.audio.volume = Math.abs(v / 6).toFixed(2);
					
					volumeBar.style.backgroundPosition = "0 " + -v * 15 + "px";
					
					localStorage.setItem("xiami-volume", v);
				}
			}, false);
		},
		singlePlayer: function(thePlayer) { // 只容许一个audio播放
			var N = audioList.length,
				i;
			for (i = N - 1; i >= 0; i--) {
				if (audioList[i] != thePlayer) audioList[i].pause();
			}
		},
		ajax: function() { // jsonp方式从xiami.com获取相关信息
			var that = this,
				songid = that.songid,
				expando = new Date().valueOf();

			new $JSONP.ajax({
				url: "http://www.xiami.com/web/get-songs",
				param: {
					"type": 0,
					"rtype": "song",
					"id": songid,
					"_": expando
				},
				callback: {
					success: function(json) {
						if (json.data[0]) {
							that.supportMp3() ? that.html5(json.data[0]) : that.flash(json.data[0]);
						}
					},
					failure: function(error) {
						window.console && console.log("Didn't get the data form xiami.com! Error: " + error);
					}
				}
			});
		},
		formatTime: function(sec) {
			if (!isFinite(sec) || sec < 0) {
				return '--:--'
			} else {
				var m = Math.floor(sec / 60),
					s = Math.floor(sec) % 60;
				return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
			}
		}
	};

	// 以下为 ajax函数的构造
	if (typeof window.$JSONP == 'undefined') {
		window.$JSONP = {};
	};

	$JSONP._ajax = function(config) {
		config = config[0] || {};
		this.url = config.url || '';
		this.type = 'json';
		this.method = 'GET';
		this.param = config.param || null;
		this.callback = config.callback || {};

		if (typeof window._$JSONP_callback == 'undefined') {
			window._$JSONP_callback = {};
		}

		this._createRequest();
	};

	$JSONP._ajax.prototype = {
		_createRequest: function() {
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');
			var fun = this._setRandomFun();
			var _this = this;
			var param = '';

			for (var i in this.param) {
				if (param == '') {
					param = i + '=' + this.param[i];
				} else {
					param += '&' + i + '=' + this.param[i];
				}
			}

			script.type = 'text/javascript';
			script.charset = 'utf-8';
			if (head) {
				head.appendChild(script);
			} else {
				document.body.appendChild(script);
			}

			window._$JSONP_callback[fun.id] = function(data) {
				_this.callback.success(data);
				setTimeout(function() {
					delete window._$JSONP_callback[fun.id];
					script.parentNode.removeChild(script);
				}, 100);
			};

			script.src = this.url + '?callback=' + fun.name + '&' + param;
		},

		_setRandomFun: function() {
			var id = '';
			do {
				id = '$JSONP' + Math.floor(Math.random() * 10000);
			} while (window._$JSONP_callback[id])
			return {
				id: id,
				name: 'window._$JSONP_callback.' + id
			}
		}
	};

	window.$JSONP.ajax = function() {
		return new $JSONP._ajax(arguments);
	};

	window.xiamiplayer = xiamiplayer;
})(window);