
$ = Spine.$

class StockInfo extends Stock.MixedPanel
      
    tmplId: "stockInfoTmpl"
    dataTmplId: "stockInfoDataTmpl"

    headerMenuItem: {name:"info",text:"基本信息"}
      
    events:
       'click .form-inline button.stock-add-btn': 'deOpenAddStockModal'
       'click #addTagButton': 'deAddTag'
       'click #addStockButton': 'deAddStock'

    elements:
        'div[data-role=panel-data]' : 'panelData'
        '.modal-body select' : 'tagSelects'
        '.modal-body input[type=text]' : 'newTagText'
        '.modal-body form' : 'addStockForm'
        '.form-inline button.stock-add-btn' : "openAddModalButton"
    constructor: ->
        super
        
        @["gstock"] = new Stock.GoogStock
        @gstock.bind('fetchFinished', @fetchFinished)
        
    fetchFinished: (result)=>
        if result.status is "succ"
            data=result.list[0]
            data.chart=Stock.YahooStock.fetchLargeChart(@page.stockID)
            @trigger("dataReady",data)

    render: (data) ->
        @panelData.html($("##{@dataTmplId}").tmpl(data))

        if data
            if data.c.charAt(0) is '-'
                color="#468847"
            else if data.c.charAt(0) is '+'
                color="#FF0000"
            @$("#updownCell").css("color",color) if color
        if @page.stockID is @page.homeID
            @$(".form-inline button.stock-add-btn").attr('disabled','disabled')
        else
            @$(".form-inline button.stock-add-btn").removeAttr("disabled")


    fetchData: (args...) =>
        @gstock.fetchStock @page.stockID

    activate: ->
        super
        @startRefreshTimer()

    startRefreshTimer:->
        if @isActive()
            @delay(@startRefreshTimer,60000) 
            @refresh()
        
    updateTagSelects: ->
        Stock.TagList.fetch()
        Stock.TagList.create(Stock.TagList.default) if Stock.TagList.count() is 0 
        records = Stock.TagList.all()
        @tagSelects.empty()
        for record in records
            data={name:record.name, text:record.name}
            @tagSelects.append($("#selectItemTmpl").tmpl(data))

    appendTagSelect: (name)->
        if Stock.TagList.findByAttribute("name",name)
            Stock.Util.openAlert(@addStockForm,
                {type:"alert-error",body:"Tag已经存在"})
        else
            data={name:name, text:name}
            Stock.TagList.create({name:name})
            @tagSelects.prepend($("#selectItemTmpl").tmpl(data))
            @tagSelects.get(0).selectedIndex =0

    deOpenAddStockModal: (e)->
        @updateTagSelects()
        
        $('#addStockModal').modal()
        e.preventDefault()
        return false

    deAddTag: (e)->
        name = @newTagText.val()
        if not name
            Stock.Util.openAlert(@addStockForm,
                {type:"alert-error",body:"名字不能为空"})
        else
            @appendTagSelect(name)
        e.preventDefault()
        return false

    deAddStock: (e)-> 
        tag=@tagSelects.val()

        item =Stock.StockList.select (item)=> 
                item["stock"] is @page.stockID and item["tag"] is tag
        if item.length > 0
            Stock.Util.openAlert(@addStockForm,
                {type:"alert-error",body:"股票已经存在"})
        else
            Stock.StockList.create({stock:@page.stockID,tag:tag})
            $('#addStockModal').modal('hide')
        e.preventDefault()
        return false


window.Stock["StockInfo"]    = StockInfo
    
