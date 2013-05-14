// Generated by CoffeeScript 1.4.0
(function() {
  var $, MainController,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = Spine.$;

  MainController = (function(_super) {

    __extends(MainController, _super);

    MainController.prototype["default"] = "stock";

    MainController.prototype.controllers = {
      stock: App.StockPage,
      selection: App.SelectionPage,
      index: App.IndexPage
    };

    MainController.prototype.elements = {
      'div[data-role=header] form input[type=text]': 'searchText'
    };

    MainController.prototype.events = {
      'submit div[data-role=header] form': 'deFetchStock',
      'focus div[data-role=header] form input[type=text]': 'deClearSearch'
    };

    function MainController() {
      this.searchTypeAhead = __bind(this.searchTypeAhead, this);
      MainController.__super__.constructor.apply(this, arguments);
      this.initDB();
      this.searchText.typeahead({
        source: this.searchTypeAhead,
        matcher: function() {
          return true;
        }
      });
      this.stock.active();
      if (!Phoniex.Env.getConnected()) {
        alert("请确定网络已经连接!");
      }
    }

    MainController.prototype.loadFromTemplate = function() {
      MainController.__super__.loadFromTemplate.apply(this, arguments);
      this.header.html(window.Tmpls.toolbarHeader());
      this.mainMenu = this.$("ul[data-role=mainmenu]");
      return this.refreshElements();
    };

    MainController.prototype.initFavList = function() {
      var item, _i, _len, _ref, _results;
      App.FavList.fetch();
      if (App.FavList.count() === 0) {
        _ref = App.FavList["default"];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(App.FavList.create(item));
        }
        return _results;
      }
    };

    MainController.prototype.initTagList = function() {
      App.TagList.fetch();
      if (App.TagList.count() === 0) {
        return App.TagList.create(App.TagList["default"]);
      }
    };

    MainController.prototype.initStockList = function() {
      return App.StockList.fetch();
    };

    MainController.prototype.initDB = function() {
      this.initFavList();
      this.initTagList();
      return this.initStockList();
    };

    MainController.prototype.searchTypeAhead = function(val, func) {
      var item, list, _i, _len, _results;
      list = App.StockDict.query(val);
      _results = [];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        item = list[_i];
        _results.push(item.join(","));
      }
      return _results;
    };

    MainController.prototype.deClearSearch = function(e) {
      return $(e.target).val("");
    };

    MainController.prototype.deFetchStock = function(e) {
      var value;
      e.preventDefault();
      value = this.searchText.val().slice(0, 6);
      if (!App.Util.isValidStockID(value)) {
        return false;
      }
      this.stock.setStock(value);
      this.stock.active();
      return false;
    };

    return MainController;

  })(Phoniex.MainMenuPageStack);

  App["MainController"] = MainController;

}).call(this);
