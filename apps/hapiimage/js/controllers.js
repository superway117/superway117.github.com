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


function MainCntl($scope, $route, $routeParams, BaiduSearch,$location,$log) {
    var self = this;
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
    $scope.$contactName = "";
    $scope.$contactEmail = "";
    $scope.$contactPhone = "";
    $scope.$contactComment = "";
    $scope.notifyContext = "操作成功!";
    $scope.notifyType = "操作成功!";
    
    $scope.$on('$viewContentLoaded', function(){
        
        $log.log("on viewContentLoaded");

    });
    $scope.contact = function(){
        var data = {
            subject:"comments for hapi-image",
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
            $scope.notifyContext = "操作成功!";
            $('#succModal').modal()

        }
        var error = function(){
            $scope.notifyContext = "操作失败!";
            $('#succModal').modal()
            
        }

        BaiduSearch.sendMail(data,succ,error);

    }

}
MainCntl.$inject = ['$scope', '$route','$routeParams','BaiduSearch','$location','$log'];


function SearchCtrl($scope,$timeout, $log, BaiduSearch) {

    var destroyed = false;
  	var searchConfig = {
        // word: "girl",
        rn: default_rn,
        pn: default_pn   
    };
    var galleriaConfig = {
        width:getWidth(),//$(window).width(),
        height:getHeight()-$("#searchPage").position().top-50,//$(window).height()-$("#searchPage").position().top-50,
        dummy: 'img/search/1.jpg',
        //imageCrop: "height",
        
        transition: 'flash',//'fade',
        //transitionSpeed: 600,
        //showInfo: false,
        //opacity: 0.7,
        //thumbnails: 'lazy',
        easing: 'galleriaIn',
        //preload: 5,
        autoplay: 5000,
        //http://galleria.io/docs/options/pauseOnInteraction/
        //During playback, Galleria will stop the playback if the user presses thumbnails or any other navigational links. 
        //If you dont want this behaviour, set this option to false.
        pauseOnInteraction: false
        //autoplay: true,
        //showCounter:false
    }

    var default_rn = 30;
    var default_pn = 0;


    $scope.word = ""; 

    $scope.originData=$scope.data = [
        {image: "img/search/1.jpg"},
        {image: "img/search/2.jpg"}
    ];
    
    

    $scope.search = function(){
        var params = angular.extend({word:$scope.word},searchConfig);
        var debug_count = 0;
        var imgSucc = function(url){
            if(!url) return;
            debug_count++;
            $log.log("succ load:"+debug_count+" imges");
            if(!destroyed){
                $scope.data.push({ image: url}); 
                Galleria.get(0).push({ image: url}); 
            }
        }
        $scope.promise = BaiduSearch.search(params);
        $scope.promise.then(function(data) {
            $scope.originData=data.data;
            angular.forEach(data.data,function(item,index){
                if(item.width && (item.height/item.width)>3)
                    return;

                BaiduSearch.imageLoader.addImage(item.objURL,imgSucc);
                
            });
            if(!destroyed)
                Galleria.get(0).play();
        }, 
        function(reason) {
        }, 
        function(update) {
        }); 
    }
    
    $scope.setConfig = function(rn ,pn){
        searchConfig.rn = (angular.isNumber(rn)&& rn>0)? rn : default_rn;
        searchConfig.pn = (angular.isNumber(pn)&& pn>=0)? pn : default_pn;
    }

    $scope.newSearch = function(){
        if($scope.word.length==0) return;
        BaiduSearch.imageLoader.clear();
        var index = Galleria.get(0).getIndex();
        var len = Galleria.get(0).getDataLength();
        Galleria.get(0).pause();
        if(index>1)
            Galleria.get(0).splice(0,index-1);
        if(index+1<len)
            Galleria.get(0).splice(index+1,len-index-1);
        Galleria.get(0).show(0);

        $scope.data=[];
        $scope.setConfig();
        $scope.search();

    }


    $scope.continueSearch = function(){
        if($scope.word.length==0) return;
        $scope.setConfig(searchConfig.rn,searchConfig.pn+searchConfig.rn);
        $scope.search();
    }

    $scope.wordIsInvalid = function(){
        return ($scope.word.length == 0);

    }

    BaiduSearch.imageLoader.clear();
    $('#searchGalleria').galleria(angular.extend({},
        galleriaConfig,
        {
            dataSource: $scope.data,
            extend: function() {
                var gallery = this; // "this" is the gallery instance
          
                gallery.bind('image', function(e) {
                    $log.log("galleria image event:"+e.index);

                    if(e.index+10>=$scope.data.length)
                        $scope.continueSearch();
                });
                /* for debug
                gallery.bind('loadfinish', function(e) {
                    $log.log("galleria loadfinish:"+e.index);
                });
                gallery.bind('idle_enter', function(e) {
                    $log.log("galleria idle_enter event:");

                });
                gallery.bind('pause', function(e) {
                    $log.log("galleria pause event:");
                });
                gallery.bind('play', function(e) {
                    $log.log("galleria play event:");
                });
                gallery.bind('progress', function(e) {
                });
                */
            }
        }
    ));

    Galleria.get(0).$('stage').click(function(e) {
        $log.log("galleria catch stage click");
        Galleria.get(0).playToggle();
    });


    $scope.$on('$destroy', function() {
        destroyed = true;
        $scope.data=[];
        BaiduSearch.imageLoader.clear();
        BaiduSearch.cancelSearch();
        Galleria.get(0).destroy();
        
    });

    
}

