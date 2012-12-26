$ = Spine.$

class Util
    @toString:   Object.prototype.toString

    @isString:  (obj) ->
        @toString.call(obj) is '[object String]'

    @isValidStockID: (stockID) ->
        return false if isNaN(stockID)
        return false if stockID.length != 6 
        return true

    @getNowDateString: () ->
        now = new Date();
        "#{now.getMonth()+1}-#{now.getDate()}-#{now.getFullYear()}"


    @getDaysBeforeString: (days) ->
        now = new Date();
        date = new Date(now.getTime()-days*1000*60*60*24)
        "#{date.getMonth()+1}-#{date.getDate()}-#{date.getFullYear()}"

    @getDaysBeforeDate: (days) ->
        now = new Date();
        new Date(now.getTime()-days*1000*60*60*24)
        
    #(@page,{header:"Warning",body:"结束日期必须大于起始日期"})
    @openPromptInfo: (page,data) ->
        page.el.append($("#promptInfoModalTmpl").tmpl(data))
        page.$("#promptInfoModal").modal()
        page.$("#promptInfoModal").modal('show')

    @closePromptInfo: (page) ->
        page.$("#promptInfoModal").modal('hide')
        page.$("#promptInfoModal").remove()

    @openComfirmModal: (page,data,callback1,callback2) ->
        page.el.append($("#comfirmModalTmpl").tmpl(data))
        page.$("#comfirmModal").modal()
        page.$("#comfirmModal").modal('show')
        page.$("#comfirmModal button.btn-primary").click => 
            callback1?()
            @closeComfirmModal(page)
            return false
        page.$("#comfirmModal button").click => 
            callback2?()
            @closeComfirmModal(page)
            return false

    @closeComfirmModal: (page) ->
        page.$("#comfirmModal").modal('hide')
        page.$("#comfirmModal").remove()


    @openAlert: (container,options) ->
        container.append($("#alertTmpl").tmpl(options))
        alert = $(".alert",container)
        alert.addClass(options.type)  if options.type
        alert.show()
        setTimeout(
            -> 
                alert.remove()
                return false
            1000
        )

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

    
window.Stock["Util"]    = Util