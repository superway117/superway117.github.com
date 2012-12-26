
$ = Spine.$

class TechSetting extends Spine.Model
    @configure "TechSetting", 
                "range","type","scale","size","ema","indicator","overlay"
  
    @extend Spine.Model.Local
    @default: 
        {
            range: "1m" #1d 5d 1m 3m 6m 1y 2y 5y max
            type: "line" #  Bar | Line | Candle
            scale: "log" #Linear | Log
            size: "middle"   #middle | large
            moving: ""  #5 | 10 | 20 | 50 | 100 | 200
            ema: "" #5 | 10 | 20 | 50 | 100 | 200
            #MACD | MFI | ROC | RSI | Slow Stoch | 
            #Fast Stoch | Vol | Vol+MA | W%R
            indicator: "" 
            #Bollinger Bands | Parabolic SAR | Splits | Volume
            #
            overlay: "" 
        }



class StockTech extends Stock.StaticPanel

    tmplId: "stockTechTmpl"
    headerMenuItem: {name:"tech",text:"技术指标"}
    events:
        'click button[type=button]': 'deTapButton'
        'change form.form-inline select': 'deSelectIndicator'
        'submit form.form-inline': 'deCompare'
        'focus form.form-inline input[type=text]': 'deClearCompare'

    elements:
        'form.form-inline input[type=text]' : 'compareText'

    constructor: ->
        super
        TechSetting.bind("refresh", @meSettingRefresh)
        TechSetting.bind("change", @render)
        TechSetting.fetch()
        @compareText.typeahead(
            {source:@compareTypeAhead,matcher: -> return true})

    compareTypeAhead: (val,func)=>
        list = Stock.StockDict.query(val)
        (item.join(",") for item in list)

    deClearCompare: (e) ->
        $(e.target).val("")

    render: (compares)=>
        option = TechSetting.first().attributes() or TechSetting.default
        if compares 
            if Stock.Util.isString(compares)
                option["compare"]=compares
            else
                list = compares[0]
                option["compare"]=list

        url=Stock.YahooStock.fetchTechChart(@page.stockID,option)
        @$("#techChart").attr("src",url)

    meSettingRefresh: =>
        setting = TechSetting.first()
        TechSetting.create(TechSetting.default) if not setting

    activate: ->
        super
        @$("#otherTech").collapse()
        @refreshButtonState()

    refreshButtonState: ->
        option = TechSetting.first().attributes() or TechSetting.default
        for command,value of option
            if(value isnt "")
                @$("button[data-command=#{command}][data-value=#{value}]").button('toggle')


    deTapButton: (e)->
        setting = TechSetting.first()
        node = $(e.target)
        command=node.attr("data-command")
        value=node.attr("data-value")
        if(setting[command] is value) then setting[command]="" else setting[command]=value
        setting.save()

    deSelectIndicator: (e)->
        setting = TechSetting.first()
        value = $(e.target).val()
        if value isnt ""
            setting["indicator"]=value
            setting.save()


    deCompare: (e)->
        value = @compareText.val()[0..5]
        return false if not Stock.Util.isValidStockID(value)
        @trigger("refresh",value)


window.Stock["StockTech"]    = StockTech
    
