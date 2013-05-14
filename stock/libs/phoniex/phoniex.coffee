
$ = Spine.$

class Env extends Spine.Module
    @env: {}
    @inited : false

    @sniff: ->
        #if not $.isEmptyObject(@env)
        if @inited
            return @env
        dua = navigator.userAgent
        dav = navigator.appVersion
        @env["air"] = dua.indexOf("AdobeAIR") >= 0
        @env["khtml"] = if dav.indexOf("Konqueror") >= 0 then parseFloat(dav) else undefined
        @env["webkit"] = parseFloat(dua.split("WebKit ")[1]) || undefined
        @env["chrome"] = parseFloat(dua.split("Chrome ")[1]) || undefined
        if dav.indexOf("Safari")>=0 && not @env[chrome]
            @env["safari"]=parseFloat(dav.split("Version/")[1])
        else
            @env["safari"] = undefined
        @env["mac"] = dua.indexOf("Macintosh") >= 0
        @env["quirks"] = document.compatMode is "BackCompat"
        @env["ios"] = /iPhone|iPod|iPad/.test(dua)
        @env["android"] = parseFloat(dua.split("Android ")[1]) || undefined
        @env["mobile"] = if @env.android or @env.ios then true else false
        @env["connected"] = false
        @env["deviceReady"] = false
        @env["phonegap"] = false
        console.log("userAgent="+dua)
        console.log("appVersion="+dav)
        console.log("Android v="+@env["android"]) if @env["android"]
        @env

    @isMobile: ->
        @env.mobile


    @getPhonegap: ()->
        @env["phonegap"]

    @setPhonegap: (phonegap)->
        @env["phonegap"] =phonegap

    ###
    1.if phonegap inside, when catch phonegap device ready event, it is true
    2.if not phonegap, it is true after startup
    ###
    @setDevicesReady: (detectedDevice)->
        @env["deviceReady"] = detectedDevice

    @getDevicesReady: ()->
        @env["deviceReady"]

    ###
    1.if phonegap inside, after phonegap device ready event, will detect the connect
      status
    2.if not phonegap, it is true after startup
    ###
    @setConnected: (connected)->
        @env["connected"] = connected

    @getConnected: ()->
        @env["connected"]

    @width: ->
        $(window).width()

    @height: ->
        $(window).height()

    @detechNetwork: ->
        connected = true
        if @getPhonegap and @getDevicesReady()
            networkState = navigator.network.connection.type
            console.log("connect type #{networkState}")
            if networkState is Connection.UNKNOWN or networkState is Connection.NONE
                connected =  false

        connected

    @startupApp: (callback)->
        @sniff()
        if @isMobile()
            document.addEventListener(
                'deviceready'
                ->
                    @setPhonegap(true)
                    @setDevicesReady(true)
                    @setConnected(@detechNetwork())
                    callback()
                false
            )

        else
            @setPhonegap(false)
            @setDevicesReady(true)
            @setConnected(true)
            $ ->
                callback()

class Util
    @toString:   Object.prototype.toString

    @isString:  (obj) ->
        @toString.call(obj) is '[object String]'

    @now: ->
        return (new Date).getTime()

    @getNowDateString: () ->
        now = new Date()
        "#{now.getMonth()+1}-#{now.getDate()}-#{now.getFullYear()}"


    @getDaysBeforeString: (days) ->
        now = new Date()
        date = new Date(now.getTime()-days*1000*60*60*24)
        "#{date.getMonth()+1}-#{date.getDate()}-#{date.getFullYear()}"

    @getDaysBeforeDate: (days) ->
        now = new Date()
        new Date(now.getTime()-days*1000*60*60*24)

    @getCurrentYear: (days) ->
        new Date().getFullYear()

    @getCurrentSeason: (days) ->
        month = new Date().getMonth()+1
        return Math.floor(month/4)+1

    @appendLoadingBar: (node) ->
        if $("img.loading",node).length <= 0
            node.append("<img src='./images/loading.gif' class='loading'>")

    @removeLoadingBar: (node) ->
        $("img.loading",node).remove()

    ###
    options: 1. type : a. "alert-error"
             2. body
             3. timeout
    ###
    @openAlert: (node,options) ->
        node.append(window.PhoniexTmpls.alert(options))
        alert = $(".alert",node)
        alert.addClass(options.type)  if options.type
        alert.show()
        options.timeout ?= 1000
        setTimeout(
            ->
                alert.remove()
                return false
            options.timeout
        )

    #(@,{header:"Warning",body:"结束日期必须大于起始日期"})
    @openPromptInfo: (controller,options) ->
        controller.el.append(window.PhoniexTmpls.infoModal(options))
        controller.$("#promptInfoModal").modal()
        controller.$("#promptInfoModal").modal('show')

    @closePromptInfo: (controller) ->
        controller.$("#promptInfoModal").modal('hide')
        controller.$("#promptInfoModal").remove()

    ###
    @
    {header:"Warning",body:"确定删除?"}
    =>
        record.destroy() for record in list
        @refreshAll()
    ###
    @openComfirmModal: (controller,options,callback1,callback2) ->
        controller.el.append(window.PhoniexTmpls.comfirmModal(options))
        controller.$("#comfirmModal").modal()
        controller.$("#comfirmModal").modal('show')
        controller.$("#comfirmModal button.btn-primary").click =>
            callback1?()
            @closeComfirmModal(controller)
            return false
        controller.$("#comfirmModal button").click =>
            callback2?()
            @closeComfirmModal(controller)
            return false

    @closeComfirmModal: (page) ->
        page.$("#comfirmModal").modal('hide')
        page.$("#comfirmModal").remove()


