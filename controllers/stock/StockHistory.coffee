
$ = Spine.$

class StockHistory extends Stock.MixedPanel
      
    tmplId: "stockHistoryTmpl"
    tableTmplId: "stockHistoryTableTmpl"

    events:
       'submit form': 'deFetchHistory'

    elements:
        'table tbody' : 'table'
        '#startDate' : 'startDate'
        '#endDate' : 'endDate'

    headerMenuItem: {name:"history",text:"历史信息"}
      

    constructor: ->
        super

        @["ystock"] = new Stock.YahooStock
        @ystock.bind('fetchHistoryFinished', @fetchFinished)
        #@el.html($("##{@tmplId}").html())
        #@refreshElements()
        
    fetchFinished: (result)=>
        if result.status is "succ"
            data=result.list
            @trigger("dataReady",data)

    render: (data) ->
        @table.html($("##{@tableTmplId}").tmpl(data))

    fetchData: (options) =>
        days7 = Stock.Util.getDaysBeforeDate(7)
        data = 
            {
                stockID:    @page.stockID
                startY:     days7.getFullYear()
                startM:     days7.getMonth()
                startD:     days7.getDate()
            }
        $.extend(data,options)
        @ystock.fetchHistory(data)

    deFetchHistory: (e) ->
        e.preventDefault()
        start=@startDate.val().split("-")
        end=@endDate.val().split("-")
        if(new Date(start[2], start[0], start[1]) > new Date(end[2], end[0], end[1]))
            Stock.Util.openPromptInfo(@page,
                {header:"Warning",body:"结束日期必须大于起始日期"})
            return false
        options=
            {
                startY:     start[2]
                startM:     (+start[0])-1
                startD:     start[1]
                endY:       end[2]
                endM:       (+end[0])-1
                endD:       end[1]
            }
        @trigger("refresh",options)

    activate: ->
        super
        
        now_str = Stock.Util.getNowDateString()
        @endDate.datepicker('setValue', now_str)
        @endDate.val(now_str)
        @endDate.attr('data-date', now_str)

        days7 = Stock.Util.getDaysBeforeString(7)
        @startDate.datepicker("setValue",days7)
        @startDate.val(days7)
        @startDate.attr('data-date', days7)

        @startDate.datepicker()
        @endDate.datepicker()

    canonicalDate:(str) ->
        return str.slice(1) if str.length is 2 and str.charAt(0) is '0'
        str
window.Stock["StockHistory"]    = StockHistory
    
