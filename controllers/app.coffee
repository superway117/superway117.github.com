
$ = Spine.$

class MainController extends Stock.PageStack

    className: 'main'

    default: "stock"
    
    controllers:
        stock: Stock.StockPage
        plate: Stock.PlatePage

window.Stock["MainController"]    = MainController

$ ->
    new Stock.MainController(el: $("body"))