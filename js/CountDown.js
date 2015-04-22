(function(window){
    var CountDown;
    var _OP = Object.prototype,
        hasOwn = _OP.hasOwnProperty,
        parseInt = window.parseInt;

    var parseBoolean = function(value){
        if (typeof value === "boolean" || (value instanceof Boolean)){
            return value
        }else if (typeof value === "string"){
            switch (value.toLowerCase()){
                case "true": return true; break;
                case "1": return true; break;
                case "false": return false; break;
                case "0": return false; break;
                default : return false;
            }
        }else{
            return false;
        }
    };

    var fixZeroBefore = function(numStr){
        return numStr.length > 1 ? numStr: '0' + numStr;
    };

    var tpl = "<div class='count_down_timer clearfix'>" +
            "</div>",
        digitalTpl = "<span class='digital'><span class='tens'></span><span class='units'></span></span>";

    CountDown = function(options){
        var defaultOpts = CountDown.defaultOptions;
        this.options = options = $.extend({}, defaultOpts, options);

        this.initialize(options);
    };

    CountDown.defaultOptions = {
//        container: $container
//        endTime: new Date()
        fontSize: 30,
        fontColor: "#000",
        fontBold: false,
        spacing: 24,
        setDay: true,
        setMilisec: false,
        hasAminate: false
    };

    CountDown.prototype = {
        constructor : CountDown,
        tagName : "div",
        initialize : function(options){

            var interval = options.setMilisec ? 100 : 1000;//鏄剧ず姣鐨勯噰鐢�100ms涓鸿鏃跺懆鏈燂紝鍚﹀垯涓�1绉�

            this.offset = options.endTime - (window.RM_SERVER_TIME ? (window.RM_SERVER_TIME * 1000) : (new Date()));

            if (!(this.offset && this.offset > 0)){
                this.offset = 0;
            };

            this.initUnits(parseBoolean(options.setDay), parseBoolean(options.setMilisec));

            this.render(options);//todo optimize arguments

            this.timerFunc(options.endTime, interval);//鍏堟墽琛屼竴娆★紝閬垮厤鍦�1绉掑悗鎵嶅紑濮嬫覆鏌�

            this.initTimer(options.endTime, interval);

        },
        initUnits: function(setDay, setMilis){
            this.units = {
                day: 86400000,
                hour: 3600000,
                min: 60000,
                sec : 1000,
                hms : 100
            };
            if (!setDay){
                delete this.units["day"]
            };
            if (!setMilis){
                delete this.units["hms"]
            }
        },
        render: function(options){
            var units = this.units,
                els = this.els = {},
                $root = els.$root= $(tpl),
                cssObj = {
                    "float" : "left",
                    "margin-right": options.spacing + "px",
                    "overflow": "hidden"
                },
                last;

            for (var unit in units){
                if (hasOwn.call(units, unit)){
                    last = els["$" + unit] = $(digitalTpl)
                        .addClass(unit)
                        .css(cssObj)
                        .appendTo($root);
                };
            };

            last.css({"margin-right": "0"});//鏈€鍚庝竴涓厓绱犱笉margin-right

            $root.css({
                "font-size" : options.fontSize + "px",
                "font-weight" : parseBoolean(options.fontBold) ? "bold" : "normal",
                "color" : options.fontColor
            }).appendTo(options.container);
        },
        timerFunc : function(endTime, interval){
            var timeRemain,
                units = this.units;

            if (this.offset >= 0){
                timeRemain = this.formatTimeOffset(units);
            }else{
                this.stop();//璁℃椂缁撴潫锛岄噴鏀捐鏃跺櫒璧勬簮
            }
            this.offset = this.offset -interval;

            this.update(timeRemain);
        },
        formatTimeOffset : function(units){
            var result = {},
                offset = this.offset,
                unitOffset,
                value;

            for (var unit in units){
                if (hasOwn.call(units, unit)){
                    unitOffset = units[unit];

                    value = parseInt(offset/unitOffset, 10).toString();

                    result[unit] = fixZeroBefore(value);

                    offset = offset % unitOffset;
                }
            }
            return result;
        },
        initTimer: function(endTime, interval){
            var self = this;

            this.timer = window.setInterval(function(){
                self.timerFunc.call(self, endTime, interval);
            }, interval);
        },
        update: function(timeRemain){
            var els = this.els,
                hasAminate = this.options.hasAminate,
                $el,
                value,
                $tens, $units,
                tensValue,
                unitsValue,
                units;
            for (var unit in timeRemain){
                if (hasOwn.call(timeRemain, unit)){
                    value = timeRemain[unit];

                    tensValue = value.charAt(0);
                    unitsValue = value.charAt(1);

                    $el = els["$" + unit];

                    $tens = $el.find(".tens");
                    $units = $el.find(".units");

                    if (!hasAminate){
                        $tens.text(tensValue);
                        $units.text(unitsValue);
                    }else{
//                        this.doAminate($tens, tensValue);
                    }
                };
            }
        },
        doAminate: function($el, num, speed){
        },
//        pause: function(){},todo
        stop : function(){
            window.clearInterval(this.timer);
        },
        destroy : function(){
            this.stop();
            //clear dom
            this.els.$root.remove();
        }
    }

    window.CountDown = CountDown;

    return CountDown;
})(window)

//鍏ㄥ眬鍒濆鍖�
$(function(){
    var CountDown = window.CountDown;
    $(".countdown").each(function(){
        var _this = $(this);
        var opts = {
            container: _this,
            endTime : _this.attr("endTime"),
            fontSize: _this.attr("fontSize"),
            fontColor: "#"+_this.attr("fontColor"),
            fontBold: _this.attr("fontBold"),
            spacing: _this.attr("spacing"),
            setDay: _this.attr("setDay"),
            setMilisec: _this.attr("setMilisec"),
            hasAminate: false//姝ゅ弬鏁版殏鏃舵病鐢紝浠ュ悗鐢ㄤ簬鍒囨崲鏁板瓧寮忓拰杞疆寮�
        };
        new CountDown(opts);
    });
});