/**
 * @name XiamiPlayer
 * @version 1.0.4
 * @create 2013.6.4
 * @lastmodified 2013.7.4
 * @description XiamiPlayer Plugin
 * @author MuFeng (http://mufeng.me)
 * @url http://mufeng.me/xiamiplayer.html
 **/

(function(f,e){
    var k=/[\n\t]/g,j=/\s+/,c=/^(\s|\u00A0)+/,b=/(\s|\u00A0)+$/,g=/iPhone|iPad|iPod/i,p=/MSIE\s[\d]+/,q=("createTouch" in document)||("ontouchstart" in f),o=!!navigator.userAgent.match(g),n=!!navigator.userAgent.match(p),m=!(typeof f.localStorage=="undefined"),i=[],d=function(){
        var v=0,u=-1,t=document.getElementsByTagName("script").length;
        while(v<=t&&u==-1){
            var w=document.getElementsByTagName("script")[v].src,u=w.indexOf("xiamiplayer.js");
            v++
        }
        return w.replace(".js",".swf")
    },
	s=function(u){
        var t=0;
        do{
            t+=u.offsetLeft||0;
            u=u.offsetParent
        }
        while(u);
        return t
    },
	a=function(u){
        u=u||f.event;
        var t=0;
        if(q){
            t=u.touches.item(0).pageX
        }
        else{
            t=u.clientX+document.body.scrollLeft
        }
        return t
    },
	h=function(v,w){
        if(w&&typeof w==="string"){
            var y=(w||"").split(j);
            if(v.nodeType===1){
                if(!v.className){
                    v.className=w
                }
                else{
                    var u=" "+v.className+" ",x=v.className;
                    for(var z=0,t=y.length;z<t;z++){
                        if(u.indexOf(" "+y[z]+" ")<0){
                            x+=" "+y[z]
                        }
                    }
                    v.className=x.replace(c,"").replace(b,"")
                }
            }
        }
    },
	l=function(v,w){
        if((w&&typeof w==="string")||w===e){
            var x=(w||"").split(j);
            if(v.nodeType===1&&v.className){
                if(w){
                    var u=(" "+v.className+" ").replace(k," ");
                    for(var y=0,t=x.length;y<t;y++){
                        u=u.replace(" "+x[y]+" "," ")
                    }
                    v.className=u.replace(c,"").replace(b,"")
                }
                else{
                    v.className=""
                }
            }
        }
    },
	r=function(u,t){
        this.songid=t.songid;
        this.title=t.title;
        this.autoplay=t.autoplay||false;
        this.loop=t.loop||false;
        this.audio=f.Audio&&new Audio();
        this.audio&&i.push(this.audio);
        if(u.nodeType){
            this.element=u
        }
        if(this.songid){
            this.init()
        }
    };
    r.prototype={
        init:function(){
            this.ajax()
        },
		supportMp3:function(){
            return(((this.audio&&this.audio.canPlayType("audio/mpeg"))||o)&&!n)?true:false
        },
		flash:function(x){
            var v=this.element,A="xiami-"+this.songid+Math.floor(Math.random()*99999),y=x.src,z=this.title||(x.title+" - "+x.author),w=this.autoplay?1:0,u=this.loop?1:0,t=d();
            v.innerHTML='<embed id="'+A+'" src="'+t+"?url="+y+"&amp;autoplay="+w+"&amp;loop="+u+"&amp;descri="+z+'" type="application/x-shockwave-flash" wmode="transparent" allowscriptaccess="always" width="350" height="40">'
        },
		html5:function(w){
            var u=this.element,z="xiami-"+this.songid+Math.floor(Math.random()*99999),x=w.src,y=this.title||(w.title+" - "+w.author),v=this.autoplay?1:0,t=this.loop?1:0;
            u.innerHTML='<div id="'+z+'" class="audio-player"><div class="play-button"></div><div class="play-box"><div class="play-title">'+y+'</div><div class="play-data"><div class="play-prosess"><div class="play-loaded"></div><div class="play-prosess-bar"><div class="play-prosess-thumb"></div></div></div><div class="play-right"><div class="play-timer">--:--</div><div class="play-volume"></div></div></div></div></div>';
            this.elementid=z;
            this.buildPlayer(x)
        },
		audioElements:function(){
            var u=document.getElementById(this.elementid),t=[".play-button",".play-prosess",".play-prosess-bar",".play-loaded",".play-timer",".play-volume"];
            t.forEach(function(w,v){
                t[v]=u.querySelectorAll(w)[0]
            });
            return t
        },
        buildPlayer:function(y){
            var w=this,x=w.autoplay,v=document.getElementById(w.elementid),u=w.elementid.replace("xiami","xiamiaudio"),t=w.audioElements();
            if(x&&!o){
                if(!document.getElementById(u)){
                    w.hookEvent(y)
                }
            }
            else{
                t[0].addEventListener("click",function(){
                    if(!document.getElementById(u)){
                        w.hookEvent(y)
                    }
                }
                ,false)
            }
        },
        hookEvent:function(y){
            var x=this,u=x.audioElements(),v=document.getElementById(this.elementid),t=this.elementid.replace("xiami","xiamiaudio"),w=m?localStorage.getItem("xiami-volume"):"undefined";
            this.audio.src=y;
            this.audio.id=t;
            v.appendChild(this.audio);
            this.audio.play();
            w=(w!="undefined"&&w!=null)?w:6;
            this.audio.volume=Math.abs(w/6).toFixed(2);
            u[5].style.backgroundPosition="0 "+-w*15+"px";
            u[0].addEventListener("click",function(){
                if(x.audio.error){
                    return
                }
                else{
                    if(x.audio.readyState<4){
                        x.config.autoplay&&(x.audio.autoplay^=true)
                    }
                    else{
                        if(x.audio.paused){
                            x.audio.play()
                        }
                        else{
                            x.audio.pause()
                        }
                    }
                }
            },false);
            this.play();
            this.pause();
            this.ended();
            this.loadeddata();
            this.prosess();
            this.adjustProsess();
            this.adjustVolume()
        },
        play:function(){
            var t=this;
            this.audio.addEventListener("play",function(){
                h(t.audioElements()[0],"playing");
                t.singlePlayer(this)
            },false)
        },
        pause:function(){
            var t=this;
            this.audio.addEventListener("pause",function(){
                l(t.audioElements()[0],"playing")
            },false)
        },
        ended:function(){
            var t=this.loop;
            this.audio.addEventListener("ended",function(){
                this.pause();
                this.currentTime=0;
                t&&this.play()
            }
            ,false)
        },
        loadeddata:function(){
            var t=this;
            this.audio.addEventListener("loadeddata",function(){
                var u=setInterval(function(){
                    if(t.audio.buffered.length<1){
                        return true
                    }
                    t.audioElements()[3].style.width=(t.audio.buffered.end(0)/t.audio.duration)*100+"%";
                    if(Math.floor(t.audio.buffered.end(0))>=Math.floor(t.audio.duration)){
                        clearInterval(u)
                    }
                },100)
            })
        },
        prosess:function(){
            var t=this;
            this.audio.addEventListener("timeupdate",function(){
            t.audioElements()[2].style.width=this.currentTime/this.duration*100+"%";
            t.audioElements()[4].innerHTML=t.formatTime(this.currentTime)
            },false)
        },
        adjustProsess:function(){
            var z=this,v=z.audioElements(),A=v[1],x=s(A),u=parseInt(document.defaultView.getComputedStyle(A,null).getPropertyValue("width")),B=v[2],w=q?"touchstart":"mousedown",t=q?"touchmove":"mousemove",C=q?"touchend":"mouseup",y=function(){
                var F=0,G=document.body,E=function(J){
                    F++;
                    if(F%2===0){
                        return
                    }
                    var I=a(J),H=I-x;
                    if(0<H&&H<u){
                        z.audio.currentTime=Math.round(z.audio.duration*H/u);
                        z.audio.play()
                    }
                },
                D=function(){
                    G.removeEventListener(t,E,false);
                    G.removeEventListener(C,D,false)
                };
                G.addEventListener(t,E,false);
                G.addEventListener(C,D,false)
            };
            A.addEventListener(w,y,false);
            A.removeEventListener(C,y,false);
            A.onclick=function(F){
            var E=a(F),D=E-x;
            if(0<D&&D<u){
                z.audio.currentTime=Math.round(z.audio.duration*D/u);
                z.audio.play()
            }
            }
        },
        adjustVolume:function(){
            var v=this,t=v.audioElements(),u=t[5],w=s(u),x=parseInt(document.defaultView.getComputedStyle(u,null).getPropertyValue("width"));
            u.addEventListener("click",function(B){
            var A=a(B),z=A-w;
            if(0<z&&z<x){
                var y=Math.ceil(z/4);
                v.audio.volume=Math.abs(y/6).toFixed(2);
                u.style.backgroundPosition="0 "+-y*15+"px";
                localStorage.setItem("xiami-volume",y)
            }
            }
            ,false)
        },
        singlePlayer:function(u){
            var v=i.length,t;
            for(t=v-1;t>=0;t--){
                if(i[t]!=u){
                    i[t].pause()
                }
            }
        },
        ajax:function(){
            var t=this,u=t.songid,v=new Date().valueOf();
            new $JSONP.ajax({
                url:"http://www.xiami.com/web/get-songs",param:{
                    type:0,rtype:"song",id:u,_:v
                },
                callback:{
                    success:function(w){
                        if(w.data[0]){
                            t.supportMp3()?t.html5(w.data[0]):t.flash(w.data[0])
                        }
                    },
                    failure:function(w){
                        f.console&&console.log("Didn't get the data form xiami.com! Error: "+w)
                    }
                }
            })
        },
        formatTime:function(v){
            if(!isFinite(v)||v<0){
                return"--:--"
            }
            else{
                var t=Math.floor(v/60),u=Math.floor(v)%60;
                return(t<10?"0"+t:t)+":"+(u<10?"0"+u:u)
            }
        }
    };
    if(typeof f.$JSONP=="undefined"){
        f.$JSONP={}
    }
    $JSONP._ajax=function(t){
        t=t[0]||{};
        this.url=t.url||"";
        this.type="json";
        this.method="GET";
        this.param=t.param||null;
        this.callback=t.callback||{};
        if(typeof f._$JSONP_callback=="undefined"){
            f._$JSONP_callback={}
        }
        this._createRequest()
    };
    $JSONP._ajax.prototype={
        _createRequest:function(){
            var w=document.getElementsByTagName("head")[0];
            var u=document.createElement("script");
            var t=this._setRandomFun();
            var y=this;
            var x="";
            for(var v in this.param){
                if(x==""){
                    x=v+"="+this.param[v]
                }
                else{
                    x+="&"+v+"="+this.param[v]
                }
            }
            u.type="text/javascript";
            u.charset="utf-8";
            if(w){
                w.appendChild(u)
            }
            else{
                document.body.appendChild(u)
            }
            f._$JSONP_callback[t.id]=function(z){
                y.callback.success(z);
                setTimeout(function(){
                    delete f._$JSONP_callback[t.id];
                    u.parentNode.removeChild(u)
                },100)
            };
            u.src=this.url+"?callback="+t.name+"&"+x
        },
        _setRandomFun:function(){
            var t="";
            do{
                t="$JSONP"+Math.floor(Math.random()*10000)
            }
            while(f._$JSONP_callback[t]);
            return{
                id:t,name:"window._$JSONP_callback."+t
            }
        }
    };
    f.$JSONP.ajax=function(){
        return new $JSONP._ajax(arguments)
    };
    f.xiamiplayer=r
})(window);
