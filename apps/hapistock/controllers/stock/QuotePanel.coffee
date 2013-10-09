
$ = Spine.$

class QuotePanel extends Phoniex.Panel

    menuItem: {menuGroupID: "stockRealTimeGroupID",name:"quote",text:"行情页"}

    events:
        'click div.btn-group button[type=button]': 'deTapButton'
        'change div.form-inline select': 'deSelectIndicator'
        'submit form.form-inline': 'deCompare'
        "change form.form-inline input[type=checkbox]" : "deAddCompare"
        #'focus form.form-inline input[type=text]': 'deClearCompare'

    elements:
        "#stockTodayChart" : "chart"
        "#stockRealTradeTable" : "tradeData"
        "form.form-inline input[type=text]" : 'compareText'


    chartConfig:
        "range": "1d"
        "indicator": ""

    chartTimer : null
    chartTimeOut : 60000*5

    tradeTimer: null
    tradeTimeOut : 10000

    constructor: ->
        super
        @ystock = new App.YahooStock()
        @ystock.bind("fetchLastFinished",@fetchLastFinished)
        @compareText.typeahead(
            source: @compareTypeAhead
            matcher: -> return true
            updater: @compareUpdater
        )


    loadFromTemplate: ->
        super
        @append window.Tmpls.stockQuote()

    activate: (args...)->
        super
        @bind("refresh",@render)
        @refreshButtonState()
        #@clearCompareText()
        @startChartTimer()
        @startTradeTimer()

    deactivate: ->
        super
        @clearTradeTimer()
        @clearChartTimer()

    setCompareText: (list)->
        listStr = list.join(",")
        @compareText.val(listStr)

    clearCompareText: ->
        @compareText.val("")

    compareTypeAhead: (val,func)=>
        arr=val.split(",")
        cur = arr[arr.length-1]
        list = App.StockDict.query(cur)
        (item.join(",") for item in list)

    compareUpdater: (item) =>
        arr = @getCompareArray()
        arr.pop()
        newItem = item[0..5]
        if arr.indexOf(newItem) < 0
            arr.push newItem
        @compareArry2Str(arr)

    compareArry2Str: (arr)->
        if arr.length > 0
            str=arr.join(",")
            "#{str},"
        else
            ""

    getCompareArray: ->
        val = $.trim(@compareText.val())
        if val is "" or val is ","
            arr=[]
        else
            arr = @compareText.val().split(",")
            if val[val.length-1] is ","
                arr.pop()
        arr

    removeCompareStock: (stock,arr)->
        index = arr.indexOf(stock)
        if index  >= 0
            arr.splice(index,1)
        arr

    addCompareStock: (stock,arr)->
        if arr.indexOf(stock) < 0
            arr.push(stock)
        arr

    deAddCompare: (e) =>
        node = $(e.target)
        value = node.val()
        arr = @getCompareArray()
        if node.is(':checked')
            arr = @addCompareStock(value,arr)
        else
            arr = @removeCompareStock(value,arr)
        @compareText.val(@compareArry2Str(arr))


    deClearCompare: (e) ->
        $(e.target).val("")

    deCompare: (e)->
        e.preventDefault()
        arr = @getCompareArray()
        for stock,index in arr
            arr.splice(index,1) if not App.Util.isValidStockID(stock)
        @compareText.val(@compareArry2Str(arr))
        @startChartTimer()

    refreshButtonState: ->
        @$("button[data-command=range][data-value=#{@chartConfig.range}]").button('toggle')

    startTradeTimer:->
        if @isActive()
            if not @tradeTimer
                console.log("QuotePanel startTradeTimer")
                @tradeTimer=@delay(@tradeTimerCB,@tradeTimeOut)
                @renderTrade()

    tradeTimerCB:->
        if @isActive()
            console.log("QuotePanel tradeTimerCB")
            @tradeTimer=@delay(@tradeTimerCB,@tradeTimeOut)
            @renderTrade()


    clearTradeTimer:->
        if @tradeTimer
            clearTimeout(@tradeTimer)
        @tradeTimer = null

    startChartTimer:->
        if @isActive()
            if not @chartTimer
                console.log("QuotePanel startChartTimer")
                @chartTimer=@delay(@chartTimerCB,@chartTimeOut)
                @renderChart()

    chartTimerCB:->
        if @isActive()
            console.log("QuotePanel chartTimerCB")
            @chartTimer=@delay(@chartTimerCB,@chartTimeOut)
            @renderChart()

    clearChartTimer:->
        if @chartTimer
            clearTimeout(@chartTimer)
        @chartTimer = null

    renderChart: ->
        # @chart.attr("src",App.YahooStock.fetchLargeChart(@stack.stockID))
        options = {}
        $.extend(options,@chartConfig)
        arr = @getCompareArray()
        if arr.length>0
            options["compare"]=arr
        @chart.attr("src",App.YahooStock.fetchTechChart(@stack.stockID,options))

    renderTrade: ->
        @ystock.fetchLast(@stack.stockID)

    fetchLastFinished: (result) =>
        return if result.status isnt "succ"

        @tradeData.empty()
        @tradeData.append(window.Tmpls.stockQuoteTradeItem(result.list[0]))

    deTapButton: (e)->
        e.preventDefault()
        node = $(e.target)
        @chartConfig.range = node.data("value")
        @startChartTimer()

    deSelectIndicator: (e)->
        e.preventDefault()
        @chartConfig.indicator = $(e.target).val()
        @startChartTimer()

    render: ->
        @renderChart()
        @renderTrade()



App["QuotePanel"]    = QuotePanel