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



function SearchCtrl($scope,$timeout,$http, $log) {

    var destroyed = false;
    var timeoutId = null;
    $scope.stage = 0;
    $scope.count = 1;
    $scope.isPlaying = false;
  
    var nextTargets = [];
    var secNextTargets = [];
  
    var selected = -1;
    var done = false;

    var reloadData = function(){

        
        removeLuckGuy()
        $scope.peopleImgs=[]
        angular.forEach($scope.people,function(p){
            //console.log(p);
            //if(!p.bingo)
            $scope.peopleImgs.push({"image":p.img});
        });
        findTarget();
        //console.log(data);
        //console.log($scope.peopleImgs);
        Galleria.get(0).load($scope.peopleImgs)

    }
    var findTarget = function(){
        secNextTargets = [];
        nextTargets = [];
        console.log("findTarget $scope.stage="+$scope.stage);
        console.log("findTarget $scope.count="+$scope.count);
        var targets = $scope.lucky["level"][$scope.stage].target;
        
        //console.log(targets);
        if(targets.length === 0) {
            console.log("no targets")
            var noTargetTmp = []

            for(var i=0;i<$scope.people.length;i++){
                nextTargets.push(i);
            }
            console.log("nextTargets"+nextTargets)
            angular.forEach($scope.lucky["level"],function(level,index){
                if($scope.stage != index && level.target.length>0){
                    console.log("level.target:"+level.target)
                    noTargetTmp = noTargetTmp.concat(level.target)
                }
            });
            console.log(noTargetTmp);
            angular.forEach($scope.people,function(p,index){

                angular.forEach(noTargetTmp,function(target){
                    if(target === p.name){
                        console.log("remove :"+p.name+":"+index)
                        nextTargets = _.without(nextTargets, index);
                    }

                });
           
            });
        }
        else{
            
            angular.forEach($scope.people,function(p,index){
                angular.forEach(targets,function(target){
                    if(target === p.name){
                        
                        nextTargets.push(index);
                        console.log("stage:"+$scope.stage);
                        console.log("count:"+$scope.count);
                        console.log("target:"+target);
                        console.log("index:"+index);
                        //console.log("nextTargets tmp:"+nextTargets);
                    }
                });

               
            });
            if(nextTargets.length < $scope.lucky["level"][$scope.stage].num ){
                var noTargetTmp = []
                for(var i=0;i<$scope.people.length;i++){
                    secNextTargets.push(i);
                }
                angular.forEach($scope.lucky["level"],function(level,index){
                    if(level.target.length>0){
                        console.log("level.target:"+level.target)
                        noTargetTmp = noTargetTmp.concat(level.target)
                    }
                });
                angular.forEach($scope.people,function(p,index){

                    angular.forEach(noTargetTmp,function(target){
                        if(target === p.name){
                            console.log("remove :"+p.name+":"+index)
                            secNextTargets = _.without(secNextTargets, index);
                        }

                    });
               
                });


            }
        }
        console.log("nextTargets:"+nextTargets);
        console.log("secNextTargets:"+secNextTargets);

    }
    var removeLuckGuy = function(){
        if(selected>0)
            $scope.people.splice(selected,1);
        
    }
    $http.get('people.json').success(function(data) {
        $scope.lucky = data;
        $scope.people=angular.copy(data.people)
        reloadData()
        
    });

    
    

    var galleriaConfig = {
        width:getWidth(),//$(window).width(),
        height:getHeight()+30,//$(window).height()-$("#searchPage").position().top-50,
        dummy: 'img/1.jpg',
        //imageCrop: "height",
        
        transition: 'fadeslide',//fadeslide',//'fade',//flash',//'fade',
        transitionSpeed: 10,
        //showInfo: false,
        //opacity: 0.7,
        //thumbnails: 'lazy',
        easing: 'galleriaIn',
        //preload: 5,
        autoplay: false,
        debug: false,
        //http://galleria.io/docs/options/pauseOnInteraction/
        //During playback, Galleria will stop the playback if the user presses thumbnails or any other navigational links. 
        //If you dont want this behaviour, set this option to false.
        pauseOnInteraction: false,
        //autoplay: true,
        //showCounter:false
        thumbnails: false
    }




    $scope.playToggle = function(){

        
        $scope.isPlaying = !$scope.isPlaying;
        if(timeoutId) {
            $timeout.cancel(timeoutId);
            timeoutId = null;
        }

        if($scope.isPlaying){
            done = false;
            reloadData()
            /*
            timeoutId = $timeout(function() {
                timeoutId = null;
                $scope.playToggle()
                            
            }, 10000);
            */
     
            Galleria.get(0).setPlaytime(10);
            //Galleria.get(0).resize();
            Galleria.get(0).playToggle();
            //Galleria.get(0).enterFullscreen();
        }
        else{
            var current = Galleria.get(0).getIndex();
            console.log("press stop current is:"+current);
  
            for(var i=0;i<nextTargets.length;i++){
                if(current === nextTargets[i]){
                    console.log("ok, find it on playtoggle:"+nextTargets[i]);
                 
                    selected = current;
                    if($scope.count >= $scope.lucky["level"][$scope.stage].num){
                        $scope.count=1;
                        $scope.stage+=1;
             
                    }
                    else
                        $scope.count+=1;
     
                    

                    Galleria.get(0).pause();
                    console.log("stage:"+$scope.stage);
                    console.log("count:"+$scope.count);
                    done = true;
                    $scope.$apply();
                    return;

                }
            }
            var nextOne = 0;
            if(nextTargets.length === 1){
                nextOne=nextTargets[0];
            }
            else if(nextTargets.length > 1){
                var random = (Math.random()*nextTargets.length);
                nextOne = nextTargets[Math.floor(random)];
            }
            else if(secNextTargets.length === 1){
                nextOne=secNextTargets[0];
            }
            else if(secNextTargets.length > 1){
                var random = (Math.random()*secNextTargets.length);
                nextOne = secNextTargets[Math.floor(random)];
            } 
            
            console.log("not find it on playtoggle, nextTargets:"+nextTargets);
            console.log("not find it on playtoggle, try a random one:"+nextOne);
  
            selected = nextOne;
            Galleria.get(0).show(selected);
            Galleria.get(0).pause();
            
    
            

        }

        

    }
    $scope.setCounter = function(index){
        Galleria.get(0).setCounter(index);
    }

    
    
    $('#searchGalleria').galleria(angular.extend({},
        galleriaConfig,
        {
            dataSource: $scope.peopleImgs,
            extend: function() {
                var gallery = this; // "this" is the gallery instance
          
                gallery.bind('image', function(e) {
                    //$log.log("galleria image event:"+e.index);
                });
 
            }
        }
    ));
    Galleria.get(0).$('stage').dblclick(function(e) {
        $log.log("galleria catch stage click");
        /*
        if($scope.isPlaying)
            $scope.playToggle();
        else
            Galleria.get(0).exitFullscreen();
        */
    });

    Galleria.on('image', function(e) {
    
        if(!$scope.isPlaying && selected == e.index && !done){
    
            Galleria.log("on image:"+e.index);
            if($scope.count >= $scope.lucky["level"][$scope.stage].num){
                $scope.count=1;
                $scope.stage+=1;
                
            }
            else
                $scope.count+=1;
            
            Galleria.get(0).pause();
            console.log("stage:"+$scope.stage);
            console.log("count:"+$scope.count);
            done = true;
            $scope.$apply();


        }
    });


    $scope.$on('$destroy', function() {
        destroyed = true;
        $scope.data=[];
        Galleria.get(0).destroy();
        
    });
    
    

    
}
