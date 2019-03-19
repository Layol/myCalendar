; (function ($) {
  // 向后推移n天
  function nextNDate(date, n) {
    return new Date(date.getTime() + 1000 * 24 * 60 * 60 * n)
  }
  // 某月总天数
  function getMonthDay(date) {
    return (new Date(date.getFullYear(), date.getMonth() + 1, 0)).getDate()
  }
  // 某月第一天
  function getFirstDay(date) {
    return (new Date(date.getFullYear(), date.getMonth(), 1))
  }
  // 日期是否为同一天
  function isSameDay(date1, date2) {
    return (date1.getFullYear() == date2.getFullYear()) && (date1.getMonth() == date2.getMonth()) && (date1.getDate() == date2.getDate())
  }
  // 向后推移n月
  function nextNMonth(date, n) {
    return new Date(date.getFullYear(), (date.getMonth() + n), date.getDate())
  }
  var week = ['日', '一', '二', '三', '四', '五', '六'];
  /* 
    @params
    el:NodeElement需要被封装成日历控件的node节点
    numberData:Array<number>日历中的信息
    selectedDate:Date当前选中的日期默认选中最早有数据的日子
  */
  function MyCalendar(el, numberData, selectedDate) {
    this.$el = el;
    this.dataList = numberData || []
    this.defDate = selectedDate || null;
    this.selIdx = 0;
    this.viewMon = 0;
    this.months = [];
    this._now = new Date()
    this.barList = [] // 条状选择列表数据
    this.initData()
    this.createEl()
    this.bindEvent()
  }
  //初始化数据
  MyCalendar.prototype.initData = function () {
    var _self = this, // 
      _now = this._now, // 当日日期
      curDate, // 保存日期 
      returnData = {}
    this.dataList = this.dataList.map(function (val, idx, arr) {
      curDate = nextNDate(_now, idx)
      if ((_self.defDate == null) && val) {
        _self.defDate = curDate
      }
      if (idx > 0) {
        // 跨月份
        if (curDate.getMonth() != nextNDate(_now, idx - 1).getMonth()) {
          _self.months.push(idx)
        }
      }
      returnData = {
        val: val,
        date: curDate
      }
      if (_self.defDate && isSameDay(curDate, _self.defDate)) {
        _self.selIdx = idx
      }
      return returnData
    })
  }
  //组装横向切换html
  MyCalendar.prototype.formatBar = function () {
    this.barList = this.dataList.slice(this.selIdx > 7 ? this.selIdx - 7 : 0, this.selIdx + 8)
    var barHtml = '', _self = this;
    this.barList.forEach(function (val, idx) {
      if (isSameDay(val.date, _self.defDate)) {
        val.isSelected = true
      } else {
        delete val.isSelected
      }
      barHtml += ('<li class="my-calendar-bar-item"><p class="bar-item-day">' + (week[val.date.getDay()]) + '</p>' + _self.createCard(val) + '</li>')
    })
    var dataLen = this.dataList.length;
    for (var i = 0; i < 8 + this.selIdx - dataLen; i++) {
      var plusDate = nextNDate(this.dataList[dataLen - 1].date, i + 1);
      barHtml += ('<li class="my-calendar-bar-item"><p class="bar-item-day">' + (week[plusDate.getDay()]) + '</p>' + _self.createCard({ date: plusDate, val: null }) + '</li>')
    }
    return barHtml
  }
  // 创建节点
  MyCalendar.prototype.createEl = function () {
    '+ this.formatBar() + '
    var maskHtml = '<div class="my-calendar-bar">\
                      <div class="my-calendar-body">\
                        <ul class="my-calendar-bar-list"></ul>\
                      </div>\
                      <div class="my-trigger">\
                        <img src="data:image/png;base64,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"\
                          alt="日历">\
                        日历\
                      </div>\
                    </div>\
                    <div class="calendar-mask"></div>\
                    <div class="calendar-popups">\
                        <div class="calendar-popups-box">\
                          <div class="calendar-popups-header">\
                            <p class="calendar-popups-month">'+ this.dataList[0].date.getFullYear() + '年' + (this.dataList[0].date.getMonth() + 1) + '月</p>\
                            <img class="calendar-closed-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAmCAYAAABH/4KQAAAEcElEQVRYR72YZaitVRCGn2t3t9hYmPjDQiwMVFBRLybitbuuilxbr42Fgt2BYPwQQf1hiyiiiN2Y2GJ38RxmHeYu9rfPt+Ocgc3Z59sr3m/emXdmrUnA4sBTwCrA78DpwGXA30yczQTsC1wJzAN8DOwyCVgO+DDh+A44Fbh64rAxBTg/HFW2vUhwywBvAnMnMD8AF8RnvDEeDZwFLJA2+g2YIriZgWOA84DZqwEnA1cB/44DQvfeHbgOmDet/xdwBTDNAdqcwGnAVGC2NPAb4ATg1nEANxm4HFiqAmY4nQL8XMD5+xzAEcD0+F7mfBtuN1iHZQcGU4umBf+MvS8BfvV5Buf/swAnBRi/FzMGjg0KBgW4E3AbMF9a6B/gWuA4QJAjVoPz2VyRCIdUFH8Vnr13AHTbA9dEEpZljLHbA9iPee1O4ApAY21alSRfhszc0AfAvYGLgSWrGLsUOAf4pV6zCVyh2Gw9MzJ6EIp3DCrnTwBUADNVpRilso3nyhizWHE8bACKpdIMXLbymApwPPBTEwvdPFfmGIMnBsVZZqTYlL+xC8VNVFoez+5EZS+eK2MVZ+PPT85iK4m0dNLB7eJ5lguz8qbI/BG56GZtPFfmW94Uzf0qgJ8DBwAPpY02A24GVkjPbCTM9EMBX2pM6wWci9kx2LVYD3Op+zSovxvYOcpPHWPqmGEwg1wMy3PZg2dEMFuXi30B3ALsGZ1OeW5W3hEv1MpjZWKvnivz9KBat2tFce0IY+xhYB/g+zF5rAb0C85l7CSUmf2jcaj3/iM8ZjPRk8cG9VyZL0BbLRuG/KL/AfcBlkCb175sEM+54erAXcA6HcC9F/H3Yl/IGgp/27W2AK4HVuoywfZf6Xik7aJ5XL+e2yTEdOW0mMFv57IIMGt67mHlKOCBXgH2A05hNQM9rRUzxp4DtopY27Zi5RNgB+DVXgD2Cm6DKEmrVh6zOniCsq1fMOi2E8keNAYd80xbgL2AE5hFfo20uAIrMLPys/Tcemrvpr5loRbgkW1jsC04D95PAKtVb+2RctPwWO0QezcTwZfK9hGwJfDBWB5sA25t4E5gzYpKwVqqvu6yyUIhxFtXleQtwHbqpW4AxwK3XlC5bkXlY8BB1U1B0z5LRCOwG+C1QzEBHg483jSxG7jFgkqFNttrwOaAR8a25knL2Ny4F4qbwEmlyp+DXx17EthjDCqbABeKt6mS5G1gr04UdwLXROWjwMEtqWwC6MnLFl2KcxabWNbnGSiuwSkBZpgxln8zPgxqm8pBzT0eBNZPCyni7wKK9+iNVwZgKboniniZp469EN2tzeSwTID3AxtVHnw9vKozRr2zVjSP+W0E9nScD94fFqq0ztJxg2UlyVn8ShxFn9VzC8dbWMzzINXcE5R/x8u8G7QhqKXqZWByp5tNPaZcyP8wqWx6QSVLmRFgds65gvOU9E6cpgzM56NAj/A+QbZ8XPCYdAL0cmeq4LyX89rLs6d8ez/yBiDQibQVgQuBDSMxp/8PySLrZGWKhBkAAAAASUVORK5CYII=" alt="关闭按钮">\
                          </div>\
                          <div class="calendar-popups-body">\
                          <ul class="calendar-list">'+
      this.createTableList()
      + '</ul></div></div></div>';
    this.$el.append(maskHtml)
  }
  //创建单个节点
  MyCalendar.prototype.createCard = function (card) {
    var cardHtml = '', dateStyle = '', valTxt = '', partHtml = '';
    switch (card.val) {
      case null: dateStyle = 'unable', valTxt = '暂无'; break;
      case 0: dateStyle = 'full', valTxt = '满'; break;
      default: dateStyle = '', valTxt = '(' + card.val + ')'; break;
    }
    if (card.isSelected) {
      dateStyle = "actived"
    }
    partHtml = '<span class="bar-item-data">' + valTxt + '</span>'
    if (card.unable) {
      partHtml = ''
      dateStyle = 'unable'
    }
    cardHtml = '<div class="bar-item-card ' + dateStyle + '">\
              <span class="bar-item-date">'+ (card.date.getDate()) + '</span>'
      + partHtml +
      '</div>';
    return cardHtml;
  }
  //日历
  MyCalendar.prototype.createTableList = function () {
    var tableList = this.dataList, _self = this, tableHtml = '';
    for (var i = 0; i <= this.months.length; i++) {
      tableHtml += '<li class="calendar-card">\
          <table  class="calendar-table">\
            <thead>\
              <tr>\
                <th>日</th>\
                <th>一</th>\
                <th>二</th>\
                <th>三</th>\
                <th>四</th>\
                <th>五</th>\
                <th>六</th>\
              </tr>\
            </thead>\
            <tbody>'
      tableHtml += this.createTable(tableList.slice(this.months[i - 1] || 0, this.months[i]))
      tableHtml += '</tbody></table></li>'
    }
    return tableHtml;
  }
  //创建日历某页
  MyCalendar.prototype.createTable = function (table) {
    var htmlStr = '',
      firstDate = getFirstDay(table[0].date),
      totalDay = getMonthDay(table[0].date),
      len = table.length,
      prevNon = firstDate.getDay(),
      nextNon = totalDay + prevNon - 1,
      ableStartIdx = table[0].date.getDate() + prevNon - 1
    ableEndTdx = ableStartIdx + len - 1;
    for (var row = 0; row < 6; row++) {
      htmlStr + '<tr>'
      for (var col = 0; col < 7; col++) {
        var index = row * 7 + col
        htmlStr += '<td>'
        if (index <= ableEndTdx && index >= ableStartIdx) {
          htmlStr += this.createCard(table[index - ableStartIdx])
        } else if (index < ableStartIdx && index >= prevNon) {
          htmlStr += this.createCard({
            date: nextNDate(firstDate, index - prevNon),
            unable: true
          })
        } else if (index > ableEndTdx && index < nextNon) {
          htmlStr += this.createCard({
            date: nextNDate(firstDate, index - prevNon),
            val: null
          })
        }
        htmlStr += '</td>'
      }
      htmlStr += '</tr>'
    }
    return htmlStr;
  }
  // 绑定事件
  MyCalendar.prototype.bindEvent = function () {
    var _self = this;
    this.$el.find('.my-trigger').click(openMask)
    this.$el.find('.calendar-mask').click(closePopup)
    this.$el.find('.calendar-closed-icon').click(closePopup)
    this.$el.find('.calendar-popups-body').scroll(function (e) {
      var scrollTop = e.target.scrollTop, tableHeight = _self.$el.find('.calendar-card').eq(0).height();
      var idx = Math.round(scrollTop / tableHeight)
      if (idx != _self.viewMon) {
        _self.viewMon = idx;
        var curDate = nextNMonth(_self._now, idx)
        $('.calendar-popups-month').text(curDate.getFullYear() + '年' + (curDate.getMonth() + 1) + '月')
      }
    })
    this.$el.find('.calendar-card .bar-item-card').not('.unable').not('.full').not('.actived').click(function () {
      _self.$el.find('.calendar-card .bar-item-card.actived').removeClass('actived')
      $(this).addClass('actived')
      var tableIdx = $(this).parents('.calendar-card').index(), dateIdx = Number($(this).find('.bar-item-date').text())
      if (tableIdx == 0) {
        dateIdx -= (new Date().getDate())
      }
      if (tableIdx > 0) {
        dateIdx += (_self.months[tableIdx - 1] - 1)
      }
      _self.defDate = _self.dataList[dateIdx].date
      _self.updateHtml(dateIdx);
      closePopup()
      _self.$el.trigger('change', _self.defDate)
    })
    this.$el.find('.calendar-list .bar-item-card:not(.unable)').eq(_self.selIdx).trigger('click')
    // 打开日历
    function openMask() {
      _self.$el.find('.calendar-mask').fadeIn()
      _self.$el.find('.calendar-popups').fadeIn(function () {
        var boxHeight = _self.$el.find('.calendar-card').height()
        boxIdx = _self.$el.find('.calendar-card .actived.bar-item-card').parents('.calendar-card').index()
        _self.$el.find('.calendar-popups-body').scrollTop(boxHeight * boxIdx)
      })
    }
    //关闭日历
    function closePopup() {
      _self.$el.find('.calendar-mask').fadeOut()
      _self.$el.find('.calendar-popups').fadeOut()
    }
  }
  // 更新节点
  MyCalendar.prototype.updateHtml = function (idx) {
    var _self = this
    this.selIdx = idx
    this.$el.find('.my-calendar-bar-list').children().remove()
    this.$el.find('.my-calendar-bar-list').append(this.formatBar())
    this.$el.find('.my-calendar-bar-item .bar-item-card:not(.full):not(.actived):not(.unable)').parents('.my-calendar-bar-item').click(function () {
      var selectedIdx = _self.$el.find('.my-calendar-bar-item .bar-item-card.actived').parents('.my-calendar-bar-item').index()
      var curIdx = $(this).index()
      var idxDiff = curIdx - selectedIdx;
      _self.selIdx += idxDiff
      _self.$el.find('.calendar-list .bar-item-card:not(.unable)').eq(_self.selIdx).trigger('click')
      var boxWidth = _self.$el.find('.my-calendar-bar-item').width(), offsetIdx = _self.$el.find('.my-calendar-bar-item .bar-item-card.actived').parents('.my-calendar-bar-item').index()
      _self.$el.find('.my-calendar-body').scrollLeft(boxWidth * offsetIdx)
    })
    var boxWidth = _self.$el.find('.my-calendar-bar-item').width(), offsetIdx = _self.$el.find('.my-calendar-bar-item .bar-item-card.actived').parents('.my-calendar-bar-item').index()
    _self.$el.find('.my-calendar-body').scrollLeft(boxWidth * offsetIdx)
  }
  //jquery插件
  $.fn.myCalendar = function (numberData, selectedDate) {
    new MyCalendar(this, numberData, selectedDate)
    return this;
  }
})(jQuery)