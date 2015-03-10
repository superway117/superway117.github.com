'use strict';

(function(window){

    var env = {};
    var av, ua;
    var opts= {};

/*
    chrome
    appVersion: "5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.65 Safari/537.36"
    userAgent: "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.65 Safari/537.36"
    
    firefox
    appVersion  "5.0 (X11)"
    userAgent: "Mozilla/5.0 (X11; Ubunt...o/20100101 Firefox/24.0"
*/
    
    var isInit= function(){
        return ( ua && av) ? true: false;
 
    }
    var sniff = function(){
        if( isInit())
            return;
        ua = navigator.userAgent;
        av = navigator.appVersion;

        env["air"] = ua.indexOf("AdobeAIR") >= 0;
        env["khtml"] = av.indexOf("Konqueror") >= 0 ? parseFloat(av) : void 0;
        env["webkit"] = parseFloat(ua.split("WebKit ")[1]) || void 0;
        env["chrome"] = parseFloat(ua.split("Chrome ")[1]) || void 0;
        if (av.indexOf("Safari") >= 0 && !env["chrome"]) {
            env["safari"] = parseFloat(av.split("Version/")[1]);
        } 
        else {
            env["safari"] = undefined;
        }
        env["mac"] = ua.indexOf("Macintosh") >= 0;
        env["quirks"] = document.compatMode === "BackCompat";
        env["ios"] = /iPhone|iPod|iPad/.test(ua);
        env["android"] = parseFloat(ua.split("Android ")[1]) || void 0;
        if (env["android"]) {
            console.log("Android version=" + env["android"]);
        }

        env["operamini"] = ua.indexOf("Opera Mini");
        env["blackberry"] = ua.indexOf("BlackBerry");
        env["windowmobile"] = ua.indexOf("IEMobile");
    
        env["mobile"] = env.android || env.ios || env.operamini || env.blackberry || env.windowmobile? true : false;
        env["connected"] = "unknow";
        env["deviceReady"] = false;
        if(opts && opts["phonegap"])
            env["phonegap"] = opts["phonegap"];
        else
            env["phonegap"] = false;
    }
    var get = function(value) {
        // must be string
        if (typeof value != 'string')
            return false;
        if(!isInit()) sniff();
        if(env[value]) 
            return env[value];
        else
            return false;
    }

    var width = function(){
        if(env["mobile"]) {
            var w1 = screen.width;
            var w2 = $(window).width();
            var w3 = window.outerWidth;
            var tmp =  w1>w2?w1:w2;
            //console.log("Mobile width=" + tmp>w3?tmp:w3);
            return window.innerWidth;
            //return tmp>w3?tmp:w3;
        }
        else {
            return $(window).width();
        }
    }
    //my android 4.0 pad
    //window.innerHeight=1232
    //window.outerHeight=240
    //$(window).height()=1232
    // screen.height=1280

    //huawei c8810
    //$(window).height()=295
    // $(window).height()=508
    // window.outerHeight=762
    // window.innerHeight=508
    // screen.height=508
    var height = function(){
        if(env["mobile"]) {

            var h1 = screen.height;
            console.log("screen.height=" + h1);
            var h2 = $(window).height();
            console.log("$(window).height()=" + h2);
            var h3 = window.outerHeight;
            console.log("window.outerHeight=" + h3);
            var h4 = window.innerHeight;
            console.log("window.innerHeight=" + h4);
            var tmp = h1>h2?h1:h2;
            //console.log("Mobile height=" + tmp>h3?tmp:h3);
            return window.innerHeight;
            //return tmp>h3?tmp:h3;
        }
        else {
            return $(window).height();
        }
    }

    var dom_ready = function() {
        sniff();
        if (get("phonegap")) {
            return document.addEventListener('deviceready', function() {
                env["deviceready"] = true;
                env["connected"] = this.detechNetwork();
            }, false);
        } 
        else {
            env["deviceready"] = true;
        }
    };
    var config = function(options){
        opts = options;
    }
    $(dom_ready);
    window.Sniff =  {
        config: config,
        get: get,
        width: width,
        height: height
    }

})(window);