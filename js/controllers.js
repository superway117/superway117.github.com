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
    

}
MainCntl.$inject = ['$scope', '$route','$routeParams','$location','$log'];


function HomeCtrl($scope) {


    var galleriaConfig = {
        width:getWidth(),//$(window).width(),
        height:getHeight()-$("#indexPage").position().top-50,//$(window).height()-$("#searchPage").position().top-50,
        dummy: 'img/products/hapirenju/1.jpg',
        transition: 'fade',//'fade',
        easing: 'galleriaIn',
        autoplay: 5000
    }

    $scope.data = [
        {
            image: "img/products/hapirenju/1.jpg",
            title: "Android game HapiRenju",
            description: "Based on cocos2d-x 2.3, using C++"
    
        },
        {
            image: "img/products/hapirenju/2.jpg",
            title: "Android game HapiRenju",
            description: "Based on cocos2d-x 2.3, using C++"
    
        },
        {
            image: "img/products/hapirenju/3.jpg",
            title: "Android game HapiRenju",
            description: "Based on cocos2d-x 2.3, using C++"
    
        },
        {
            image: "img/products/hapirenju/4.jpg",
            title: "Android game HapiRenju",
            description: "Based on cocos2d-x 2.3, using C++"
    
        },
        {
            image: "img/products/hapistock/1.jpg",
            title: "Web/Android app HapiStock",
            description: "Client is based on Spine,using CoffeeScript;<br>Server is based on nodejs, using CoffeeScript"
    
        },
        {
            image: "img/products/hapistock/2.jpg",
            title: "Web/Android app HapiStock",
            description: "Client is based on Spine,using CoffeeScript;<br>Server is based on nodejs, using CoffeeScript"
    
        },
        {
            image: "img/products/hapistock/3.jpg",
            title: "Web/Android app HapiStock",
            description: "Client is based on Spine,using CoffeeScript;<br>Server is based on nodejs, using CoffeeScript"
    
        },
        {
            image: "img/products/hapistock/4.jpg",
            title: "Web/Android app HapiStock",
            description: "Client is based on Spine,using CoffeeScript;<br>Server is based on nodejs, using CoffeeScript"
    
        },
        {
            image: "img/products/hapiimage/1.jpg",
            title: "Web/Android app HapiImage",
            //description: "Client is based on Angular,using javascript;<br>Server is based on nodejs, using CoffeeScript"
    
        },
        {
            image: "img/products/hapiimage/2.jpg",
            title: "Web/Android app HapiImage",
            //description: "Client is based on Angular,using javascript;<br>Server is based on nodejs, using CoffeeScript"
    
        },
        {
            image: "img/products/hapiimage/3.jpg",
            title: "Web/Android app HapiImage",
            //description: "Client is based on Angular,using javascript;<br>Server is based on nodejs, using CoffeeScript"
    
        },
        {
            image: "img/products/hapiimage/4.jpg",
            title: "Web/Android app HapiImage",
            //description: "Client is based on Angular,using javascript;<br>Server is based on nodejs, using CoffeeScript"
    
        }
    ];
    

    $('#indexGalleria').galleria(angular.extend({},
        galleriaConfig,
        {
            dataSource: $scope.data,
        }
    ));

    Galleria.get(0).$('stage').click(function(e) {
        Galleria.get(0).playToggle();
    });
    $scope.$on('$destroy', function() {
        Galleria.get(0).destroy();
    });

    
}

HomeCtrl.$inject = ['$scope'];


function CodesCtrl($scope, $routeParams, $log) {
    $scope.list = [
        {
            name: "Hapi Renju",
            description: [
                "It is an Android renju game based on cocos2d-x 2.3",            
                "The apk is already released to some app markets.",
            ],
            license: "Public domain,can be free used",
            lanuage: ["C++"],
            link: "https://github.com/superway117/Renju"
        },
        {
            name: "LibSensors for Android Froyo",
            description: ["It is a library based on android froyo(2.2) to handle Bosch BMC050 and Avago apds990x sensors"],
            license: "Apache License, Version 2.0",
            lanuage: ["C"],
            link: "https://github.com/superway117/libsensors-for-android-froyo"
        },
        {
            name: "Android crash dump",
            description: ["It is a tool to analyse anroid crash log."],
            license: "Public domain,can be free used",
            lanuage: ["Python"],
            link: "https://github.com/superway117/crashdump"
        },
        {
            name: "Find cheaper",
            description: [
                "It is a web appliction based on google GAE to find cheaper good.",
                "it fetches the page from the some B2C site according to the user's search,like dangdang,JD .etc.",
                "I do not maintain it for long times, it may not work now",
                "if parts of the codes is useful for you, you can free to use it",
                "Maybe you can reuse parts of them to analyse html pages"
            ],
                            
            license: "Public domain,can be free used",
            lanuage: ["Python"],
            link: "https://github.com/superway117/findcheaper"
        },
        {
            name: "Sqlite wrapper",
            description: [
                "It is wrapper for sqlite to simple the usage.",
                "The interface refers to Android Sqite Java interface."
            ],
            license: "Public domain,can be free used",
            lanuage: ["C"],
            link: "https://github.com/superway117/sqlite_wrapper"
        },
        {
            name: "dlmalloc debug version",
            description: [
                "Add debug infomration inside dlmalloc struct to easy debug memory leak and overwrite issue.",
                "There are some CMM script(trace32 script) for debug memory issue both ARM version and C166 version, they can be found from the link.",
                "There is also a note about the source code in the repository."
            ],
            license: "Public domain,can be free used",
            lanuage: ["C"],
            link: "https://github.com/superway117/dlmalloc_debug"
        },
        {
            name: "imagelib",
            description: [
                "It is a image decode/encode libary,designed for memory limited embedded system.",
                "Line decode and encode for saving memory",
                "Support format:JPG,BMP,WBMP,PNG,GIF.",
                "Support resize.",
                "Support some effects.",
            ],
            license: "Public domain,can be free used",
            lanuage: ["C"],
            link: "https://github.com/superway117/imagelib"
        }
        
    ];
   
}

