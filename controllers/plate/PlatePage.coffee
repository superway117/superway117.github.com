
$ = Spine.$

class PlatePanel extends Stock.MixedPanel
      
    tmplId: "plateTmpl"
    generalTableTmplId: "plateGeneralTableTmpl"
    baseTableTmplId: "plateBaseTableTmpl"
    stockLabel: null
    timerStart: false
    events:
        "shown a[data-toggle='tab']": "deSwitchTab"
        "click div.tab-content tbody td:nth-child(2)" : "deGotoInfoPage"
        "change #generalTab thead input[type=checkbox]" : "deCheckAllGeneral"
        "change #baseTab thead input[type=checkbox]" : "deCheckAllBase"
        "click #deleteBtn" : "deDelete"
        "click #compareBtn" : "deCompare"
        
    #dy part generalCheckboxs baseCheckboxs
    elements:
        'ui.nav-tabs'   : 'tabs'
        '#tagLabel'   : 'tagLabel'
        '#generalTab tbody'   : 'generalTable'
        '#baseTab tbody'        : 'baseTable'
        '#generalTab thead tr input[type=checkbox]': 'generalAllCheckboxs'
        '#generalTab tbody tr input[type=checkbox]': 'generalCheckboxs'
        '#baseTab tbody thead input[type=checkbox]': 'baseAllCheckboxs'
        '#baseTab tbody tr input[type=checkbox]': 'baseCheckboxs'
        '#deleteBtn': 'deleteBtn'
        '#compareBtn': 'compareBtn'

    tabList: 
        "generalTab": "generalFetch"
        "baseTab": "baseFetch"

    getActiveTab: (e)->
        @$("li.active",@tabs).attr("data-value")

    setLabel: (stockLabel)->
        @stockLabel = stockLabel
        @tagLabel.text(stockLabel)
        

    constructor: ->
        super

        @["ystock"] = new Stock.YahooStock
        @ystock.bind('fetchLastFinished', @fetchLastFinished)
        @ystock.bind('fetchQuotesFinished', @fetchQuotesFinished)
        
    startRefreshTimer:->
        if @isActive() and @getActiveTab() is "generalTab"
            @delay(@startRefreshTimer,60000) 
            @refresh()
            
    activate: ->
        super
        @startRefreshTimer()

    resetCheckbox: ->
        @generalAllCheckboxs.attr("checked",false)
        @baseAllCheckboxs.attr("checked",false)
    primitiveRefresh: (options)->
        if options?.resetLabel
            @setLabel(Stock.TagList.first().name)
        if options?.resetHeader
            @page.updateHeaderMenu()
        @resetCheckbox()
        @refresh()

    deSwitchTab: (e)->
        @refresh()

    fetchLastFinished: (result)=>
        if result.status is "succ"
            data=result.list
            @generalRender(data)
            

    fetchQuotesFinished: (result)=>
        if result.status is "succ"
            data=result.list
            @baseRender(data)
            
            

    generalFetch: (fetchlist)->
        @ystock.fetchLast(fetchlist)

    baseFetch: (fetchlist)->
        @ystock.fetchQuotes(fetchlist)

    generalRender: (data)->
        @generalTable.html($("##{@generalTableTmplId}").tmpl(data))
        if data
            if data.price < data.preclose
                color="#468847"
            else
                color="#FF0000"
        @$("#generalTab .price").css("color",color) if color
        @refreshElements()

    baseRender: (data)->
        @baseTable.html($("##{@baseTableTmplId}").tmpl(data))
        @refreshElements()

    fetchData:  =>
        list = Stock.StockList.select (record)=>record.tag is @stockLabel 
        if list.length is 0
            @generalTable.html("")
            @baseTable.html("")
            @deleteBtn.text("删除Label")
            if @stockLabel is Stock.TagList.default.name
                @deleteBtn.attr("disabled","disabled")
            else
                @deleteBtn.removeAttr("disabled")
            @compareBtn.attr("disabled","disabled")
            @refreshElements()
        else
            @deleteBtn.removeAttr("disabled")
            @compareBtn.removeAttr("disabled")
            @deleteBtn.text("删除")
            fetchlist = (record.stock for record in list)
            activeTab = @getActiveTab()
            func = @tabList[activeTab]
            @[func](fetchlist) if @[func]


    deGotoInfoPage: (e)=>
        node = $(e.target)
        if node.is("a")
            node = node.parent()
        stockID = node.attr("data-value")
        @page.triggerPageEvent("getinfo",stockID)
        return false


    deCheckAllGeneral: (e) ->
        node = $(e.target)
        @generalCheckboxs.attr("checked",node.is(':checked'))
        return false

    deCheckAllBase: (e) ->
        node = $(e.target)
        @baseCheckboxs.attr("checked",node.is(':checked'))
        return false

    deDelete: (e)->
        if @getActiveTab() is "generalTab"
            checkbox = @generalCheckboxs
        else
            checkbox = @baseCheckboxs
        list = []
        checkbox.each (index,target)=>
            me = $(target)
            if me.is(':checked')
                value=me.parent().next().attr("data-value")
                records =Stock.StockList.select (item)=> 
                    item["stock"] is value and item["tag"] is @stockLabel
                list.push(records[0])
        if list.length > 0
            Stock.Util.openComfirmModal(
                        @page
                        {header:"Warning",body:"确定删除?"}
                        => 
                            record.destroy() for record in list
                            @primitiveRefresh()
            )

        else 
            list = Stock.StockList.select (record)=>record.tag is @stockLabel 
            if list.length is 0 and @stockLabel isnt Stock.TagList.default.name
                tag = Stock.TagList.findByAttribute("name",@stockLabel)
                tag.destroy() if tag
                @primitiveRefresh({"resetLabel":true,"resetHeader":true})
        return false

    deCompare: (e)->
        if @getActiveTab() is "generalTab"
            checkbox = @generalCheckboxs
        else
            checkbox = @baseCheckboxs
        list = []
        checkbox.each (index,target)=>
            me = $(target)
            if me.is(':checked')
                value=me.parent().next().attr("data-value")
                list.push(value)
        if list.length > 1
            #options={"compare":list}
            @page.triggerPageEvent("compare",list)
            @resetCheckbox()
            
        return false

