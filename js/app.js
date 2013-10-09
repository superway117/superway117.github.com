'use strict';

/* App Module */

angular.module('myHome', ['hapiImageFilters', 'hapiImageServices']).
    config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
        $routeProvider.
            when('/index', {templateUrl: 'partials/home.html',   controller: HomeCtrl}).
            when('/codes', {templateUrl: 'partials/codes.html', controller: CodesCtrl}).
            when('/products', {templateUrl: 'partials/products.html', controller: ProductsCtrl}).
            when('/articles', {templateUrl: 'partials/articles.html', controller: ArticlesCtrl}).
            when('/contact', {templateUrl: 'partials/contact.html', controller: ContactCtrl}).
            otherwise({redirectTo: '/index'});
    }])
