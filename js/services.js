'use strict';

/* Services */

angular.module('hapiImageServices', [], function($provide) {
    var debug = false;

    $provide.factory('BaiduSearch', ['$http','$q','$timeout','dateFilter','$log', function($http,$q,$timeout,dateFilter,$log) {
        var url="http://image.baidu.com/i?tn=baiduimagejson&ct=201326592&cl=2&lm=-1&st=-1&fm=result&fr=&sf=1&fmq=1378478120701_R&pv=&ic=0&nc=1&z=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&ie=utf-8&callback=JSON_CALLBACK";
        if(debug){
            var tagUrl="http://127.0.0.1:3001/baiduimage?api=searchtag&callback=JSON_CALLBACK";
            //var newsUrl="http://127.0.0.1:3001/baiduimage?api=newslist&callback=JSON_CALLBACK"
            var newsDetailsUrl="http://127.0.0.1:3001/baiduimage?api=newsdetail&callback=JSON_CALLBACK"
        }
        else{
            var tagUrl="http://rocky-thicket-9504.herokuapp.com/baiduimage?api=searchtag&callback=JSON_CALLBACK";
            //var newsUrl="http://rocky-thicket-9504.herokuapp.com/baiduimage?api=newslist&callback=JSON_CALLBACK"
            //var newsDetailsUrl="http://image.baidu.com/channel/newsdetail?set_sign=12435037580743128020"
            var newsDetailsUrl="http://rocky-thicket-9504.herokuapp.com/baiduimage?api=newsdetail&callback=JSON_CALLBACK"
        }
            
        var timeoutIds = {};
        var imageLoader = function(){

            var imgQueue = [];


            var timeoutPromise = null;
            var addImage = function(data, succ, error){
                imgQueue.push({data:data,succ:succ,error:error});
                return updateLater();
            }
            var loadImg = function(item){
                var url = null;
                if(angular.isString(item.data)){
                    url = item.data;
                }
                else if(item.data&&item.data.image){
                    url = item.data.image;
                }
                else
                    return;
                var img = new Image();
                img.src = url;
                if (img.complete) {
                    $log.log("loaded: " + url);
                    if(item.succ) item.succ(item.data);
                }
                else {
                    img.onload  = function(){
                        $log.log("img onload: " + url);
                        img.onload = null;
                        if(item.succ) item.succ(item.data);
                    }
                    img.onerror = function(){
                        $log.error("img onerror: " + url);
                        img.onload = null;
                        if(item.error) item.error(item);
                    }
                }
            }

            var updateLater = function(){
                if(imgQueue.length==0) return;
                if(timeoutPromise) return;
                timeoutPromise = $timeout(function() {
                    loadImg(imgQueue.pop());  
                    timeoutPromise = null;
                    updateLater(); // schedule another update
                    
                }, 30);
                return timeoutPromise;

            }
            var clear = function(){
                if(timeoutPromise) {
                    $timeout.cancel(timeoutPromise)
                    timeoutPromise = null;
                }

                imgQueue = [];
            }
  
            return {
                addImage: addImage,
                clear: clear,
            };
 
        }();

        
        var Task = function(){

            var taskQueue = [];
            var timeoutPromise = null;

            var isPromise = function (obj) {
                return obj && obj["then"] && obj["catch"] && obj["finally"];

            }
            
            var addTask = function(callback, succ, error){
                taskQueue.unshift({callback:callback,succ:succ,error:error});
                return updateLater();
            }
            var pushTask = function(callback, succ, error){
                taskQueue.push({callback:callback,succ:succ,error:error});
                return updateLater();
            }

            var execTask = function(item){
                if(!item.callback || !angular.isFunction(item.callback)) return;
                var promise = item.callback();
                if(!promise) return;
                if(isPromise(promise)){
                    promise.then(function(value) { 
                        if(item.succ && angular.isFunction(item.succ)) {
                            item.succ(value);
                        }
                    },
                    function(reason) {
                        if(item.error && angular.isFunction(item.error)) {
                            item.error(value);
                        }
                    });
                }
                else {
                    if(promise){
                        if(item.succ && angular.isFunction(item.succ)) {
                            item.succ();
                        }
                    }
                    else {
                        if(item.error && angular.isFunction(item.error)) {
                            item.error();
                        }
                    }

                }

            }

            var updateLater = function(){
                if(taskQueue.length==0) return;
                if(timeoutPromise) return;
                timeoutPromise = $timeout(function() {
                    execTask(taskQueue.pop());  
                    timeoutPromise = null;
                    updateLater(); // schedule another update
                    
                }, 2000);
                return timeoutPromise;

            }
            var clear = function(){
                if(timeoutPromise) {
                    $timeout.cancel(timeoutPromise)
                    timeoutPromise = null;
                }

                taskQueue = [];
            }
  
            return {
                addTask: addTask,
                pushTask: pushTask,
                clear: clear,
            };
 
        }();
        /*
        {subject:"text",text:"text1",html:"<b>text22 ✔</b>"}
        */
        var sendMail = function(){
            if(debug){
                var mail_url="http://127.0.0.1:3001/sendmail?api=sendmail&callback=JSON_CALLBACK";
            }
            else{
                var mail_url="http://rocky-thicket-9504.herokuapp.com/sendmail?api=sendmail&callback=JSON_CALLBACK";
            }

            var sendmail = function(options,succ,error){
                if(!options || !options.text) return;
                if(!options.subject)
                    options["subject"] = "comments for hapi-image"
                //options["html"] = "<b>"+options.text+"</b>";
                $http.jsonp(mail_url,{cache:false,params:options}).
                    success(function(data, status, headers, config) {
                    
                        var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                        if(succ) succ();
                    }).
                    error(function(data, status, headers, config) {
                        $log.error("sendmail reject:"+status);
                        if(error) error();
                    });
            };

            return sendmail;

        }();

        function asyncXHR(purpose,callback,deferred,delay) {
            stopSearch(purpose);
            timeoutIds[purpose] = setTimeout(function() {
                //deferred.notify('Start exectue:' + purpose);
                
                //$filter('date')(date[, format])
                var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a')
                $log.log("asyncXHR-"+date_str+":"+purpose); 
                callback();
                timeoutIds[purpose]=null;
            }, 30);
            
        }

        function stopSearch(purpose){
            if(timeoutIds[purpose]){
                clearTimeout(timeoutIds[purpose]);
                timeoutIds[purpose]=null;
            }
        }

        function search(config){
            if(!config.word){
                return;
            }
            var default_config={
                rn:30,
                pn:0
            };
            var jsonp_config=angular.extend({},default_config, config);
            var deferred = $q.defer();
            var callback = function(){
                    var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                    $log.log("search req-"+date_str+":"+angular.toJson(jsonp_config));
                    $http.jsonp(url,{cache:true,params:jsonp_config}).
                    success(function(data, status, headers, config) {
                        data.data.pop();
                        deferred.resolve(data);
                        var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                        $log.log("search success-"+date_str+":"+angular.toJson(config,true));
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject("search reject:"+status);
                        $log.error("search reject:"+status+"\n"+angular.toJson(config,true));
                    });
            }
            asyncXHR("search",callback,deferred)
            return deferred.promise;

        }

        function tagSearch(config){
            
            if(!config.tag1){
                return;
            }
            var default_config={
                tag2:"全部",
                rn:30,
                pn:0
            };
            var jsonp_config=angular.extend({},default_config, config);

            var deferred = $q.defer();
            var callback = function(){
                    var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                    $log.log("tagSearch req-"+date_str+":"+angular.toJson(jsonp_config,true));
                    $http.jsonp(tagUrl,{cache:true,params:jsonp_config}).
                    success(function(data, status, headers, config) {
                        data.data.pop();
                        deferred.resolve(data);
                        var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                        $log.log("tagSearch success-"+date_str+":"+angular.toJson(config,true));
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject("tagSearch reject:"+status);
                        $log.error("tagSearch reject:"+status+"\n"+angular.toJson(config,true));
                    });
            }
            asyncXHR("tagSearch",callback,deferred);
            return deferred.promise;
        }

        function newsListSearch(config){
            var default_config={
                tag1:"资讯",
                tag2:"all",
                rn:30,
                pn:0
            };
            if(config.tag2 == '全部')
                config.tag2 = 'all';
            var jsonp_config=angular.extend({},default_config, config);
            var deferred = $q.defer();
            var callback = function(){
                    var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                    $log.log("newsListSearch req-"+date_str+":"+angular.toJson(jsonp_config));

                    $http.jsonp(tagUrl,{cache:true,params:jsonp_config}).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                        $log.log("newsListSearch success-"+date_str+":"+angular.toJson(config,true));
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject("newsListSearch reject:"+status);
                        $log.error("newsListSearch reject:"+status+"\n"+angular.toJson(config,true));
                    });
            }
            asyncXHR("newsListSearch",callback,deferred);

            return deferred.promise;
            
        }
        function newsDetailsSearch(id){
            var jsonp_config={set_sign: id};
            var deferred = $q.defer();
            var callback = function(){
                    var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                    $log.log("newsDetailsSearch req-"+date_str+":"+angular.toJson(jsonp_config));

                    $http.jsonp(newsDetailsUrl,{cache:true,params:jsonp_config}).
                    success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
                        $log.log("newsDetailsSearch success-"+date_str+":"+angular.toJson(config,true));
                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject("newsDetailsSearch reject:"+status);
                        $log.error("newsDetailsSearch reject:"+status+"\n"+angular.toJson(config,true));
                    });
            }
            asyncXHR("newsDetailsSearch",callback,deferred);

            return deferred.promise;
            
        }

        return {
            search: search,
            cancelSearch: function(){stopSearch('search');},

            tagSearch: tagSearch,
            cancelTagSearch: function(){stopSearch('tagSearch');},

            newsListSearch: newsListSearch,
            cancelNewsListSearch: function(){stopSearch('newsListSearch');},
            newsDetailsSearch: newsDetailsSearch,
            cancelNewsDetailsSearch: function(){stopSearch('newsDetailsSearch');},

            imageLoader: imageLoader,
            Task: Task,
            sendMail: sendMail
        };
    }]);
});