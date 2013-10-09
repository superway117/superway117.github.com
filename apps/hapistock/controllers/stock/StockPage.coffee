
$ = Spine.$


class StockPage extends Phoniex.HeaderLeftAccordionMenuPage

    #must implement
    mainMenuItem:       {name:"stock",text:"个股"}
    pageMenuID:         "stockPageMenuID"
    pageMenuGroups:
        [
            {menuGroupID:"stockRealTimeGroupID",title:"实时行情"}
            #{menuGroupID:"stockNewsGroupID",title:"新闻公告"}
        ]

    #headerMenuTmpl:     window.Tmpls.toolbarHeader()
    cacheKey:           "quote"
    cacheExpiredTime:   60000
    stockID:            "002142"
    refreshTimer:       null
    refreshTimeOut:       60000


    events:
       'click .form-inline button.stock-add-btn': 'deOpenAddStockModal'
       'click #addTagBtn': 'deAddTag'
       'click #addStockBtn': 'deAddStock'

    elements:
        '.modal-body select' : 'tagSelects'
        '.modal-body input[type=text]' : 'newTagText'
        '.modal-body form' : 'addStockForm'


    default: "quote"

    controllers:
        quote: App.QuotePanel
        deal: App.DealPanel
        historydeal: App.HistoryDealPanel
        historymoney: App.HistoryMoneyPanel
        #news: App.NewsPanel

    constructor: ->
        super
        @gstock = new App.GoogStock
        @gstock.bind('fetchFinished', @fetchFinished)
        @bind("refresh",@fetchData)
        #@bind("render",@render)

        @registerPageEvent "query",(stockID)=>
            @setStock stockID
            @slientActive(@quote)
            true

        @registerPageEvent "compare",(compares)=>
            return false if not compares or compares.length<1
            @slientActive(@quote)
            @setStock compares.pop()
            @quote.setCompareText(compares)
            true


    loadFromTemplate: ->
        super
        @append( window.Tmpls.stockAddStockModal() )


    fetchFinished: (result)=>
        if result.status is "succ"
            data=result.list[0]
            Phoniex.Cache.set(@cacheKey,data,@cacheExpiredTime)
            #@trigger("render",data)
            @render()


    render: (data) =>
        data ?= Phoniex.Cache.get( @cacheKey )
        data["color"] = if data.cp.charAt(0) == "-" then "#468847" else "#FF0000"
        @tophalf.html(window.Tmpls.stockPageTophalf(data))

    fetchData: (args...) =>
        if data=Phoniex.Cache.get( @cacheKey )
            @render()
        else
            @gstock.fetchStock @stockID

    activate: ->
        super
        #@startActiveTimer()
        @startRefreshTimer()

    deactivate: ->
        super
        @clearRefreshTimer()


    startActiveTimer:->

        if @isActive()
            @delay(@startRefreshTimer,500)

    startRefreshTimer:->

        if @isActive()
            if not @refreshTimer
                console.log("StockPage startRefreshTimer")
                @refreshTimer = @delay(@refreshTimerCB,@refreshTimeOut)
                @refresh()

    refreshTimerCB:->
        if @isActive()
            console.log("StockPage refreshTimerCB")
            @refreshTimer = @delay(@refreshTimerCB,@refreshTimeOut)
            @refresh()

    clearRefreshTimer: ->
        if @refreshTimer
            clearTimeout(@refreshTimer)
        @refreshTimer = null

    updateTagSelects: ->

        App.TagList.fetch()

        App.TagList.create(App.TagList.default) if App.TagList.count() is 0
        records = App.TagList.all()
        @tagSelects.empty()
        for record in records
            data={name:record.name, text:record.name}
            @tagSelects.append(window.PhoniexTmpls.selectMenuItem(data))

    appendTagSelect: (name)->
        if App.TagList.findByAttribute("name",name)
            Phoniex.Util.openAlert(@addStockForm,
                {type:"alert-error",body:"标签已经存在"})
        else
            data={name:name, text:name}
            App.TagList.create({name:name})
            @tagSelects.prepend(window.PhoniexTmpls.selectMenuItem(data))
            @tagSelects.get(0).selectedIndex =0

    deOpenAddStockModal: (e)->
        e.preventDefault()
        @updateTagSelects()
        $('#addStockModal').modal()
        return false

    deAddTag: (e)->
        name = @newTagText.val()
        if not name
            Phoniex.Util.openAlert(@addStockForm,
                {type:"alert-error",body:"名字不能为空"})
        else
            @appendTagSelect(name)
        e.preventDefault()
        return false

    deAddStock: (e)->
        tag=@tagSelects.val()
        e.preventDefault()

        item =App.StockList.select (item)=>
                item["stock"] is @stockID and item["tag"] is tag
        if item.length > 0
            Phoniex.Util.openAlert(@addStockForm,
                {type:"alert-error",body:"股票已经存在"})
        else
            App.StockList.create({stock:@stockID,tag:tag})
            $('#addStockModal').modal('hide')

        return false

    clearAllCache: ->
        for cont in @manager.controllers
            cont.clearCache?()

    setStock: (stock)->
        if stock and stock isnt @stockID
            @stockID = stock
            Phoniex.Cache.clear(@cacheKey)
            @clearAllCache()
            return true
        else
            return false

    deFetchStock: (e) ->
        e.preventDefault()
        value = @searchText.val()[0..5]
        return false if not App.Util.isValidStockID(value)
        if @setStock value
            @refreshPage()
        return false


App["StockPage"]    = StockPage