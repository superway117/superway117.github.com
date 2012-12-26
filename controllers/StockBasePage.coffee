
$ = Spine.$


class StockBasePage extends Stock.Page

    tmplId:         'pageTmpl'

    elements:
        'div[data-role=header] form input[type=text]' : 'searchText'

    events:
       'submit div[data-role=header] form': 'deFetchStock'
       'focus div[data-role=header] form input[type=text]': 'deClearSearch'
       'click div[data-role=header] a.brand': 'deGoHome'

    constructor: ->
        super

        Stock.FavList.bind("refresh", @meSettingRefresh)
        Stock.FavList.bind("update", @updateQuickBar)
        Stock.FavList.fetch()
        
        @searchText.typeahead(
            {source:@searchTypeAhead,matcher: -> return true})

    searchTypeAhead: (val,func)=>
        list = Stock.StockDict.query(val)
        (item.join(",") for item in list)
 
    meSettingRefresh: =>
        if Stock.FavList.count() is 0
            for item in Stock.FavList.default
                Stock.FavList.create(item)

        @updateQuickBar()
   

    updateQuickBar: =>
        @clearQuickBar()
        for stock in Stock.FavList.all()
            stock=stock.attributes()
            data={name:stock.stock,text:stock.firstLetter}
            @appendQuickBar(data)
        $("a",@quickBar).click (e)=>
            @deQuickBarClick(e)
        $("a",@quickBar).dblclick (e)=>
            stock = $(e.target).attr("name")
            Stock.Util.openStockInputModal(
                @
                (value)=>
                    record=Stock.FavList.findByAttribute("stock",stock)
                    record.stock = value[0..5]
                    record.firstLetter = value[7..8]
                    record.save()
                    
            )

    deClearSearch: (e) ->
        $(e.target).val("")

window.Stock["StockBasePage"]    = StockBasePage