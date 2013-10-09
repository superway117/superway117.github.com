$ = Spine.$

class GoogStock extends Spine.Module
	@include Spine.Events

	#privte
	@canonical: (stockID) ->
		return stockID if stockID.lastIndexOf(':') isnt -1
		return if stockID.length < 6
		id = stockID[0..5]
		if stockID.lastIndexOf('.') isnt -1 and stockID.length is 9
			site=(stockID[7..8]).toLowerCase()
			if site is "ss"
				prefix = "SHA:"
			else
				prefix = "SHE:"

		else
			if stockID.charAt(0) is '6' then prefix = "SHA:" else prefix = "SHE:"
		"#{prefix}#{id}"

	fetchStock: (stockID) ->
		stockID=@constructor.canonical(stockID)
		cnUrlTemplete="http://www.google.cn/finance/info?q=#{stockID}&infotype=infoquoteall&oe=gb2312&callback=?"
		$.getJSON(cnUrlTemplete, (data) =>
			@fetchStockCallback(data)
	 	)

	###
	[ { "id": "7521596" ,"t" : "000001" ,"e" : "SHA" ,
	"l" : "2,105.62" ,"l_cur" : "￥2,105.62" ,
	"s": "0" ,"ltt":"15:01" ,"lt" : "10月17日 15:01" ,
	"c" : "+6.81" ,"cp" : "0.32" ,"ccol" : "chr" ,
	"eo" : "" ,"delay": "" ,"op" : "2,104.28" ,"hi" : "2,113.16" ,
	"lo" : "2,088.04" ,"vo" : "5987.41万" ,"avvo" : "" ,
	"hi52" : "3,478.01" ,"lo52" : "1,844.09" ,"mc" : "" ,
	"pe" : "" ,"fwpe" : "" ,"beta" : "" ,"eps" : "" ,
	"shares" : "" ,"inst_own" : "" ,"name" : "上证综合指数" ,
	"lname" : "上证指数" ,"type" : "Company" } ]
	###
	fetchStockCallback: (data) =>

		result={}
		result.status = "fail"
		if data.length>0
			result.status = "succ"
			result.list=data;
		@trigger('fetchFinished', result)

	fetchRss: (feedurl) ->
		baseUrl = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q="
		feedurl = encodeURIComponent(feedurl)
		url = "#{baseUrl}#{feedurl}&num=20&output=json_xml"
		#url = encodeURIComponent(url)
		$.getJSON(url, (data) =>
			@fetchNewsCallback(data)
	 	)

	fetchNews: (stockID) ->
		baseUrl = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q="
		feedurl = @getFeedUrl(stockID)
		url = "#{baseUrl}#{feedurl}&num=10&output=json_xml"
		$.getJSON(url, (data) =>
			@fetchNewsCallback(data)
	 	)

	getFeedUrl: (stockID) ->
		stockID=@constructor.canonical(stockID)
		encodeURIComponent("http://www.google.com.hk/finance/company_news?q=#{stockID}&ei=M6jdUKCeKoq0kQWH-wE&gl=cn&output=rss")
		#encodeURIComponent("http://www.google.com.hk/finance/company_news?q=#{stockID}&gl=cn&output=rss")

	fetchNewsCallback: (result) =>
		if result.responseStatus is 200
			result["status"] = "succ"
		else
			result["status"] = "fail"
		@trigger('fetchNewsFinished', result)

App["GoogStock"]    = GoogStock