SearchCtrl.$inject = ['$scope', '$timeout','$log' ,'BaiduSearch'];


function TagCtrl($scope, $routeParams, $log, BaiduSearch) {
    
    var destroyed = false;
    var default_rn = 30;
    var default_pn = 0;

    var searchConfig = {
        tag1: "明星",
        tag2: "全部",
        rn: 30,
        pn: 0   
    };

    var tagList = {
        "明星": [
            {name: "全部", hot : false},
            {name: "高圆圆", hot : false},
            {name: "徐若瑄", hot : false},
            {name: "董洁", hot : false},
            {name: "汤唯", hot : false},
            {name: "佟丽娅", hot : false},
            {name: "林允儿", hot : true},
            {name: "刘诗诗", hot : true},
            {name: "章子怡", hot : false},
            {name: "赵丽颖", hot : false},
            {name: "刘亦菲", hot : false},
            {name: "王珞丹", hot : false},
            {name: "刘若英", hot : false},
            {name: "Angelababy", hot : false},
            {name: "范冰冰", hot : false},
            {name: "周迅", hot : false},
            {name: "刘涛", hot : false},
            {name: "赵薇", hot : false},
            {name: "姚晨", hot : false},
            {name: "杨幂", hot : false},
            {name: "戚薇", hot : false},
            {name: "何洁", hot : false},
            {name: "杨紫", hot : false},
            {name: "张含韵", hot : false},
            {name: "黄圣依", hot : false},
            {name: "霍思燕", hot : false},
            {name: "张馨予", hot : false},
            {name: "周韦彤", hot : false},
            {name: "柳岩", hot : false},
            {name: "张雨绮", hot : false},
            {name: "刘雨欣", hot : false},
            {name: "郑爽", hot : false},
            {name: "刘雨欣", hot : false},
            {name: "甘婷婷", hot : false},
            {name: "唐嫣", hot : false},
            {name: "周秀娜", hot : false},
            {name: "景甜", hot : false},
            {name: "张嘉倪", hot : false},
            {name: "赵子琪", hot : false},
            {name: "陈妍希", hot : false},
            {name: "张歆艺", hot : false},

        ],
        "美女": [
            {name: "全部", hot : false},
            {name: "真人美女秀场", hot : true},
            {name: "小清新", hot : false},
            {name: "西洋美人", hot : false},
            {name: "气质", hot : false},
            {name: "古典美女", hot : false},
            {name: "嫩萝莉", hot : false},
            {name: "网络美女", hot : false},
            {name: "cosplay", hot : false},
            {name: "唯美", hot : false},
            {name: "快到碗里来", hot : false},
            {name: "日韩美女", hot : false},
            {name: "素颜", hot : false},
            {name: "长腿", hot : false},
            {name: "非主流", hot : false},
            {name: "车模", hot : false},
            {name: "宅男女神", hot : false},
            {name: "短发", hot : false},
            {name: "高雅大气很有范", hot : false},
            {name: "足球宝贝", hot : false},
            {name: "御姐", hot : false},
            {name: "ChinaJoy", hot : false},
            {name: "甜素纯", hot : false},
            {name: "清纯", hot : false},
            {name: "校花", hot : false},
            {name: "比基尼", hot : false},
            {name: "白富美", hot : false},
            {name: "模特", hot : false},
            {name: "性感", hot : false},
            {name: "妹子", hot : false},
            {name: "宅男必备", hot : false},
            {name: "写真", hot : false},
            {name: "腐女", hot : false},
            {name: "丝袜美腿", hot : false},
            {name: "美臀", hot : false},
            {name: "有沟必火", hot : false},
            {name: "诱惑", hot : false},
            {name: "人体艺术", hot : false},
            {name: "不能直视", hot : false},
        ],

           
        "搞笑": [
            {name: "全部", hot : false},
            {name: "搞笑", hot : false},
            {name: "情侣去死去死", hot : false},
            {name: "高手在民间", hot : false},
            {name: "人艰不拆", hot : false},
            {name: "ps大神", hot : false},
            {name: "熊孩子", hot : true},
            {name: "雷人", hot : false},
            {name: "神回复", hot : false},
            {name: "2B青年", hot : false},
            {name: "屌丝专区", hot : false},
            {name: "美女福利", hot : false},
            {name: "山寨", hot : false},
            {name: "不作死就不会死", hot : false},
            {name: "我和我的小伙伴都惊呆了！", hot : false},
            {name: "暴走漫画", hot : false},
            {name: "炫富大赛", hot : false},
            {name: "穷逼大赛", hot : false},
            {name: "搞笑人物", hot : false},
            {name: "重口味", hot : false},
            {name: "冷笑话", hot : false},
            {name: "标语招牌", hot : false},
            {name: "找节操", hot : false},
            {name: "内涵图片", hot : false},
            {name: "搞笑动物", hot : false},
            {name: "错觉", hot : false},
            {name: "找亮点  ", hot : false},
            {name: "神感悟", hot : false},
            {name: "搞笑漫画", hot : false},
            {name: "创意趣图", hot : false},
            {name: "爆笑瞬间", hot : false},
            {name: "搞笑表情", hot : false},
            {name: "恶搞", hot : false},
            {name: "趣味", hot : false},
            {name: "微段子", hot : false},
            {name: "猎奇", hot : false},
            {name: "搞笑明星", hot : false},
            {name: "文字截图", hot : false},
        ],

        "资讯": [
            {name: "全部", hot : false},
            {name: "国内", hot : false},
            {name: "国际", hot : false},
            {name: "娱乐", hot : false},
            {name: "体育", hot : false},
            {name: "军事", hot : false},
            {name: "专题", hot : false},
        ],

        "动漫": [
            {name: "全部", hot : false},
            {name: "火影忍者", hot : false},
            {name: "海贼王", hot : false},
            {name: "日本漫画", hot : false},
            {name: "动漫人物", hot : false},
            {name: "后宫动漫", hot : false},
            {name: "漫画", hot : false},
            {name: "死神", hot : false},
            {name: "二次元", hot : false},
            {name: "妖精的尾巴", hot : false},
            {name: "手办", hot : false},
            {name: "名侦探柯南", hot : false},
            {name: "宫崎骏", hot : false},
            {name: "哆啦A梦", hot : false},
            {name: "动漫美少女", hot : false},
            {name: "动画", hot : false},
            {name: "cosplay", hot : false},
            {name: "古风", hot : false},
            {name: "原画", hot : false},
            {name: "手绘", hot : false},
            {name: "犬夜叉", hot : false},
            {name: "银魂", hot : false},
            {name: "七龙珠", hot : false},
            {name: "场景", hot : false},
            {name: "神奇宝贝", hot : false},
            {name: "魔兽世界", hot : false},
            {name: "高达", hot : false},
            {name: "圣斗士", hot : false},
            {name: "生化危机", hot : false}
        ],
        "宠物": [
            {name: "全部", hot : false},
            {name: "喵星人", hot : false},
            {name: "萌货", hot : false},
            {name: "狗狗", hot : false},
            {name: "猫叔", hot : false},
            {name: "哈士奇", hot : false},
            {name: "宠物鼠", hot : false},
            {name: "萨摩耶", hot : false},
            {name: "泰迪", hot : false},
            {name: "博美", hot : false},
            {name: "金毛", hot : false}
        ],

        "摄影": [
            {name: "全部", hot : false},
            {name: "风景", hot : false},
            {name: "人像", hot : false},
            {name: "光影", hot : false},
            {name: "lomo", hot : false},
            {name: "静物", hot : false},
            {name: "原创", hot : false},
            {name: "黑白", hot : false},
            {name: "时尚", hot : false},
            {name: "唯美", hot : false},
            {name: "微距", hot : false},
            {name: "摄影师", hot : false},
            {name: "国家地理", hot : false},
            {name: "城市建筑", hot : false},
            {name: "生态摄影", hot : false},
            {name: "人文纪实", hot : false},
            {name: "水下摄影", hot : false},
            {name: "摄影器材", hot : false},
            {name: "创意摄影", hot : false},
            {name: "室内摄影", hot : false}
        ],
        "设计": [
            {name: "全部", hot : false},
            {name: "平面设计", hot : false},
            {name: "室内设计", hot : false},
            {name: "产品设计", hot : false},
            {name: "建筑设计", hot : false},
            {name: "素材", hot : false},
            {name: "原创设计", hot : false},
            {name: "设计效果图", hot : false},
            {name: "经典设计", hot : false},
            {name: "雕塑", hot : false},
            {name: "海报", hot : false},
            {name: "包装", hot : false},
            {name: "插画", hot : false},
            {name: "灵感", hot : false},
            {name: "手绘", hot : false},
            {name: "icon", hot : false},
            {name: "创意设计", hot : false},
            {name: "UI", hot : false},
            {name: "logo", hot : false},
            {name: "GUI", hot : false},
            {name: "banner", hot : false},
            {name: "web", hot : false},
            {name: "APP", hot : false}
        ],
        "旅游": [
            {name: "全部", hot : false},
            {name: "美景", hot : false},
            {name: "印象", hot : false},
            {name: "建筑", hot : false},
            {name: "国外旅游", hot : false},
            {name: "国内旅游", hot : false},
            {name: "爱琴海", hot : false},
            {name: "雪山", hot : false},
            {name: "温泉", hot : false},
            {name: "海滩", hot : false},
            {name: "自然风光", hot : false},
            {name: "荷花", hot : false},
            {name: "蓝天", hot : false},
            {name: "日出", hot : false},
            {name: "峡谷", hot : false},
            {name: "马尔代夫", hot : false},
            {name: "香港", hot : false},
            {name: "西藏", hot : false},
            {name: "新疆", hot : false},
            {name: "云南", hot : false},
            {name: "丽江", hot : false},
            {name: "鼓浪屿", hot : false},
            {name: "法国", hot : false},
            {name: "马来西亚", hot : false}
        ],
        "汽车": [
            {name: "全部", hot : false},
            {name: "名车", hot : false},
            {name: "跑车", hot : false},
            {name: "兰博基尼", hot : false},
            {name: "豪车", hot : false},
            {name: "宝马", hot : false},
            {name: "保时捷", hot : false},
            {name: "奥迪", hot : false},
            {name: "摩托", hot : false},
            {name: "老爷车", hot : false},
            {name: "概念车", hot : false},
            {name: "奔驰", hot : false},
            {name: "阿斯顿.马丁", hot : false},
            {name: "汽车周边", hot : false}
        ],

        "家居": [
            {name: "全部", hot : false},
            {name: "我们都是粉色控", hot : false},
            {name: "家装", hot : false},
            {name: "装饰", hot : false},
            {name: "阳台", hot : false},
            {name: "书房", hot : false},
            {name: "儿童家居", hot : false},
            {name: "台灯", hot : false},
            {name: "茶几", hot : false},
            {name: "卫浴", hot : false},
            {name: "沙发", hot : false},
            {name: "室内", hot : false},
            {name: "装修", hot : false},
            {name: "家具", hot : false},
            {name: "陶瓷", hot : false},
            {name: "礼物", hot : false},
            {name: "创意", hot : false},
            {name: "家居生活", hot : false},
            {name: "样板间", hot : false},
            {name: "卧室", hot : false},
            {name: "别墅", hot : false},
            {name: "客厅", hot : false},
            {name: "时尚家居", hot : false},
            {name: "收纳", hot : false},
            {name: "床品套件", hot : false},
            {name: "床头柜", hot : false},
            {name: "灯", hot : false},
            {name: "创意家居", hot : false}
        ],

        "美食": [
            {name: "全部", hot : false},
            {name: "中华美食", hot : false},
            {name: "西餐", hot : false},
            {name: "家常菜", hot : false},
            {name: "蛋糕", hot : false},
            {name: "小吃", hot : false},
            {name: "甜品", hot : false},
            {name: "煲汤", hot : false},
            {name: "巧克力", hot : false},
            {name: "早餐", hot : false},
            {name: "私家菜", hot : false},
            {name: "下午茶", hot : false},
            {name: "冰淇淋", hot : false},
            {name: "咖喱", hot : false},
            {name: "海鲜", hot : false},
            {name: "水果", hot : false},
            {name: "粤菜", hot : false},
            {name: "菜品", hot : false},
            {name: "蔬菜", hot : false},
            {name: "意大利面", hot : false},
            {name: "糖果", hot : false},
            {name: "烘焙", hot : false},
            {name: "免烤", hot : false},
            {name: "饼干", hot : false},
            {name: "自制面包", hot : false},
            {name: "瘦身菜肴", hot : false},
            {name: "辣", hot : false},
            {name: "凉菜", hot : false},
            {name: "主食", hot : false},
            {name: "汤羹", hot : false},
            {name: "油炸", hot : false},
            {name: "吃货", hot : false},
            {name: "餐厅", hot : false},
            {name: "食物原料", hot : false},
            {name: "餐具厨具", hot : false},
            {name: "饮料酒水", hot : false}
        ],
    }

    $scope.getTag2List = function(){
        return tagList[searchConfig.tag1];
    }
    $scope.getTag2ListLen = function(){
        return tagList[searchConfig.tag1].length;
    }

    $scope.setTag2 = function(tag2){
        if(searchConfig.tag2 == tag2) return;
        searchConfig.tag2 = tag2;

        $scope.newSearch();
    }

    

    var galleriaConfig = {
        width:getWidth(),//$(window).width(),
        height:getHeight()-$("#tagGalleria").position().top-50,
        dummy: 'img/tag/1.jpg',
       
        easing: 'galleriaIn',
        transition: 'slide',//'fade',
        //transitionSpeed: 600,
        //showInfo: false,
        //opacity: 0.7,
        //thumbnails: 'lazy',
        //preload: 5,
        debug: false,
        pauseOnInteraction: false,

        autoplay: 5000

    }

    $scope.originData=$scope.data = [
        {image: "img/tag/1.jpg"},
        {image: "img/tag/2.jpg"}
    ];

 
    $scope.search = function(){

        $scope.promise = BaiduSearch.tagSearch(searchConfig);
        $scope.promise.then(function(data) {
            
            var debug_count = 0;
            $scope.originData= data.data;

            var imgSucc = function(data){
                if(!data) return;
                debug_count++;
                $log.log("succ load:"+debug_count+" imges");
                if(!destroyed){
                    $scope.data.push(data);
                    Galleria.get(0).push(data); 
                }
            }
            angular.forEach(data.data,function(item,index){
                if(item.image_width && (item.image_height/item.image_width)>3)
                    return;
                var data = { 
                        image: item.obj_url|| item.image_url,
                        title: item.abs
                        //description: item.image_width+"+"+item.image_height
                }
                BaiduSearch.imageLoader.addImage(data,imgSucc);
            });
            if(!destroyed)
                Galleria.get(0).play();
                
            
        }, 
        function(reason) {
        }, 
        function(update) {
        }); 
    }
    
    $scope.setConfig = function(rn ,pn){
        //config.word = word;
        searchConfig.rn = (angular.isNumber(rn)&& rn>0)? rn : default_rn;
        searchConfig.pn = (angular.isNumber(pn)&& pn>=0)? pn : default_pn;
    }

    $scope.newSearch = function(){
        var index = Galleria.get(0).getIndex();
        var len = Galleria.get(0).getDataLength();
        BaiduSearch.imageLoader.clear();
        Galleria.get(0).pause();
        if(index>1)
            Galleria.get(0).splice(0,index-1);
        if(index+1<len)
            Galleria.get(0).splice(index+1,len-index-1);
        Galleria.get(0).show(0);
        $scope.data=[];
        $scope.setConfig();
        $scope.search();

    }

    $scope.continueSearch = function(){
        $scope.setConfig(searchConfig.rn,searchConfig.pn+searchConfig.rn);
        $scope.search();
        $log.log("continueSearch rn="+searchConfig.rn+"pn="+searchConfig.pn);
    }

    
    if($routeParams.tag1) {
        searchConfig.tag1=$routeParams.tag1;
        if(searchConfig.tag1==='搞笑')
            galleriaConfig.autoplay=6000;
        else
            galleriaConfig.autoplay=5000;

    }
    if($routeParams.tag2) searchConfig.tag2=$routeParams.tag2;
    BaiduSearch.imageLoader.clear();
    
    $('#tagGalleria').galleria(angular.extend({},
        galleriaConfig,
        {
            dataSource: $scope.data,
            extend: function() {
                var gallery = this; // "this" is the gallery instance

                gallery.bind('image', function(e) {
                    if(e.index+10>=$scope.data.length)
                        $scope.continueSearch();
                });

            }
        }
        
    ));

    Galleria.get(0).$('stage').click(function(e) {
        Galleria.get(0).playToggle();

    });

    $scope.$on('$destroy', function() {
        destroyed = true;
        $scope.data=[];
        BaiduSearch.cancelTagSearch();
        BaiduSearch.imageLoader.clear();
        Galleria.get(0).destroy();

    });

    //$scope.newSearch();

}

