
$ = Spine.$

class HistoryDealPanel extends Phoniex.Panel

    menuItem: {menuGroupID: "stockRealTimeGroupID",name:"historydeal",text:"历史交易数据"}

    elements:
        'table tbody' : 'table'
        '#historyDealYear' : 'yearSelect'
        '#historyDealSeason' : 'seasonSelect'

    events:
        "click #historyDealQuery": "deQuery"

    lastQuery:
        "year" : null
        "season" : null
        "history": null

    constructor: ->
        super
        @bind("refresh",@fetchData)
        @ystock = new App.YahooStock()
        @ystock.bind("fetchHistoryDealFinished",@fetchHistoryDealFinished)

    loadFromTemplate: ->
        super
        @append window.Tmpls.stockHistoryDeal()

    activate: (args...)->
        super
        @table.empty()
        @initDateSelect()
        @refresh()

    fetchData: ->
        if @isDataReady()
            @render()
        else
            @fetchDataImpl()

    initDateSelect: ()->
        if @lastQuery.year? and @lastQuery.season?
            year = @lastQuery.year
            season = @lastQuery.season
        else
            year = "#{Phoniex.Util.getCurrentYear()}"
            season = "#{Phoniex.Util.getCurrentSeason()}"
        $("option[value=#{year}]",@yearSelect).attr('selected', true)
        $("option[value=#{season}]",@seasonSelect).attr('selected', true)

    fetchDataImpl: ()->

        options = {}
        @lastQuery.year=options.year = @yearSelect.val()
        @lastQuery.season=options.season = @seasonSelect.val()
        @lastQuery.history = null
        options.stockID = @stack.stockID
        @table.empty()
        Phoniex.Util.appendLoadingBar(@el)
        @ystock.fetchHistoryDeal(options)

    render: ()->
        Phoniex.Util.removeLoadingBar(@el)
        return if not @isDataReady()
        @table.append(window.Tmpls.stockHistoryDealItem(@lastQuery.history))

    fetchHistoryDealFinished: (result)=>
        if result.status is "fail"
            Phoniex.Util.removeLoadingBar(@el)
            return
        result["color"] = ->
            if @growth < 0 then "#468847" else "#FF0000"
        @lastQuery.history=result
        @render()

    deQuery: (e)=>
        e.preventDefault()
        @clearCache()
        @fetchData()

    isDataReady: ->
        return true if @lastQuery.year? and @lastQuery.season? and @lastQuery.history?
        false

    clearCache: ->
        @lastQuery.year=@lastQuery.season= @lastQuery.history=null

App["HistoryDealPanel"]    = HistoryDealPanel