class Cache
    @data: {}
    @get: (key)->
        record = @data[key]
        if record
            if record.expire is 0 or record.expire >= Util.now()
                return record.value
            else
                delete @data[key]
        return null

    @set: (key,value, expire=0)->
        timeout = 0
        if isNaN(expire) and expire>0
            timeout = expire + Util.now()
        record = {value: value, expire: timeout}
        @data[key] = record

    @clear:(key)->
        if key then delete @data[key] else @data={}

class Stack extends Spine.Controller
    controllers: {}
    #containerSelect: null

    constructor: (options) ->
        super
        @loadFromTemplate?()

        if @containerSelect
            @["container"] = @$(@containerSelect)
        else
            @["container"] = @

        @manager = new Spine.Manager
        for key, value of @controllers
            @[key] = new value(stack: @)
            @add(@[key])

        @[@default].el.addClass("active") if @default

    add: (child) ->
        @manager.add(child)
        @container.append(child.el)

        @el

    getActive: ->
        for key,value of @controllers when @[key].isActive()
            con=@[key]
            break
        con or= @[@default]

    activate: (args...)->
        super
        @getActive()?.active(args...)

    slientActive: (current) ->
        for cont in @manager.controllers
            if cont is current
                cont.el.addClass('active')
            else
                cont.el.removeClass('active')

    refresh: (callbackOrParams) ->
        if typeof callbackOrParams is 'function'
            @bind('refresh', callbackOrParams)
        else
            @trigger('refresh', callbackOrParams)

    refreshMe: ->
        @refresh()
        @getActive()?.refresh()

    getNextSibling: ->
        index =-1
        return if @manager.controllers.length <=1
        index = i for cont,i in @manager.controllers when cont.isActive()
        return if index is -1
        if index >= @manager.controllers.length-1 then index = 0 else index++
        return @manager.controllers[index]

    getPrevSibling: ->
        index =-1
        return if @manager.controllers.length <=1
        index = i for cont,i in @manager.controllers when cont.isActive()
        return if index is -1
        if index is 0 then index = @manager.controllers.length-1 else index--
        return @manager.controllers[index]

class Page extends Stack

    #panels
    controllers: {}
    containerSelect: "div[data-role=panels]"
    # child can inherit this function to add own page struct
    #do not foget invoke super
    loadFromTemplate: ->
        @replace( window.PhoniexTmpls.page() )
        @refreshSkeleton()

    refreshSkeleton: ->
        @footer = @$("div[data-role=footer]")
        @content = @$("div[data-role=content]")
        #@panels = @$("div[data-role=panels]")

    registerPageEvent: (event,callback)->
        @stack.registerPageEvent(event,@,callback)

    triggerPageEvent: (args...)->
        @stack.trigger(args...)

class PageStack extends Stack

    containerSelect: "div[data-role=pagestack]"

    loadFromTemplate: ->
        @append( window.PhoniexTmpls.pagestack() )
        @refreshSkeleton()

    refreshSkeleton: ->
        @pages = @$("div[data-role=pagestack]")
        @header = @$("div[data-role=header]")


    registerPageEvent: (event,page,callback)->
        @bind event, (args...)=>
            if callback(args...)
                page.active(args...)


