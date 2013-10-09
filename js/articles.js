function ArticlesCtrl($scope, $timeout, $log,dateFilter) {
    $scope.list = [
        {
            name: "dlmalloc source code reading notes",
            description: [
                "dlmalloc is widely used memory alloc algorithm",
                "this notes include: how to understand source code and how to debug",
            ],
            link: "articles/dlmalloc/index.html"
        },
        {
            name: "Android System Properties source code reading notes",
            description: [
                "Android System Properties source code notes"
            ],
            link: "articles/android/android_system_properties.htm"
        },
        {
            name: "Sqlite Query Planning 基础篇",
            description: [
                "introduce the Sqlite query planning",
                "copy from my blog"
            ],
            link: "articles/sqlite/sqlite_query_planning.htm"
        }
        
    ];
}

ArticlesCtrl.$inject = ['$scope', '$timeout', '$log' ,'dateFilter'];