class PlatePage extends Stock.StockBasePage

    default:        "plate"
    footerMenuItem: {name:"plate",text:"板块"}

    controllers:
        plate: PlatePanel

    constructor: ->
        super
        Stock.TagList.fetch()
        Stock.StockList.fetch()
        Stock.TagList.create(Stock.TagList.default) if Stock.TagList.count() is 0 
        @plate.setLabel(Stock.TagList.first().name)

    activate: ->
        super
        @updateHeaderMenu()

    updateHeaderMenu: ->
        @clearHeaderMenu()
        for tag in Stock.TagList.all()
            tag=tag.attributes()
            data={name:tag.name,text:tag.name}
            @appendHeaderMenu(data)
            
        $("a",@headerDropMenu).click (e)=>
                node = $(e.target)
                @setLabel(node.attr("name"))

    setLabel: (stockLabel)->
        @plate.setLabel(stockLabel)
        @plate.refresh()

    deQuickBarClick: (e)->
        node = $(e.target)
        stock = node.attr("name")
        return false if not Stock.Util.isValidStockID(stock)
        @triggerPageEvent("getinfo",stock) if stock
        return false

    deFetchStock: (e) ->
        stock = @searchText.val()[0..5]
        return false if not Stock.Util.isValidStockID(stock)
        @triggerPageEvent("getinfo",stock)
        return false

    deGoHome: (e) ->
        @triggerPageEvent("getinfo","000001.SS") 
        return false

window.Stock["PlatePage"]    = PlatePage