// Generated by CoffeeScript 1.4.0
(function() {
  var $, StockHistory,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = Spine.$;

  StockHistory = (function(_super) {

    __extends(StockHistory, _super);

    StockHistory.prototype.tmplId = "stockHistoryTmpl";

    StockHistory.prototype.tableTmplId = "stockHistoryTableTmpl";

    StockHistory.prototype.events = {
      'submit form': 'deFetchHistory'
    };

    StockHistory.prototype.elements = {
      'table tbody': 'table',
      '#startDate': 'startDate',
      '#endDate': 'endDate'
    };

    StockHistory.prototype.headerMenuItem = {
      name: "history",
      text: "历史信息"
    };

    function StockHistory() {
      this.fetchData = __bind(this.fetchData, this);
      this.fetchFinished = __bind(this.fetchFinished, this);      StockHistory.__super__.constructor.apply(this, arguments);
      this["ystock"] = new Stock.YahooStock;
      this.ystock.bind('fetchHistoryFinished', this.fetchFinished);
    }

    StockHistory.prototype.fetchFinished = function(result) {
      var data;
      if (result.status === "succ") {
        data = result.list;
        return this.trigger("dataReady", data);
      }
    };

    StockHistory.prototype.render = function(data) {
      return this.table.html($("#" + this.tableTmplId).tmpl(data));
    };

    StockHistory.prototype.fetchData = function(options) {
      var data, days7;
      days7 = Stock.Util.getDaysBeforeDate(7);
      data = {
        stockID: this.page.stockID,
        startY: days7.getFullYear(),
        startM: days7.getMonth(),
        startD: days7.getDate()
      };
      $.extend(data, options);
      return this.ystock.fetchHistory(data);
    };

    StockHistory.prototype.deFetchHistory = function(e) {
      var end, options, start;
      e.preventDefault();
      start = this.startDate.val().split("-");
      end = this.endDate.val().split("-");
      if (new Date(start[2], start[0], start[1]) > new Date(end[2], end[0], end[1])) {
        Stock.Util.openPromptInfo(this.page, {
          header: "Warning",
          body: "结束日期必须大于起始日期"
        });
        return false;
      }
      options = {
        startY: start[2],
        startM: (+start[0]) - 1,
        startD: start[1],
        endY: end[2],
        endM: (+end[0]) - 1,
        endD: end[1]
      };
      return this.trigger("refresh", options);
    };

    StockHistory.prototype.activate = function() {
      var days7, now_str;
      StockHistory.__super__.activate.apply(this, arguments);
      now_str = Stock.Util.getNowDateString();
      this.endDate.datepicker('setValue', now_str);
      this.endDate.val(now_str);
      this.endDate.attr('data-date', now_str);
      days7 = Stock.Util.getDaysBeforeString(7);
      this.startDate.datepicker("setValue", days7);
      this.startDate.val(days7);
      this.startDate.attr('data-date', days7);
      this.startDate.datepicker();
      return this.endDate.datepicker();
    };

    StockHistory.prototype.canonicalDate = function(str) {
      if (str.length === 2 && str.charAt(0) === '0') {
        return str.slice(1);
      }
      return str;
    };

    return StockHistory;

  })(Stock.MixedPanel);

  window.Stock["StockHistory"] = StockHistory;

}).call(this);
