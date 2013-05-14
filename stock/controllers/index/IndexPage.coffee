
$ = Spine.$


class IndexPage extends Phoniex.HeaderSingleLeftMenuPage

    mainMenuItem: {name:"index",text:"大盘一览"}

    staticPageMenu:         true
    pageMenuItems:[
        {name: "000001.SS",yahoo:"000001.SS", text: "上证指数"}
        {name: "399001.SZ", yahoo:"399001.SZ",text: "深证成指"}
        {name: "INDEXHANGSENG:HSI",yahoo:"^HSI", text: "恒生指数"}
        {name: "INDEXDJX:.DJI", yahoo:"^DJI",text: "道琼斯指数"}
        {name: "INDEXNASDAQ:.IXIC", yahoo:"^IXIC",text: "纳斯达克"}
        {name: "INDEXDB:DAX", yahoo:"^GDAXI",text: "德国DAX指数"}
        {name: "INDEXFTSE:UKX", yahoo:"^FTSE",text: "伦敦富时100指数"}
    ]

    curIndex :                      null
    defaultIndex :                  "000001.SS"

    quoteCacheExpiredTime:          60000
    quoteTimer:                     null

    chartTimer:                     null
    chartCacheExpiredTime:          60000*5

    chartConfig:
        "range": "1d"
        "indicator": ""

    elements:
        "#indexChart" : "chart"

    events:
        'click div.btn-group button[type=button]': 'deTapButton'
        'change div.form-inline select': 'deSelectIndicator'



    constructor: ->
        super


        @gstock = new App.GoogStock
        @gstock.bind('fetchFinished', @fetchFinished)

        @bind("refresh",@fetchData)
        @setCurIndex()

    loadFromTemplate: ->
        super
        #@tophalf.html(window.Tmpls.indexTopHalf())
        @bottomhalf.html(window.Tmpls.indexBottomHalf())
        @refreshElements()

    loadPageMenu: ->
        super
        @registerPageMenuEvent @deChangeIndex

    deChangeIndex: (e)=>
        name = $(e.target).data("name")
        if @setCurIndex(name)
            @clearCurIndexCache()
            @startQuoteTimer()
            @startChartTimer()

    getCurText: ()->
        return if not @curIndex
        return item.text for item in @pageMenuItems when item.name is @curIndex

    setCurIndex: (index)->
        if not index
            index =@defaultIndex
        if index and @curIndex isnt index
            @curIndex = index
            return true
        else
            return false

    startChartTimer:->
        if @isActive()
            if not @chartTimer
                console.log("IndexPage startChartTimer")
                @chartTimer=@delay(@chartTimerCB,@chartCacheExpiredTime)
            @renderChart()

    chartTimerCB:->
        if @isActive()
            @chartTimer=@delay(@chartTimerCB,@chartCacheExpiredTime)
            @renderChart()


    clearChartTimer:->
        if @chartTimer
            clearTimeout(@chartTimer)
        @chartTimer = null

    getCurYahooStock: ()->
        return if not @curIndex
        return item.yahoo for item in @pageMenuItems when item.name is @curIndex


    renderChart: ->
        @chart.attr("src",App.YahooStock.fetchTechChart(@getCurYahooStock(),@chartConfig))

    deTapButton: (e)->
        e.preventDefault()
        node = $(e.target)
        @chartConfig.range = node.data("value")
        @startChartTimer()

    deSelectIndicator: (e)->
        e.preventDefault()
        @chartConfig.indicator = $(e.target).val()
        @startChartTimer()

    fetchData: (args...) =>
        if data=Phoniex.Cache.get( @getCacheKey() )
            @renderQuote()
        else
            @gstock.fetchStock @curIndex

    startQuoteTimer:->
        if @isActive()
            if not @quoteTimer
                console.log("IndexPage startRefreshTimer")
                @quoteTimer = @delay(@quoteTimerCB,@quoteCacheExpiredTime)
            @refresh()

    quoteTimerCB:->
        if @isActive()
            console.log("IndexPage quoteTimerCB")
            @quoteTimer = @delay(@quoteTimerCB,@quoteCacheExpiredTime)
            @refresh()

    clearQuoteTimer: ->
        if @quoteTimer
            clearTimeout(@quoteTimer)
        @quoteTimer = null

    getCacheKey: (indexName)->
        indexName+"-quote"

    getCurCacheKey: ->
        return if not @curIndex
        @getCacheKey(@curIndex)

    clearCurIndexCache: ->
        Phoniex.Cache.clear(@getCurCacheKey())

    fetchFinished: (result)=>
        if result.status is "succ"
            data=result.list[0]
            Phoniex.Cache.set(@getCurCacheKey(),data,@quoteCacheExpiredTime)
            @renderQuote()

    renderQuote: (data)->
        data ?= Phoniex.Cache.get( @getCurCacheKey() )
        return if not data
        data["color"] = if data.cp.charAt(0) == "-" then "#468847" else "#FF0000"
        if not data.lname
            data.lname = @getCurText()

        @tophalf.html(window.Tmpls.indexTopHalf(data))


    render: ->
        @renderChart()
        @renderQuote()

    activate: ->
        super
        @startQuoteTimer()
        @startChartTimer()

    deactivate: ->
        super
        @clearQuoteTimer()
        @clearChartTimer()

App["IndexPage"]    = IndexPage