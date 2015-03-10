'use strict';

/* App Module */

angular.module('hapiImage', [])
    .config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
        $routeProvider.
            when('/index', {templateUrl: 'partials/search.html',   controller: SearchCtrl}).
            //when('/news', {templateUrl: 'partials/news.html', controller: TagCtrl}).
            otherwise({redirectTo: '/index'});
        //$locationProvider.html5Mode(true);
    }])
    .directive('shortcut', function() {
		  return {
		    restrict: 'E',
		    replace: true,
		    scope: true,
		    link:    function postLink(scope, iElement, iAttrs){
		      jQuery(document).on('keypress', function(e){
		         scope.$apply(scope.keyPressed(e));
		       });
		    }
		  };
		});