class HeaderLeftMenuPage extends Page

    #must implement by child
    mainMenuItem:     null
    loadFromTemplate: ->
        super
        #default template, canbe/should be set by child
        @contentTmpl ?= window.PhoniexTmpls.leftMenuContent()

        @content.append( @contentTmpl )
        @panels = @$("div[data-role=panels]")
        @tophalf = @$("div[data-role=tophalf]")
        @bottomhalf = @$("div[data-role=bottomhalf]")


        @pageMenu = @$("[data-role=pagemenu]")
        @loadPageMenuTemplate?()


    registerMenuEvent: (container, stack)->
        $("li a",container).click (e)=>
            name = $(e.target).data("name")
            stack[name].active()

class HeaderLeftAccordionMenuPage extends HeaderLeftMenuPage



    ###
    childpage can define pageMenuID and  pageMenuGroups to
    implement a accordion type page menu
    sample:
    pageMenuID:         "stockPageMenuID"
    pageMenuGroups : [
                    {menuGroupID: id,title: title},
                    {menuGroupID1: id,title: title1}]
    then each panel inside the page,need to define a page menu
    item, sample:
    menuItem: {menuGroupID: "stockRealTimeGroupID",name:"historydeal",text:"历史交易数据"}
    ###
    #pageMenuID:       null # its a string id
    #pageMenuGroups:   null

    constructor: (options) ->
        @contentTmpl=window.PhoniexTmpls.accordionLeftMenuContent(@pageMenuID)
        super
        #here is register page menu
        @registerPageMenuEvent()

    loadPageMenuTemplate: ->
        if @pageMenuGroups
            for group in @pageMenuGroups
                group["pageMenuID"]=@pageMenuID
                tmpl = window.PhoniexTmpls.pageMenuGroup(group)
                @pageMenu.append(tmpl)

    appendPageMenu: (panel)->
        item = panel.menuItem
        if item
            itemTmpl = window.PhoniexTmpls.menuItem(item)
            $("##{item.menuGroupID} ul",@pageMenu).append(itemTmpl)

    registerPageMenuEvent: ->
        @registerMenuEvent(@pageMenu,@)

    add: (panel) ->
        super(panel)
        @appendPageMenu(panel)

class HeaderSingleLeftMenuPage extends HeaderLeftMenuPage
    staticPageMenu:  false
    #static page menu item should define pageMenuItems
    loadPageMenuTemplate: ->
        if @staticPageMenu and @pageMenuItems
            @loadPageMenu()

    clearPageMenu: ->
        @pageMenu.empty()

    loadPageMenu: ->
        for item in @pageMenuItems
            tmpl = window.PhoniexTmpls.menuItem(item)
            @pageMenu.append(tmpl)


    activate: (args...)->
        super
        if not @staticPageMenu
            @clearPageMenu()
            @loadPageMenu()

    registerPageMenuEvent: ( callback )->
        $("li a",@pageMenu).click (e)=>
            callback(e)




class MainMenuPageStack extends PageStack
    constructor: (options) ->
        super
        @loadMainMenu()

    loadFromTemplate: ->
        super
        #@header.html(window.PhoniexTmpls.toolbarHeader())

    refreshSkeleton: ->
        super
        @mainMenu = @$("ul[data-role=mainmenu]")


    getMainMenu: ->
        (@[key].mainMenuItem for key, value of @controllers when @[key].mainMenuItem)

    registerMenuEvent: (container, stack)->
        $("li a",container).click (e)=>
            name = $(e.target).data("name")
            stack[name].active()

    loadMainMenu: ->
        @mainMenu.empty()
        for item in @getMainMenu()
            itemTmpl = window.PhoniexTmpls.menuItem(item)
            @mainMenu.append(itemTmpl)
        @registerMenuEvent(@mainMenu,@)


class Panel extends Spine.Controller
    constructor: ->
        super
        @loadFromTemplate()

    loadFromTemplate: ->
        @replace( window.PhoniexTmpls.panel() )


    refresh: (callbackOrParams) ->
        if typeof callbackOrParams is 'function'
            @bind('refresh', callbackOrParams)
        else
            @trigger('refresh', callbackOrParams)

    activate: (args...)->
        super

    isActive: ->
        return false if @stack.isActive() is false
        return super


Phoniex = @Phoniex   = {}
Phoniex.Env = Env
Phoniex.Util = Util
Phoniex.Cache = Cache
Phoniex.Page = Page
Phoniex.Panel = Panel
Phoniex.PageStack = PageStack
Phoniex.MainMenuPageStack = MainMenuPageStack
Phoniex.HeaderLeftMenuPage = HeaderLeftMenuPage
Phoniex.HeaderSingleLeftMenuPage = HeaderSingleLeftMenuPage
Phoniex.HeaderLeftAccordionMenuPage = HeaderLeftAccordionMenuPage
Phoniex.version    = '0.0.1'

#app namepsapce
@App = {}


