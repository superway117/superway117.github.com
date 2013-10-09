$ = Spine.$

class Util

    @isValidStockID: (stockID) ->
        if stockID.length is 6
            return true if not isNaN(stockID)
        else if stockID.length is 9
            return false if stockID.indexOf(".") < 0
            return true
        return false

    @openStockInputModal: (page,callback1,callback2) ->
        page.el.append($("#stockInputModalTmpl").tmpl())
        modal = page.$("#stockInputModal")
        text = page.$("#stockInputModal input[type=text]")
        text.typeahead(
            source:(val,func)->
                list = Stock.StockDict.query(val)
                (item.join(",") for item in list)
            matcher: -> return true
        )
        modal.modal()
        modal.modal('show')
        page.$("#stockInputModal button.btn-primary").click =>
            if text.val()
                callback1?(text.val())
                @closeStockInputModal(page)
            return false
        page.$("#stockInputModal button").click =>
            callback2?()
            @closeStockInputModal(page)
            return false

    @closeStockInputModal: (page) ->
        modal = page.$("#stockInputModal")
        modal.modal('hide')
        modal.remove()

App["Util"]    = Util