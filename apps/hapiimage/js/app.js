'use strict';

/* App Module */

angular.module('hapiImage', ['hapiImageFilters', 'hapiImageServices']).
    config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
        $routeProvider.
            when('/index', {templateUrl: 'partials/search.html',   controller: SearchCtrl}).
            when('/tag', {templateUrl: 'partials/tag.html', controller: TagCtrl}).
            when('/news', {templateUrl: 'partials/news.html', controller: NewsCtrl}).
            //when('/news', {templateUrl: 'partials/news.html', controller: TagCtrl}).
            otherwise({redirectTo: '/index'});
        //$locationProvider.html5Mode(true);
    }]).
    run(['BaiduSearch','$log',function(BaiduSearch,$log){
        var searchConfig = {
            tag2: "all",
            rn: 50,
            pn: 0   
        };

        var tag2List = [
            {name: "全部", hot : false},
            {name: "国内", hot : false},
            {name: "国际", hot : false},
            {name: "娱乐", hot : false},
            {name: "体育", hot : false},
            {name: "军事", hot : false},
            {name: "专题", hot : false},
        ]

        var callback = function(tag2){
            return BaiduSearch.newsListSearch(angular.extend(searchConfig,{tag2:tag2}));
        }
        var succ = function(data){
            
        }
        angular.forEach(tag2List,function(item,key){
            BaiduSearch.Task.addTask(angular.bind(self,callback,item.name));
        });     
        $log.log("hapiImage module run");
    }]);
