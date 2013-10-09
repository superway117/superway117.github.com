class FavList extends Spine.Model
    @configure "FavList", 
                "stock","firstLetter"

    @extend Spine.Model.Local

    @default: 
        [
            {stock: "002142",firstLetter:"宁波"}
            {stock: "000002",firstLetter:"万科"}
            {stock: "600737",firstLetter:"中粮"}
        ]

App["FavList"]    = FavList