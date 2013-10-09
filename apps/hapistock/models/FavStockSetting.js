// Generated by CoffeeScript 1.4.0
(function() {
  var FavList,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FavList = (function(_super) {

    __extends(FavList, _super);

    function FavList() {
      return FavList.__super__.constructor.apply(this, arguments);
    }

    FavList.configure("FavList", "stock", "firstLetter");

    FavList.extend(Spine.Model.Local);

    FavList["default"] = [
      {
        stock: "002142",
        firstLetter: "宁波"
      }, {
        stock: "000002",
        firstLetter: "万科"
      }, {
        stock: "600737",
        firstLetter: "中粮"
      }
    ];

    return FavList;

  })(Spine.Model);

  App["FavList"] = FavList;

}).call(this);
