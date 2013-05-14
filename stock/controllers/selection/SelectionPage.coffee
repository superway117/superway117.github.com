
$ = Spine.$


class SelectionPage extends Phoniex.HeaderSingleLeftMenuPage

    mainMenuItem:           {name:"selection",text:"自选股"}
    pageMenuItems:          null

    curTag:                 null
    fetchTag:               null

    baseTabID:              "baseTab"
    baseRefreshTimer:       null
    cacheBaseKey:           "select-base"
    cacheBaseExpiredTime:   60000

    priceTabID:             "priceTab"
    cachePriceKey:          "select-price"
    cachePriceExpiredTime:  0

    events:
        "shown a[data-toggle='tab']": "deSwitchTab"
        "click div.tab-content tbody td:nth-child(2)" : "deGotoStockPage"
        "change #baseTab thead input[type=checkbox]" : "deCheckAllBase"
        "change #priceTab thead input[type=checkbox]" : "deCheckAllPrice"
        "click #deleteBtn" : "deDelete"
        "click #compareBtn" : "deCompare"

    elements:
        'ui.nav-tabs'   : 'tabs'
        '#tagLabel'   : 'tagLabel'
        '#baseTab tbody'   : 'baseTable'
        '#priceTab tbody'        : 'priceTable'
        '#baseTab thead tr input[type=checkbox]': 'baseAllCheckboxs'
        '#baseTab tbody tr input[type=checkbox]': 'baseCheckboxs'
        '#priceTab thead tr input[type=checkbox]': 'priceAllCheckboxs'
        '#priceTab tbody tr input[type=checkbox]': 'priceCheckboxs'
        '#deleteBtn': 'deleteBtn'
        '#compareBtn': 'compareBtn'

    tabList:
        "baseTab":
            "checkData":"isBaseCacheValid"
            "preRender":"basePreRender"
            "fetch":"baseFetch"
            "render": "baseRender"
            "autoFresh":  "startBaseRefreshTimer"
        "priceTab":
            "checkData":"isPriceCacheValid"
            "preRender":"pricePreRender"
            "fetch":"priceFetch"
            "render": "priceRender"

    constructor: ->
        super
        @initTagList()
        @tophalf.html(window.Tmpls.selectionPanel())
        @setCurTag()
        @bind("refresh",@fetchData)
        @["ystock"] = new App.YahooStock
        @ystock.bind('fetchLastFinished', @fetchLastFinished)
        @ystock.bind('fetchQuotesFinished', @fetchQuotesFinished)
        @refreshElements()


    setCurTag: (tag)->
        if not tag
            records = App.TagList.all()
            if records.length>0
                tag = records[0].name
        if tag and @curTag isnt tag
            @curTag = tag
            @tagLabel.text(@curTag)
            return true
        else
            return false

    getCurTag: ()->
        if not @curTag
            @setCurTag()
        @curTag

    deChangeTag: (e)=>
        name = $(e.target).data("name")
        if @setCurTag(name)
            @clearAllCache()
            @resetCheckbox()
            @refresh()

    resetTagList: ()->
        @clearPageMenu()
        @preparePageMenu()
        @loadPageMenu()


    loadPageMenu: ->
        super
        @registerPageMenuEvent @deChangeTag

    activate: (args...)->
        #must before super, then super will reset the page menu
        @preparePageMenu()
        super
        #@registerPageMenuEvent(@deChangeTag)
        @clearAllCache()
        @refresh()

    deactivate: ->
        super
        @clearAllTimer()

    preparePageMenu: ->
        records = App.TagList.all()
        @pageMenuItems = []
        for record in records
            @pageMenuItems.push({name:record.name, text:record.name})

    initTagList: ->
        App.TagList.fetch()
        App.TagList.create(App.TagList.default) if App.TagList.count() is 0

        App.StockList.fetch()

    isBaseCacheValid: ->
        return true if Phoniex.Cache.get(@cacheBaseKey)?
        false

    isPriceCacheValid: ->
        return true if Phoniex.Cache.get(@cachePriceKey)?
        false

    getBaseCache: ->
        Phoniex.Cache.get(@cacheBaseKey)

    getPriceCache: ->
        Phoniex.Cache.get(@cachePriceKey)

    setBaseCache: (data)->
        return if not data
        for item in data
            item["color"] = if item.price < item.preclose then "#468847" else "#FF0000"
            item["growth"] = ((item.price-item.preclose)*100/item.preclose).toFixed(2)

        Phoniex.Cache.set(@cacheBaseKey,data,@cacheBaseExpiredTime)

    setPriceCache: (data)->
        Phoniex.Cache.set(@cachePriceKey,data)

    clearBaseCache: ->
        Phoniex.Cache.clear(@cacheBaseKey)

    clearPriceCache: ->
        Phoniex.Cache.clear(@cachePriceKey)

    clearAllCache: ->
        @clearBaseCache()
        @clearPriceCache()

    getActiveTab: (e)->
        @$("li.active",@tabs).attr("data-value")

    resetCheckbox: ->
        @baseAllCheckboxs.attr("checked",false)
        @baseCheckboxs.attr("checked",false)
        @priceAllCheckboxs.attr("checked",false)
        @priceCheckboxs.attr("checked",false)

    deSwitchTab: (e)->
        @clearAllTimer()
        @refresh()


    fetchLastFinished: (result)=>
        if result.status is "succ" and @fetchTag is @curTag
            data=result.list
            @setBaseCache(data)
            @baseRender(data)

    fetchQuotesFinished: (result)=>
        if result.status is "succ" and @fetchTag is @curTag
            data=result.list
            @setPriceCache(data)
            @priceRender(data)

    startBaseRefreshTimer:->
        if @isActive() and @getActiveTab() is @baseTabID
            if not @baseRefreshTimer
                console.log("SeletionPage startBaseRefreshTimer")
                @baseRefreshTimer = @delay(@baseRefreshTimerCB,@cacheBaseExpiredTime)
            #@refresh()

    baseRefreshTimerCB:->
        if @isActive() and @getActiveTab() is @baseTabID
            console.log("SeletionPage baseRefreshTimerCB")
            @baseRefreshTimer = @delay(@baseRefreshTimerCB,@cacheBaseExpiredTime)
            @refresh()

    clearBaseRefreshTimer: ->
        if @baseRefreshTimer
            clearTimeout(@baseRefreshTimer)
        @baseRefreshTimer = null

    clearAllTimer: ->
        @clearBaseRefreshTimer()

    baseFetch: (fetchlist)->
        @ystock.fetchLast(fetchlist)

    priceFetch: (fetchlist)->
        @ystock.fetchQuotes(fetchlist)

    baseRender: (data)->
        data ?= @getBaseCache()
        result={}
        result["list"] = data
        @baseTable.html(window.Tmpls.selectionBaseTable(result))
        @refreshElements()

    priceRender: (data)->
        data ?= @getPriceCache()
        result={}
        result["list"] = data
        @priceTable.html(window.Tmpls.selectionPriceTable(result))
        @refreshElements()

    basePreRender: (stockList)->
        data={}
        data["list"]=({"id":record,name:App.StockDict.list[record][1]} for record in stockList)
        @baseTable.html(window.Tmpls.selectionBasePreTable(data))
        @refreshElements()

    pricePreRender: (stockList)->
        data={}
        data["list"]=({"id":record,name:App.StockDict.list[record][1]} for record in stockList)
        @priceTable.html(window.Tmpls.selectionPricePreTable(data))
        @refreshElements()

    renderEmptyList: ->
        @baseTable.html("")
        @priceTable.html("")
        @resetCompareBtn([])
        @resetDeleteBtn([])
        @refreshElements()

    refreshAll: (options)->
        if options?.resetCurTag
            @setCurTag(App.TagList.first().name)
        if options?.resetTagList
            @resetTagList()
        @resetCheckbox()
        @refresh()

    resetCompareBtn: (list) ->
        list ?= App.StockList.select (record)=>record.tag is @curTag

        if list.length > 1
            @compareBtn.removeAttr("disabled")
        else
            @compareBtn.attr("disabled","disabled")



    resetDeleteBtn: (list) ->
        list ?= App.StockList.select (record)=>record.tag is @curTag

        if list.length > 0
            @deleteBtn.text("删除")
        else
            if @curTag is App.TagList.default.name
                @deleteBtn.attr("disabled","disabled")
            else
                @deleteBtn.removeAttr("disabled")
            @deleteBtn.text("删除标签")


    fetchData:  =>
        return if not @curTag
        list = App.StockList.select (record)=>record.tag is @curTag
        if list.length is 0
            @renderEmptyList()
        else
            @resetCompareBtn(list)
            @resetDeleteBtn(list)
            funcList = @tabList[@getActiveTab()]

            if(@[funcList.checkData].call(this))
                renderFunc = @[funcList.render]
                renderFunc?.call(this)
            else
                fetchlist = (record.stock for record in list)

                preRenderFunc = @[funcList.preRender]
                preRenderFunc?.call(this,fetchlist)

                fetchFunc = @[funcList.fetch]
                fetchFunc?.call(this,fetchlist)
                @fetchTag = @curTag
            autoFresh = @[funcList.autoFresh]
            autoFresh?.call(this)

    deGotoStockPage: (e)=>
        node = $(e.target)
        if node.is("a")
            node = node.parent()
        stockID = node.attr("data-value")
        @triggerPageEvent("query",stockID)
        return false


    deCheckAllBase: (e) ->
        node = $(e.target)
        @baseCheckboxs.attr("checked",node.is(':checked'))
        return false

    deCheckAllPrice: (e) ->
        node = $(e.target)
        @priceCheckboxs.attr("checked",node.is(':checked'))
        return false

    deDelete: (e)->
        e.preventDefault()
        if @getActiveTab() is @baseTabID
            checkbox = @baseCheckboxs
        else
            checkbox = @priceCheckboxs
        list = []
        checkbox.each (index,target)=>
            me = $(target)
            if me.is(':checked')
                value=me.parent().next().attr("data-value")
                records =App.StockList.select (item)=>
                    item["stock"] is value and item["tag"] is @curTag
                list.push(records[0]) if records.length > 0
        if list.length > 0
            Phoniex.Util.openComfirmModal(
                        @
                        {header:"Warning",body:"确定删除?"}
                        =>
                            record.destroy() for record in list
                            @refreshAll()
            )

        else
            list = App.StockList.select (record)=>record.tag is @curTag
            if list.length is 0 and @stockLabel isnt App.TagList.default.name
                tag = App.TagList.findByAttribute("name",@curTag)
                tag.destroy() if tag
                @refreshAll({"resetCurTag":true,"resetTagList":true})
        return false

    deCompare: (e)->
        e.preventDefault()
        if @getActiveTab() is @baseTabID
            checkbox = @baseCheckboxs
        else
            checkbox = @priceCheckboxs
        list = []
        checkbox.each (index,target)=>
            me = $(target)
            if me.is(':checked')
                value=me.parent().next().attr("data-value")
                list.push(value)
        if list.length > 1
            #options={"compare":list}
            @triggerPageEvent("compare",list)
        @resetCheckbox()
        return false

App["SelectionPage"]    = SelectionPage