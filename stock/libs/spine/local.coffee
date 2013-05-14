Spine = @Spine or require('spine')

Spine.Model.Local =
  extended: ->
    @change @saveLocal
    @fetch @loadLocal

  saveLocal: ->
    console.log("saveLocal dir")

    result = JSON.stringify(@all())
    localStorage.setItem(@className,result)

  loadLocal: ->
    result = localStorage.getItem(@className)
    # for phonegap, since it return string undefined if undefined
    if not result or result is "undefined" 
      result = []
    @refresh(result, clear: true)


module?.exports = Spine.Model.Local