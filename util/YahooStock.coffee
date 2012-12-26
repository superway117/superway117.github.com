$ = Spine.$

class YahooStock extends Spine.Module
    @include Spine.Events
    debug: false
    urlBase:    null
    @techParams: 
        {
            "size": 
                {
                    "command": "z",
                    "values" : 
                        {
                            "large" :  "l",
                            "middle" : "m"
                        }
                }
            "type": 
                {
                    "command": "q",
                    "values" : 
                        {
                            "line" :  "l",  #default
                            "candle" : "c"
                            "bar" : "b"
                        }
                }
            "scale": 
                {
                    "command": "1",
                    "values" : 
                        {
                            "log " :  "on",  #default
                            "linear" : "off"
                        }
                }
            "range": 
                {
                    "command": "t",
                    "values" : 
                        {
                            "1d" :  "1d",
                            "5d" :  "5d",
                            "1m" :  "1m",
                            "3m" :  "3m",
                            "6m" :  "6m",
                            "1y" :  "1y",
                            "2y" :  "2y",
                            "5y" :  "5y",
                            "max" : "my"
                        }
                }
            "indicator": 
                {
                    "command": "a",
                    "values" : 
                        {
                            roc :  "p12",
                            macd : "m26-12-9",
                            mfi : "f14"
                            ss: "ss" #Slow Stoch 
                            rsi: "r14"
                            fs: "fs" #Fast Stoch
                            vol: "v" #Fast Stoch
                            volma: "vm" #Vol+MA 
                            wr: "w14" #W%R
                        }
                }
            "compare": {"command": "c"},

        }

    @fetchTodayChart: (stockID="000001.SS",size="b") ->
        stockID = @canonical(stockID)
        random = Math.random()
        return "http://ichart.yahoo.com/#{size}?s=#{stockID}&dummy=#{random}"

    @fetchSmallChart: (stockID="000001.SS") ->
        return @fetchTodayChart(stockID,"t")

    @fetchLargeChart: (stockID="000001.SS") ->
        return @fetchTodayChart(stockID,"b")

    @fetchTechChart: (stockID="000001.SS",options) ->
        stockID = @canonical(stockID)
        url="http://chart.finance.yahoo.com/z?s=#{stockID}&lang=en-US&region=US"
        if not options
            return url
        if options.compare
            compare=""
            if $.isArray options.compare
                list = (@canonical(v) for v,k in options.compare).join(",")
                url += "&#{@techParams.compare.command}=#{list}"
            else
                url += "&#{@techParams.compare.command}=#{@canonical options.compare}" 

        delete options.compare

        for command,params of options
            if fullParam=@techParams[command]
                url += "&" + fullParam.command + "=";
                list = params.split(",")
                for param in list
                    if value=fullParam.values[param]
                        last = url.charAt url.length-1
                        if last is ',' or last is '=' then url += value else url += ("," + value)

        return url

#privte
    @canonical: (stockID) ->
        if stockID.lastIndexOf('.') is  -1
            if( stockID.charAt(0) is '6')
                return stockID += ".SS";
            else
                return stockID += ".SZ";
        return stockID;

    constructor: ->
        super
        @bind('fetchHistory', @fetchHistoryImpl)
        @bind('fetchQuotes', @fetchQuotesImpl)
        @bind('fetchLast', @fetchLastImpl)
        if @debug
            @urlBase = "http://127.0.0.1:8080/stock?api="
        else
            @urlBase = "http://107.22.188.63:8080/stock?api="

    fetchHistory: (options) ->
        @trigger('fetchHistory', options)

    fetchHistoryImpl: (options) ->
        stockID=YahooStock.canonical(options.stockID)
        url="#{@urlBase}gethistory&callback=?&s=#{stockID}&a=#{options.startM}&b=#{options.startD}&c=#{options.startY}" 
        if options.endY
            url+="&d=#{options.endM}&e=#{options.endD}&f=#{options.endY}" 
        $.getJSON url, (data) =>
            @fetchHistoryCallback(data)

    fetchHistoryCallback: (data) =>
        @trigger('fetchHistoryFinished', data)

    fetchQuotes: (stockList) ->
        @trigger('fetchQuotes', stockList)

    fetchQuotesImpl: (stockList) ->
        list=(@constructor.canonical(stock) for stock in stockList)
        str = list.join("+")
        url="#{@urlBase}getquotes&callback=?&s=#{str}"
        $.getJSON url, (data) =>
            @fetchQuotesCallback(data)

    fetchQuotesCallback: (data) =>
        @trigger('fetchQuotesFinished', data)

    fetchLast: (stockList) ->
        @trigger('fetchLast', stockList)

    fetchLastImpl: (stockList) ->
        list=(@constructor.canonical(stock) for stock in stockList)
        str = list.join("+")
        url="#{@urlBase}getlast&callback=?&s=#{str}"
        $.getJSON url, (data) =>
            @fetchLastCallback(data)

    fetchLastCallback: (data) =>
        @trigger('fetchLastFinished', data)
window.Stock["YahooStock"]    = YahooStock