TagCtrl.$inject = ['$scope', '$routeParams', '$log', 'BaiduSearch'];


function NewsCtrl($scope, $timeout, $log, BaiduSearch,dateFilter) {

    $scope.activePage="todayHot"
    $scope.data = {};
    $scope.newsList = {};
    var timeoutId = null;

    var default_rn = 50;
    var default_pn = 0;

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
    
    $scope.getTag2List = function(){
        return tag2List;
    }
    $scope.getTag2ListLen = function(){
        return tag2List.length;
    }

    $scope.setTag2 = function(tag2){
        if(searchConfig.tag2 == tag2) return;
        searchConfig.tag2 = tag2;
        $scope.newsListSearch();
    }

    $scope.setConfig = function(rn ,pn){
        searchConfig.rn = (angular.isNumber(rn)&& rn>0)? rn : default_rn;
        searchConfig.pn = (angular.isNumber(pn)&& pn>=0)? pn : default_pn;
    }


    $scope.newsListSearch = function(){
        var date_str=dateFilter(new Date(), 'M/d/yy h:mm:ss a');
        $log.log("NewsCtrl newsListSearch-"+date_str);


        BaiduSearch.imageLoader.clear();
        BaiduSearch.cancelNewsDetailsSearch();

        $scope.newsList = {};
        $scope.setConfig();
        $scope.promise = BaiduSearch.newsListSearch(searchConfig);
        $scope.promise.then(function(data) {
            $scope.newsList=data;
            $scope.updateNewsDetails();
        }, 
        function(reason) {
        }, 
        function(update) {
        }); 
    }

    $scope.newsDetailsSearch = function(id){

        
        if(!$scope.newsList.data || $scope.newsList.data.length==0)
            return;
    
        if($scope.data[id]) {
            $scope.updateNewsDetails();
            $log.log("should not hit here");
            return;
        }

        if(timeoutId) {
            $timeout.cancel(timeoutId);
            timeoutId = null;
        }

        $scope.promise = BaiduSearch.newsDetailsSearch(id);
        $scope.promise.then(function(data) {
            $scope.data[id] = data;
            BaiduSearch.imageLoader.addImage(data.data[0].obj_url);
            $scope.updateNewsDetails();
        }, 
        function(reason) {
            $scope.data[id] = {};
        }, 
        function(update) {
        }); 
    }

    $scope.updateNewsDetails = function(){

        if(!$scope.newsList.data || $scope.newsList.data.length==0)
            return;

        if(timeoutId) return;
    
        angular.forEach($scope.newsList.data,function(item,key){
            if(!$scope.data[item.id] && !timeoutId){

                timeoutId = $timeout(function() {
                    timeoutId = null;
                    $scope.newsDetailsSearch(item.id);
                    
                }, 30);
            }
        });
    }
    $scope.openLightbox=function(group){
        var images = [];
        var len = group.data.length;
        angular.forEach(group.data, function(item, index) {
            var title = "("+(++index)+"/"+len+") "+item.ori_desc||item.title;

            images.push({href:item.obj_url,title:title});
        });


        $.fancybox.open(images, 
            {
                padding : 0 ,
                //title : 'outside' ,
                //overlay :  false
                helpers : {
                    title: {
                        type: 'over',
                        //position: 'top'
                    }
                },
                nextEffect: 'none',
                //nextEffect: 'fade',
                prevEffect: 'none',
                openEffect: 'none',
                closeEffect : 'none',
                autoPlay : true,
                playSpeed: 4000,
                loop : false
                //prevEffect: 'fade'
                
            });
    }

    BaiduSearch.imageLoader.clear();
    $scope.newsListSearch();
    
    $scope.$on('$destroy', function() {
        $scope.data = {};
        $scope.newsList = {};
        if(timeoutId) {
            $timeout.cancel(timeoutId);
            timeoutId = null;
        }
        BaiduSearch.cancelNewsListSearch();
        BaiduSearch.cancelNewsDetailsSearch();
        BaiduSearch.imageLoader.clear();
        
    });
    $scope.$on('$viewContentLoaded', function(){
        
        //jQuery("img.lazy").lazy();

    });

}

NewsCtrl.$inject = ['$scope', '$timeout', '$log' ,'BaiduSearch','dateFilter'];

