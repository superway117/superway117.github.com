
$ = Spine.$

class DealPanel extends Phoniex.Panel

    menuItem: {menuGroupID: "stockRealTimeGroupID",name:"deal",text:"成交明细"}

    elements:
        'table tbody' : 'table'

    cacheKey:           "deal"
    cacheExpiredTime:   60000
    refreshTimer:       null

    constructor: ->
        super
        @ystock = new App.YahooStock()
        @ystock.bind("fetchDealFinished",@fetchDealFinished)
        @bind("refresh",@fetchData)

    loadFromTemplate: ->
        super
        @append window.Tmpls.stockDeal()

    activate: (args...)->
        super
        @startRefreshTimer()

    deactivate: ->
        super
        @clearRefreshTimer()

    startRefreshTimer:->

        if @isActive()
            if not @refreshTimer
                console.log("DealPanel startRefreshTimer")
                @refreshTimer = @delay(@refreshTimerCB,@cacheExpiredTime)
                @refresh()

    refreshTimerCB:->
        if @isActive()
            console.log("DealPanel refreshTimerCB")
            @refreshTimer = @delay(@startRefreshTimer,@cacheExpiredTime)
            @refresh()

    clearRefreshTimer: ->
        if @refreshTimer
            clearTimeout(@refreshTimer)
        @refreshTimer = null

    fetchData: ->
        if Phoniex.Cache.get(@cacheKey)
            @render()
        else
            @table.empty()
            Phoniex.Util.appendLoadingBar(@el)
            @ystock.fetchDeal(@stack.stockID)

    fetchDealFinished: (result)=>
        Phoniex.Util.removeLoadingBar(@el)
        return if result.status is "fail"
        Phoniex.Cache.set(@cacheKey,result,@cacheExpiredTime)
        @render()


    render: (data)->
        @table.empty()
        data ?= Phoniex.Cache.get(@cacheKey)
        data["color"] = ->
            if @type is "卖盘" then "#468847" else "#FF0000"
        @table.append(window.Tmpls.stockDealItem(data))

    clearCache: ->
        Phoniex.Cache.clear(@cacheKey)

App["DealPanel"]    = DealPanel