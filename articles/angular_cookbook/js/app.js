'use strict';

/* App Module */

angular.module('jscookbook',[]).
    config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
        angular.forEach(articles_list,function(topic,index){
            if(topic["link"]){
                $routeProvider.when('/'+topic["title"], {templateUrl: topic["link"]})
            }
            else if(angular.isArray(topic["section"])){
                $routeProvider.when('/'+topic["title"], {templateUrl: topic["section"][0]["link"]})
            }
            if(angular.isArray(topic["section"]) ){
                angular.forEach(topic["section"],function(section,index){
                    $routeProvider.when('/'+section["title"], {templateUrl: section["link"]})
                });
            }
        });
        $routeProvider.
            when('/index', {templateUrl: 'partials/introduction.html'}).
            otherwise({redirectTo: '/index'});
    }])
