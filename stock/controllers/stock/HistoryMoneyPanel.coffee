
$ = Spine.$

class HistoryMoneyPanel extends Phoniex.Panel

    menuItem: {menuGroupID: "stockRealTimeGroupID",name:"historymoney",text:"历史资金流向"}

    elements:
        'table tbody' : 'table'

    lastQuery:null


    constructor: ->
        super
        @bind("refresh",@fetchData)
        @ystock = new App.YahooStock()
        @ystock.bind("fetchHistoryMoneyFinished",@fetchHistoryMoneyFinished)

    loadFromTemplate: ->
        super
        @append window.Tmpls.stockHistoryMoney()

    activate: (args...)->
        super
        @table.empty()
        @refresh()


    fetchData: ->
        if @isDataReady()
            @render()
        else
            @fetchDataImpl()

    fetchDataImpl: ()->

        @clearLastQuery()

        @table.empty()
        Phoniex.Util.appendLoadingBar(@el)

        options = {}
        options.stockID = @stack.stockID
        @ystock.fetchHistoryMoney(options)



    isDataReady: ()->
        return true if @lastQuery?
        false

    clearLastQuery: ()->
        @lastQuery=null

    render: ()->
        Phoniex.Util.removeLoadingBar(@el)
        return if not @isDataReady()
        @table.append(window.Tmpls.stockHistoryMoneyItem(@lastQuery))

    fetchHistoryMoneyFinished: (result)=>
        if result.status is "fail"
            Phoniex.Util.removeLoadingBar(@el)
            return
        result["color"] = ->
            if @growth.charAt(0) is '-' then "#468847" else "#FF0000"
        result["netincolor"] = ->
            if @netin.charAt(0) is '-' then "#468847" else "#FF0000"
        result["largenetincolor"] = ->
            if @largenetin.charAt(0) is '-' then "#468847" else "#FF0000"

        @lastQuery=result
        @render()

    clearCache: ->
        @clearLastQuery()

App["HistoryMoneyPanel"]    = HistoryMoneyPanel