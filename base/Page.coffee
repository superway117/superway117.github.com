
$ = Spine.$

class Page extends Spine.Controller

    controllers: {}

    tmplId: null
    footerMenuItem: null
    footerMenuLoaded: false

    constructor: (options) ->
        super
        @loadFromTemplate()
        
        @manager = new Spine.Manager
        for key, value of @controllers
            @[key] = new value(page: @)
            @addPanel(@[key])

        for key, value of @routes
            do (key, value) =>
                callback = value if typeof value is 'function'
                callback or= => @[value].active(arguments...)
                @route(key, callback)
        @[@default].el.addClass("active") if @default

    loadFromTemplate: ->
        @replace($("##{@tmplId}").html())
        @content = @$("div[data-role=content]")
        @headerDropMenu = @$("div[data-role=header] .pull-right .dropdown-menu")
        @footerMenu = @$("div[data-role=footer] .navbar .nav")
        @quickBar = @$("div[data-role='header'] ul[data-role='quickbar']")
        

    loadFooterMenu: ->
        return if @footerMenuLoaded
        @footerMenu.empty()
        for item in @stack.getFooterMenu()
            @footerMenu.append($("#menuItemTmpl").tmpl(item) )
        $("a" ,@footerMenu).click (e)=>
            name = $(e.target).attr("name")
            @stack[name].active()
        if @footerMenuItem
            $("a[name=#{@footerMenuItem.name}]",@footerMenu).addClass("active")
        @footerMenuLoaded = true  

    appendQuickBar: (item)->
        @quickBar.append($("#menuItemTmpl").tmpl(item) )

    clearQuickBar: ->
        @quickBar.empty()


    appendHeaderMenu: (item)->
        @headerDropMenu.append($("#menuItemTmpl").tmpl(item) ) 

    clearHeaderMenu: ->
        @headerDropMenu.empty()

    addPanel: (panel) -> 
        @manager.add(panel)
        @content.append(panel.el)
        if panel.headerMenuItem
            @appendHeaderMenu(panel.headerMenuItem) 
            $("a[name=#{panel.headerMenuItem.name}]",@headerDropMenu).click =>
                @[panel.headerMenuItem.name].active()

        @el

    slientActive: (current) ->
        for cont in @manager.controllers
          if cont is current
            cont.el.addClass('active')
          else
            cont.el.removeClass('active')


    getActive: ->
        con=@[key] for key,value of @controllers when @[key].isActive()
        con or= @[@default]

    activate: (args...)->
        super
        @loadFooterMenu()
        #@getActive()?.refresh()
        @getActive()?.active(args...)

    refresh: ->
        @getActive()?.refresh()

    registerPageEvent: (event,callback)->
        @stack.registerPageEvent(event,@,callback)

        
    triggerPageEvent: (args...)->
        @stack.trigger(args...)

class PageStack extends Spine.Stack
    constructor: (options) ->
        super
        Spine.Route.setup()

    getActive: ->
        con=@[key] for key,value of @controllers when @[key].isActive()
        con or= @[@default]

    getFooterMenu: ->
        (@[key].footerMenuItem for key, value of @controllers when @[key].footerMenuItem)   

    registerPageEvent: (event,page,callback)->
        @bind event, (args...)=>
            if callback(args...)
                page.active(args...)
            

class Panel extends Spine.Controller
    tmplId: null
    constructor: ->
        super
        @el.attr("data-role","panel")

    refresh: (callbackOrParams) ->
        if typeof callbackOrParams is 'function'
          @bind('refresh', callbackOrParams)
        else
          @trigger('refresh', callbackOrParams)

    activate: ->
        super
        @refresh(arguments)

    isActive: ->
        return false if @page.isActive() is false
        return super

class DynamicPanel extends Panel

    constructor: ->
        super
        @bind('dataReady', @render)
        @bind("refresh", @fetchData)

    render: (data) ->
        @el.html($("##{@tmplId}").tmpl(data))
        @refreshElements()

class StaticPanel extends Panel
    constructor: ->
        super
        @el.html($("##{@tmplId}").html())
        @refreshElements()
        @refresh @render

class MixedPanel extends Panel
    constructor: ->
        super
        @bind('dataReady', @render)
        @bind("refresh", @fetchData)

        @el.html($("##{@tmplId}").html())
        @refreshElements()

window.Stock["Panel"]               =   Panel
window.Stock["DynamicPanel"]               =   DynamicPanel
window.Stock["StaticPanel"]               =   StaticPanel
window.Stock["MixedPanel"]               =   MixedPanel
window.Stock["Page"]                =   Page
window.Stock["PageStack"]           =   PageStack