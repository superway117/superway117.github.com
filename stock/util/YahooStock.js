// Generated by CoffeeScript 1.4.0
(function() {
  var $, YahooStock,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = Spine.$;

  YahooStock = (function(_super) {

    __extends(YahooStock, _super);

    YahooStock.include(Spine.Events);

    YahooStock.prototype.debug = false;

    YahooStock.prototype.urlBase = null;

    YahooStock.techParams = {
      "size": {
        "command": "z",
        "values": {
          "large": "l",
          "middle": "m"
        }
      },
      "type": {
        "command": "q",
        "values": {
          "line": "l",
          "candle": "c",
          "bar": "b"
        }
      },
      "scale": {
        "command": "1",
        "values": {
          "log ": "on",
          "linear": "off"
        }
      },
      "range": {
        "command": "t",
        "values": {
          "1d": "1d",
          "5d": "5d",
          "1m": "1m",
          "3m": "3m",
          "6m": "6m",
          "1y": "1y",
          "2y": "2y",
          "5y": "5y",
          "max": "my"
        }
      },
      "indicator": {
        "command": "a",
        "values": {
          roc: "p12",
          macd: "m26-12-9",
          mfi: "f14",
          ss: "ss",
          rsi: "r14",
          fs: "fs",
          vol: "v",
          volma: "vm",
          wr: "w14"
        }
      },
      "compare": {
        "command": "c"
      }
    };

    YahooStock.fetchTodayChart = function(stockID, size) {
      if (stockID == null) {
        stockID = "000001.SS";
      }
      if (size == null) {
        size = "b";
      }
      stockID = this.canonical(stockID);
      return "http://ichart.yahoo.com/" + size + "?s=" + stockID;
    };

    YahooStock.fetchSmallChart = function(stockID) {
      if (stockID == null) {
        stockID = "000001.SS";
      }
      return this.fetchTodayChart(stockID, "t");
    };

    YahooStock.fetchLargeChart = function(stockID) {
      if (stockID == null) {
        stockID = "000001.SS";
      }
      return this.fetchTodayChart(stockID, "b");
    };

    YahooStock.fetchTechChart = function(stockID, options) {
      var command, compare, fullParam, k, last, list, param, params, url, v, value, _i, _len;
      if (stockID == null) {
        stockID = "000001.SS";
      }
      stockID = this.canonical(stockID);
      url = "http://chart.finance.yahoo.com/z?s=" + stockID + "&lang=en-US&region=US";
      if (!options) {
        return url;
      }
      if (options.compare) {
        compare = "";
        if ($.isArray(options.compare)) {
          list = ((function() {
            var _i, _len, _ref, _results;
            _ref = options.compare;
            _results = [];
            for (k = _i = 0, _len = _ref.length; _i < _len; k = ++_i) {
              v = _ref[k];
              _results.push(this.canonical(v));
            }
            return _results;
          }).call(this)).join(",");
          url += "&" + this.techParams.compare.command + "=" + list;
        } else {
          url += "&" + this.techParams.compare.command + "=" + (this.canonical(options.compare));
        }
      }
      delete options.compare;
      for (command in options) {
        params = options[command];
        if (fullParam = this.techParams[command]) {
          url += "&" + fullParam.command + "=";
          list = params.split(",");
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            param = list[_i];
            if (value = fullParam.values[param]) {
              last = url.charAt(url.length - 1);
              if (last === ',' || last === '=') {
                url += value;
              } else {
                url += "," + value;
              }
            }
          }
        }
      }
      return url;
    };

    YahooStock.canonical = function(stockID) {
      if (stockID.lastIndexOf('^') !== -1) {
        return stockID;
      }
      if (stockID.lastIndexOf('.') === -1) {
        if (stockID.charAt(0) === '6') {
          return stockID += ".SS";
        } else {
          return stockID += ".SZ";
        }
      }
      return stockID;
    };

    function YahooStock() {
      this.fetchHistoryMoneyCallback = __bind(this.fetchHistoryMoneyCallback, this);

      this.fetchHistoryDealCallback = __bind(this.fetchHistoryDealCallback, this);

      this.fetchDealCallback = __bind(this.fetchDealCallback, this);

      this.fetchFundsCallback = __bind(this.fetchFundsCallback, this);

      this.fetchLastCallback = __bind(this.fetchLastCallback, this);

      this.fetchQuotesCallback = __bind(this.fetchQuotesCallback, this);

      this.fetchHistoryCallback = __bind(this.fetchHistoryCallback, this);
      YahooStock.__super__.constructor.apply(this, arguments);
      this.bind('fetchFunds', this.fetchFundsImpl);
      if (this.debug) {
        this.urlBase = "http://127.0.0.1:3003/stock?api=";
      } else {
        this.urlBase = "http://rocky-thicket-9504.herokuapp.com/stock?api=";
      }
    }

    YahooStock.prototype.fetchHistory = function(options) {
      var stockID, url,
        _this = this;
      stockID = YahooStock.canonical(options.stockID);
      url = "" + this.urlBase + "gethistory&callback=?&s=" + stockID + "&a=" + options.startM + "&b=" + options.startD + "&c=" + options.startY;
      if (options.endY) {
        url += "&d=" + options.endM + "&e=" + options.endD + "&f=" + options.endY;
      }
      return $.getJSON(url, function(data) {
        return _this.fetchHistoryCallback(data);
      });
    };

    YahooStock.prototype.fetchHistoryCallback = function(data) {
      return this.trigger('fetchHistoryFinished', data);
    };

    YahooStock.prototype.fetchQuotes = function(stockList) {
      var list, stock, str, url,
        _this = this;
      list = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = stockList.length; _i < _len; _i++) {
          stock = stockList[_i];
          _results.push(this.constructor.canonical(stock));
        }
        return _results;
      }).call(this);
      str = list.join("+");
      url = "" + this.urlBase + "getquotes&callback=?&s=" + str;
      return $.getJSON(url, function(data) {
        return _this.fetchQuotesCallback(data);
      });
    };

    YahooStock.prototype.fetchQuotesCallback = function(data) {
      return this.trigger('fetchQuotesFinished', data);
    };

    YahooStock.prototype.fetchLast = function(stockList) {
      var list, stock, str, url,
        _this = this;
      if ($.isArray(stockList)) {
        list = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = stockList.length; _i < _len; _i++) {
            stock = stockList[_i];
            _results.push(this.constructor.canonical(stock));
          }
          return _results;
        }).call(this);
        str = list.join("+");
      } else {
        str = this.constructor.canonical(stockList);
      }
      url = "" + this.urlBase + "getlast&callback=?&s=" + str;
      return $.getJSON(url, function(data) {
        return _this.fetchLastCallback(data);
      });
    };

    YahooStock.prototype.fetchLastCallback = function(data) {
      return this.trigger('fetchLastFinished', data);
    };

    YahooStock.prototype.fetchFunds = function(options) {
      var stockID, url,
        _this = this;
      if (options.stockID === "000001.SS") {
        this.trigger('fetchFundsFinished', {
          "status": "fail",
          "reason": "cant fetch SHA COMPOSE"
        });
        return;
      }
      stockID = YahooStock.canonical(options.stockID);
      url = "" + this.urlBase + "getfunds&callback=?&s=" + stockID;
      if (options.startY) {
        url += "&a=" + options.startM + "&b=" + options.startD + "&c=" + options.startY;
      }
      if (options.endY) {
        url += "&d=" + options.endM + "&e=" + options.endD + "&f=" + options.endY;
      }
      return $.getJSON(url, function(data) {
        return _this.fetchFundsCallback(data);
      });
    };

    YahooStock.prototype.fetchFundsCallback = function(data) {
      return this.trigger('fetchFundsFinished', data);
    };

    YahooStock.prototype.fetchDeal = function(stockID) {
      var url,
        _this = this;
      if (stockID === "000001.SS") {
        this.trigger('fetchDealFinished', {
          "status": "error",
          "reason": "cant fetch SHA COMPOSE"
        });
        return;
      }
      url = "" + this.urlBase + "getdeal&callback=?&s=" + stockID;
      return $.getJSON(url, function(data) {
        return _this.fetchDealCallback(data);
      });
    };

    YahooStock.prototype.fetchDealCallback = function(data) {
      return this.trigger('fetchDealFinished', data);
    };

    YahooStock.prototype.fetchHistoryDeal = function(options) {
      var curS, curY, paraS, paraY, url,
        _this = this;
      url = "" + this.urlBase + "gethistorydeal&callback=?&s=" + options.stockID;
      if (options.year && options.season) {
        curY = Phoniex.Util.getCurrentYear();
        curS = Phoniex.Util.getCurrentSeason();
        paraY = +options.year;
        paraS = +options.season;
        if (paraY > curY || (paraY === curY && paraS > curS)) {
          this.trigger('fetchHistoryDealFinished', {
            "status": "fail",
            "reason": "date parameter is wrong"
          });
          return;
        }
        url += "&y=" + options.year + "&q=" + options.season;
      }
      return $.getJSON(url, function(data) {
        return _this.fetchHistoryDealCallback(data);
      });
    };

    YahooStock.prototype.fetchHistoryDealCallback = function(data) {
      return this.trigger('fetchHistoryDealFinished', data);
    };

    YahooStock.prototype.fetchHistoryMoney = function(options) {
      var url, _ref,
        _this = this;
      url = "" + this.urlBase + "gethistorymoney&callback=?&s=" + options.stockID;
      if (options.num && ((_ref = options.num) === 0 || _ref === 1)) {
        url += "&n=" + options.num;
      }
      return $.getJSON(url, function(data) {
        return _this.fetchHistoryMoneyCallback(data);
      });
    };

    YahooStock.prototype.fetchHistoryMoneyCallback = function(data) {
      return this.trigger('fetchHistoryMoneyFinished', data);
    };

    return YahooStock;

  })(Spine.Module);

  App["YahooStock"] = YahooStock;

}).call(this);
