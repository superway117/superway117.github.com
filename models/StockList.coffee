class StockList extends Spine.Model
    @configure "StockList", "stock","tag"
    @extend Spine.Model.Local


class TagList extends Spine.Model
    @configure "TagList", "name"
    @extend Spine.Model.Local
    @default: {name: "Default"}

window.Stock["StockList"]    = StockList
window.Stock["TagList"]    = TagList