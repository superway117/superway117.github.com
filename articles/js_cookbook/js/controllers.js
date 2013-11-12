'use strict';

/* Controllers */

function isEmpty(value) {
  return angular.isUndefined(value) || value === '' || value === null || value !== value;
}
function getWidth(){
    return Sniff.width();
}

function getHeight(){
    return Sniff.height();
}


function MainCntl($scope, $route, $routeParams,$location,$log) {
    var self = this;
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
    
    $scope.notifyContext = "操作成功!";
    $scope.notifyType = "操作成功!";
    
    $scope.$on('$viewContentLoaded', function(){
        
        $log.log("on viewContentLoaded");

    });
    $scope.list = articles_list;
    

}
MainCntl.$inject = ['$scope', '$route','$routeParams','$location','$log'];


function HomeCtrl($scope) {

}

HomeCtrl.$inject = ['$scope'];

