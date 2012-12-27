
$ = Spine.$


class StockPage extends Stock.StockBasePage

    default:        "info"
    #tmplId:         'pageTmpl'
    footerMenuItem: {name:"stock",text:"个股"}

    stockID:        "000001.SS"  #default value
    homeID:         "000001.SS"


    controllers:
        info: Stock.StockInfo
        tech: Stock.StockTech
        history: Stock.StockHistory

    constructor: ->
        super

        #register page event to pagestack
        @registerPageEvent "getinfo",(stockID)=>
            @stockID=stockID
            @slientActive(@info)
            true
       
        @registerPageEvent "compare",(compares)=>
            return false if not compares or compares.length<1
            @slientActive(@tech)
            @stockID=compares.pop()
            true
         
    setStock: (stock) ->
        @stockID=stock
        @refresh()

    deQuickBarClick: (e)->
        node = $(e.target)
        stock = node.attr("name")
        @setStock stock if stock
  
        return false
            
    deFetchStock: (e) ->
        value = @searchText.val()[0..5]
        return false if not Stock.Util.isValidStockID(value)
        @setStock value
        e.preventDefault()
        return false

    deGoHome: (e) ->
        @setStock @homeID
  
        return false


window.Stock["StockPage"]    = StockPage