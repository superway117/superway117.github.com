
$ = Spine.$

class MainController extends Phoniex.MainMenuPageStack

    default:    "stock"

    controllers:
        stock: App.StockPage
        selection: App.SelectionPage
        index: App.IndexPage
        #reader: App.ReaderPage
        #weibo: App.WeiboPage


    elements:
        'div[data-role=header] form input[type=text]' : 'searchText'

    events:
        'submit div[data-role=header] form': 'deFetchStock'
        'focus div[data-role=header] form input[type=text]': 'deClearSearch'


    constructor: ->
        super
        @initDB()
        @searchText.typeahead(
            {source:@searchTypeAhead,matcher: -> return true})
        @stock.active()
        if not Phoniex.Env.getConnected()
        	alert("请确定网络已经连接!")


    loadFromTemplate: ->
        super
        @header.html(window.Tmpls.toolbarHeader())
        @mainMenu = @$("ul[data-role=mainmenu]")
        @refreshElements()

    initFavList: ->
        App.FavList.fetch()
        if App.FavList.count() is 0
            for item in App.FavList.default
                App.FavList.create(item)

    initTagList: ->
        App.TagList.fetch()
        App.TagList.create(App.TagList.default) if App.TagList.count() is 0

    initStockList: ->
        App.StockList.fetch()

    initDB: ->
        @initFavList()
        @initTagList()
        @initStockList()


    searchTypeAhead: (val,func)=>
        list = App.StockDict.query(val)
        (item.join(",") for item in list)

    deClearSearch: (e) ->
        $(e.target).val("")

    deFetchStock: (e) ->
        e.preventDefault()
        value = @searchText.val()[0..5]
        return false if not App.Util.isValidStockID(value)
        #if @setStock value
        #    @refreshPage()

        @stock.setStock value
        @stock.active()
        return false

App["MainController"]    = MainController