CodesCtrl.$inject = ['$scope', '$routeParams', '$log'];


function ProductsCtrl($scope, $timeout, $log,dateFilter) {
    $scope.list = [
        {
            name: "Hapi Image",
            description: [
                "It is an Android(apk)/Web app to search images and read image news.",
                "Support PC browsers and Android tablet",
            ],
            download:[
                {
                    name: "Web Version",
                    link: "apps/hapiimage/index.html"
                }
            ],
            imgs: [
                "img/products/hapiimage/1.jpg",
                "img/products/hapiimage/2.jpg",
                "img/products/hapiimage/3.jpg",
                "img/products/hapiimage/4.jpg"
            ],
            source: "close",
            lanuage: [
                "Client: javascript",
                "Server: CoffeeScript",
            ],
        },

        {
            name: "Hapi Renju",
            description: [
                "It is an Android renju game based on cocos2d-x 2.3",
            ],
            download:[
                {
                    name: "Google Play",
                    link: "https://play.google.com/store/apps/details?id=org.cocos2dx.renju"
                },
                {
                    name: "百度应用",
                    link: "http://as.baidu.com/a/item?docid=3907419&pre=web_am_se"
                },
                {
                    name: "乐商店",
                    link: "http://app.lenovo.com/app/12141043.html"
                },
                {
                    name: "移动应用商店",
                    link: "http://mm.10086.cn/android/info/226074.html?stag=cT0lRTUlOTMlODglRTclOUElQUUlRTQlQkElOTQlRTUlQUQlOTAmcD0xJnQ9JUU1JTg1JUE4JUU5JTgzJUE4JnNuPTEmYWN0aXZlPTE%3D"
                },
                {
                    name: "安智市场",
                    link: "http://www.anzhi.com/soft_990279.html"
                },
                {
                    name: "豌豆荚",
                    link: "http://www.wandoujia.com/apps/org.cocos2dx.renju"
                }
            ],
            imgs: [
                "img/products/hapirenju/1.jpg",
                "img/products/hapirenju/2.jpg",
                "img/products/hapirenju/3.jpg",
                "img/products/hapirenju/4.jpg"
            ],
            source: "open",
            license: "Public domain,can be free used",
            lanuage: ["C++"],
            link: "https://github.com/superway117/Renju"
        },
        {
            name: "Hapi Stock",
            description: [
                "It is an Android(apk)/Web app to query stock information based on Phonegap",
                "Support PC browsers and Android tablet"
            ],
            download:[
                {
                    name: "Web Version",
                    link: "apps/hapistock/index.html"
                }
            ],
            imgs: [
                "img/products/hapistock/1.jpg",
                "img/products/hapistock/2.jpg",
                "img/products/hapistock/3.jpg",
                "img/products/hapistock/4.jpg"
            ],
            source: "close",
            lanuage: [
                "Client: CoffeeScript",
                "Server: CoffeeScript",
            ],
        },
        
        
    ];

}

ProductsCtrl.$inject = ['$scope', '$timeout', '$log' ,'dateFilter'];



function ResumeCtrl($scope, $timeout, $log,dateFilter) {

}

ResumeCtrl.$inject = ['$scope', '$timeout', '$log' ,'dateFilter'];
function ContactCtrl($scope, $timeout, $log,dateFilter,BaiduSearch) {
    $scope.$contactName = "";
    $scope.$contactEmail = "";
    $scope.$contactPhone = "";
    $scope.$contactComment = "";

    $scope.IsInvalid = function(){
        if(!isEmpty($scope.contactComment))
            return false;
        return true;
    }

    $scope.contact = function(){
        var data = {
            subject:"message from github",
            text: ""
        };
        if(!isEmpty($scope.contactName))
            data.text += ("name:"+$scope.contactName+"\n");
        if(!isEmpty($scope.contactEmail))
            data.text += ("email:"+$scope.contactEmail+"\n");
        if(!isEmpty($scope.contactPhone))
            data.text += ("phone:"+$scope.contactPhone+"\n");
        if(!isEmpty($scope.contactComment))
            data.text += ("comments:"+$scope.contactComment+"\n");
    
        var succ = function(){
            $scope.notifyContext = "Send succ!";
            $('#notifyModal').modal()

        }
        var error = function(){
            $scope.notifyContext = "Send failure!";
            $('#notifyModal').modal()
            
        }

        BaiduSearch.sendMail(data,succ,error);

    }
}

ContactCtrl.$inject = ['$scope', '$timeout', '$log' ,'dateFilter','BaiduSearch'];
