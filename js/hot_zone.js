/**
 * @fileOverview cutImg 1.0
 * @author liz
 * @time 2013-12-24
 * @requires jquery.js, Zeroclipboard.js
 */

(function ($) {
    window.JMStore = window.JMStore ? window.JMStore : {};
    JMStore.CutImg = {
        defaultOptions: {
            trigger:".Modal-trigger",
            modal:"#Modal-c",//工具容器
            linkWrap:"#Modal-h",//设置链接容器
//            fileInput:"#h-upload",//取消了该处上传图片
            modalShade:".modal-shade",
            tipOk:".tip-ok",
            tipEr:".tip-er",
            imgAb:".img_ab",
            imgUrl:".img-url",
            img_wrap:".img_wrap",
            img_map:".img_map",
            img_center:".img_center",
            img_tip:".tip",
            text_suc2:"#text-success2",
            insertBtn:"#insertBtn",
            copyBtn:"copyBtn",
            previewBtn:"#previewBtn",
            closeBtn:".close-btn",
            jumpType:"#jumpType",
            settingUrl:".inline-setting",
            openUrl:".open-url",
            saveSetting:"#save-setting",
            textError:".text-error",
            insertId:"insert",
            hotspot:"",
            imgName:"",
            code:"",
            data:[],
            //whiteList:jmstoreCommon.whiteList,
            dataAttr:[],
            dataAttrOld:[],
            pre:"",
            hotType:"#hotType",
            brands:[],
            brandsIdMap:[],
            iframe:false,
            ww:0,
            wh:0,
            hotiklink:"",
            HotPotPreview:"",
            session_Url:"",
            dataBrand:{},
            maxHeight:2000,
            roleType:null,
            fromPage:"default",
            store_domain:"",
            "partner_typetext":"partnerBaiJiaRank",
			"partner_type":false //是否是partner专场
        },
        init:function(opts){
            opts = $.extend(this.defaultOptions, opts || {});

            //动态创建热区类型html
            var optionHtml ='',data;
            if(opts.partner_type){
                data = {
                    "img_deal": "团购产品详情页",
                    "img_url": "自定义页"
//                    "back_to_index":"回到首页"
                };
            }else{
                data = {
                    "img_deal": "团购产品详情页",
                    "img_mall_list": "商城产品列表",
                    "product": "商城产品详情页",
                    "store_domain": "旗舰店首页",
                    "img_store_page": "旗舰店自定义二级页",
                    "img_store_list": "旗舰店商品列表",
                    "img_url": "自定义页",
                    "img_session":"专场页面",
                    "img_freepie_detail": "freepie详情",
                    "back_to_index":"回到首页",
                    "global_deal":"海淘Deal详情页（自营+pop）",
                    "global_combination_deal":"海淘组合购Deal详情页"
                };
            }

            $.each(data, function (i, item) {
                optionHtml += '<option value="' + i + '">' + item + '</option>';
            });
            $(opts.jumpType).html(optionHtml);

            //动态创建产品类型html
            var optionBrand ='';
            if (opts.fromPage == "Flagship") { //旗舰店2.0里面的热区
                $.each(opts.dataBrand, function (i, item) {
                    optionBrand += '<option value="' + item.brand_id+ '">' + item.friendly_name+ '</option>';
                });
            }else{ //专场里面的热区
            $.each(opts.dataBrand, function (i, item) {
                optionBrand += '<option value="' + i + '">' + item + '</option>';
            });
            }

            $("#brand").html(optionBrand);//chosen({ "width": 230});
            if(opts.roleType) {
            	$("#baijia").html(optionBrand);//chosen({ "width": 230});	
            }
            $("#brand,#baijia").trigger("liszt:updated");
            
            // //品牌名称
            // $( "#brand" ).autocomplete({
            //     source: opts.brands
            // }).bind("autocompletechange keyup", function() {
            //     if (opts.brandsIdMap[$(this).val()]) {
            //         $("#brandId" ).val(opts.brandsIdMap[$(this).val()]);
            //     } else {
            //         $("#brandId" ).val('');
            //     }
            // });

            if(opts.iframe){
                opts.ww = $(top).width(), opts.wh = $(top).height();
            }else{
                opts.ww = $(window).width(), opts.wh = $(window).height();
            }//没有相对top居中。。

            this.clipCode = new ZeroClipboard.Client();//创建对象;
            this.clipUrl = new ZeroClipboard.Client();//创建对象
            this.clipPro = new ZeroClipboard.Client();//创建对象
            this.clipCode.setHandCursor(true);//鼠标手型
            this.clipUrl.setHandCursor(true);//鼠标手型
            this.clipPro.setHandCursor(true);//鼠标手型

            this.open(opts);
            this.openSet(opts);
            this.closeSet(opts);
            this.uploadImg(opts);
            this.cut(opts);
            this.closeHot(opts);

            this.preview(opts);
            this.insertCode(opts);
            this.copyUrl(opts);
            this.initCopyCode(opts);
            this.initCopyPro(opts);
            this.delImg(opts);
            this.changeType(opts);
            this.openUrl(opts);
            this.hotType(opts);
            this.commit(opts);

            this.pro = {"mall":"","deal":""};
            this.deal = {};
            this.mall = {};
            this.mall_list = {};
            this.store_index_page = {};
            this.store_subpage = {};
            this.store_mall_list = {};
            this.custom = {};
            this.special_activity = {};
            this.freepie = {};
            this.imgW = 0;
            this.imgH = 0;
            this.imgUrl = "";
            this.moduleId = "";
            this.maxWidth = 1920;
            this.newcut = true;
            this.tempCode = "";
            this.wrap;//每个热区模块的包含模块


            $.ajaxSetup({
                async: false
            });
            $(opts.modal).find(".close, .close-btn").click(function(){
                //坚持是否有未编辑或者未保存的内容
                var flag = true;
                $(".hotspot").each(function(){
                    if(!JMStore.CutImg.getData(opts,this.id)){
                        alert("当前还有未编辑过的热区，请编辑后再保存");
                        flag = false;
                        return false;
                    }
                });
                if(flag){
                    var code = JMStore.CutImg.setCode(opts).replace(/[\r|\n]/g, " ").replace(/\s+/g, " ").replace(/&amp;/g, "&");//替换掉换行符，空格，制表符
                    //code = code.replace(/\s|\n|\r/g, '')
                    if( JMStore.CutImg.tempCode.replace(/[\r|\n]/g, " ").replace(/\s+/g, " ").replace(/&amp;/g, "&")!= code){
                        if(confirm("是否保存当前修改？")){
                            $("#commit").click();
                        }else{
                            JMStore.CutImg.clear(opts);
                            $(opts.img_center).css({"border":"none"});
                            $(".text-error").hide();
                        }
                    }else{
                        JMStore.CutImg.clear(opts);
                        $(opts.img_center).css({"border":"none"});
                        $(".text-error").hide();
                    }
                }
                return false;
            });
            $("#Modal-c").delegate(".hotspot","click",function(e){
                return false;
                e.stopPropagation();
            });
            $(".modal-body").mousedown(function(e){
                //e.stopPropagation();//for firfox，¬阻止弹出框除头部以外其他地方按住会拖动
            });

            $(opts.jumpType).unbind('click').bind("change", function () {
                JMStore.CutImg.changeType(opts);
            });

            opts.code = JMStore.CutImg.setCode(opts);

            $("input[name=upImg]").click(function(){
                var target = $(this).attr("data-target");
                $(".tab").hide();
                $(target).show();
            });

            $(opts.linkWrap).delegate(opts.saveSetting,"click",function(){
                var hotType = $(opts.hotType).val();
                JMStore.CutImg.saveSet(opts,hotType);
            });

            $(opts.linkWrap).delegate(".add_baijia_pro","click",function(){
                var len = $("#baijia").find("p").length;
                if (len <= 50) {
                    var $html = $('<p class="clearfix"><lable>品牌ID</lable> <input type="text" value=""/><span></span> <a href="javascrip:;" class="del_baijia_pro">删除</a></p>');
                    $html.appendTo( $("#baijia")).find("input").focus();
                }else{
                    alert("最多添加50个品牌！");
                }
                return false;
            });
            $(opts.linkWrap).delegate(".del_baijia_pro","click",function(){
                var _this = $(this);
               if(confirm("是否确认删除该品牌？")){
                   _this.closest("p").remove();
               }
               return false;
            });

            $(opts.linkWrap).undelegate("#baijia input","blur").delegate("#baijia input","blur",function(){
                var _this = $(this);
                var $inputs = _this.closest("p").siblings().find("input"),isRepeat = false;
                if (_this.val()) {
                    for(i=0; i<$inputs.length; i++){
                        if($inputs[i].value == _this.val()){
                            isRepeat = true;
                            break;
                        }
                    }
                    if(!isRepeat){
                        var brand_id = [];
                        brand_id.push(_this.val());
                        var verifyType = "brand";
                        if(opts.partner_type){
                            verifyType = opts.partner_typetext;

                        }
                        $.post("/SpecialActivity/AjaxVerify",{"param":brand_id,"verifyType":verifyType}, function(data) {
                            data=JSON.parse(data);
                            if (data.error == 0) {
                                _this.next().text(data.message).removeClass("red");
                            }else{
                                _this.next().text(data.message).addClass("red");
                            }
                        });
                        $(".text-error").html("").hide();
                    }else{
                        _this.next().text("产品ID 添加重复！").addClass("red");
                    }
                }
                return false;
            });

            //倒计时相关
            var fontsize_option = "", spacing_option = "";
            for( var i=1; i<=100; i++){
                spacing_option += '<option value="' + i + '">' + i + '像素</option>';
            }
            for( var i=12; i<=100; i++){
                fontsize_option += '<option value="' + i + '">' + i + '号</option>';
            }
            $("#countdown_fontsize").html(fontsize_option).val("30");
            $("#countdown_spacing").html(spacing_option).val("24");
            var date=new Date(Math.round(new Date().getTime())+parseInt(86400*1000));
            this.default_time=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+(date.getDate())+' 09:59:59';
            var maxDate = new Date(new Date().getTime() + (99*24*60*60*1000));
            $("#countdown_end_time").val(this.default_time).datetimepicker({
                maxDate: 99
            });
            $(".colorSelector").initLayout({ zIndex:10});//取色控件初始化
        },
        //切片类型
        hotType:function(opts){

            $(".ctr").delegate(opts.hotType,"change",function(){
                $(opts.hotType).trigger("liszt:updated");
                var val = this.value;
                var data = {};
                data = JMStore.CutImg.getData(opts,opts.hotspot[0].id);
                if(val == "link"){
                    $(".hotType").hide();$("#linkWrap").show();
                    if(data && data.array.length){
                        $(opts.jumpType).val(data.type);
                        $(opts.jumpType).trigger("liszt:updated");
                        JMStore.CutImg.changeType(opts);
                        var $inputs = $(opts.settingUrl+" input");
                        for(i=0; i<$inputs.length; i++){
                            $inputs[i].value = data.array[i]
                        }
                        if(data.target == "a"){
                            $("#radio-lable-a").html('<input type="radio" name="open-w" id="a" checked/>当前页');
                            $("#radio-lable-b").html('<input type="radio" name="open-w" id="b"/>新页面');
                            $("#a,#b").uniform();
                        }else{
                            $("#radio-lable-a").html('<input type="radio" name="open-w" id="a"/>当前页');
                            $("#radio-lable-b").html('<input type="radio" name="open-w" id="b" checked/>新页面');
                            $("#a,#b").uniform();
                        }
                    }
                }else if(val == "video"){
                    $(".hotType").hide();$("#videoWrap").show();
                    if(data && data.videoW){
                        $("#videoW").val(parseInt(data.videoW));
                        $("#videoH").val(parseInt(data.videoH));
                        $("#videoCode").val(data.videoCode);
                    }else{
                        $("#videoW").val(parseInt(opts.hotspot.width()));
                        $("#videoH").val(parseInt(opts.hotspot.height()));
                        $("#videoCode").val("");
                    }
                }else if(val == "popup"){
                    $(".hotType").hide(); $("#popupWrap").show();
                    if(data && data.popupPath){
                        $("#popupPath").val(data.popupPath);
                    }else{
                        $("#popupPath").val("");
                    }
                }else if(val == "brand"){
                    $(".hotType").hide();$("#brandWrap").show();
                    if(data && data.brand){
                        var title = document.getElementById('brand');
                        for(var i=0;i<title.options.length;i++){
                            if(title.options[i].innerHTML == data.brand){
                                title.options[i].selected = true;
                                break;
                            }
                        }
                        $("#brand").trigger("liszt:updated");
                    }

                }else if(val == "hotik"){
                    $(".hotType").hide();$("#hotikWrap").show();
                    if(data && data.hotik){
                        $("#hotik").val(data.hotik);
                    }else{
                        $("#hotik").val("");
                    }
                }else if(val == "baijia"){
                    if($(".hotspot").filter(".baijiabox").length>0){
                        alert("每个热区只能添加一个败家模块！");
                        $(opts.hotspot).trigger("dblclick");
                    }else{
                        $(".hotType").hide(); $("#baijiaWrap").show();
                        if(opts.roleType){
                            if(data && data.baijia_id){
                                var title = document.getElementById('baijia');
                                for(var i=0;i<title.options.length;i++){
                                    if(title.options[i].innerHTML == data.baijia){
                                        title.options[i].selected = true;
                                        break;
                                    }
                                }
                                $("#baijia").trigger("liszt:updated");
                            }
                        }else{
                            if(data && data.baijia_id.length){
                                var html = '';
                                for(i=0; i < data.baijia_id.length; i++){
                                    if(i == 0){
                                        html += '<p class="clearfix"><lable>品牌ID</lable> <input type="text" value="' + data.baijia_id[i] +'"/><span>' + data.baijia_name[i] +'</span></p>';
                                    }else{
                                        html += '<p class="clearfix"><lable>品牌ID</lable> <input type="text" value="' + data.baijia_id[i] +'"/><span>' + data.baijia_name[i] +'</span><a href="javascrip:;" class="del_baijia_pro">删除</a></p>';
                                    }
                                }
                                $("#baijia").html(html);
                            }else{
                                $("#baijia").html('<p class="clearfix"><lable>品牌ID</lable> <input type="text"/><span></span></p>').show();
                            }

                        }
                    }
                }else if(val == "anchor"){
                    var anchor = "";
                    if(data && data.anchor){
                        anchor = data.anchor;
                    }
                    $("#anchor").val(anchor);
                    $(".hotType").hide();
                    $("#anchorWrap").show();
                }else if( val == "countdown"){
                    if(data && data.countdown){
                        var countdown;
                        if(typeof(data.countdown) == "string"){
                            countdown = eval('('+data.countdown+')');
                        }else{
                            countdown = data.countdown;
                        }
                        for(key in countdown){
                            if((key == "countdown_weight" ||  key == "countdown_set_day" || key == "countdown_set_millisecond")){
                                if(countdown[key] == "1"){
                                    $("#countdownWrap").find('#'+key).prop("checked",true);
                                }else{
                                    $("#countdownWrap").find('#'+key).prop("checked",false);
                                }
                            }else{
                                $("#countdownWrap").find('#'+key).val(countdown[key]);
                            }
                        }
                    }else{
                        $("#countdown_fontsize").val("30");
                        $("#countdown_spacing").val("24");
                        $("#countdown_weight").prop("checked",true);
                        $("#countdown_set_day").prop("checked",true);
                        $("#countdown_set_millisecond").prop("checked",false);
                        $("#countdown_color").val("000000");
                        $("#countdown_end_time").val(JMStore.CutImg.default_time);
                    }
                    $("#countdown_weight,#countdown_set_day,#countdown_set_millisecond").uniform();
                    $(".colorSelector").initLayout({ zIndex:10});
                    $(".hotType").hide();
                    $("#countdownWrap").show();
                }
            });
        },
        getImgWidth:function(){
            return JMStore.CutImg.imgW;
        },
        getImgHeight:function(){
            return JMStore.CutImg.imgH;
        },
        <!--打开切图工具-->
        open:function(opts){

            $("body").delegate(opts.trigger,"click",function(){
                if($(opts.trigger).data("type")){ //旗舰店2.0里面的热区
                    var type = $(opts.trigger).data("type");
                    JMStore.CutImg.maxWidth =  type.match(/\d+$/g);//获取模块类型（宽度）

                    JMStore.CutImg.wrap =  $(this).closest(".controls");
                }else{ //专场里面的热区
                JMStore.CutImg.maxWidth =  $(this).closest(".module").find(".w").text();//获取模块类型（宽度）

                JMStore.CutImg.moduleId = $(this).closest(".module").attr("id");
                    JMStore.CutImg.wrap = $("#"+JMStore.CutImg.moduleId);
                }

                JMStore.CutImg.tempCode = "";
                if( JMStore.CutImg.wrap.find(".cutCode").val() != ''){
                    var code = JMStore.CutImg.wrap.find(".DataEdit").val();
                    var editData = eval('(' + code + ')');
                    var imgPath = JMStore.CutImg.wrap.find(".cutImage").val();
                    var cutCode = JMStore.CutImg.wrap.find(".cutCode").val().replace(/url\("([a-zA-Z0-9\/\._:]+)"\)/g,"url($1)");//过滤url中的双引号
                    JMStore.CutImg.tempCode = cutCode;
                    var hotInner = '<span class="h-w"></span><span class="h-h"></span><span class="h-close"></span><span class="handle resizable-e"></span><span class="handle resizable-s"></span><span class="handle resizable-se"></span>';

                    JMStore.CutImg.imgUrl = imgPath;
                    JMStore.CutImg.newcut = false;
                    JMStore.CutImg.pro = eval('(' + JMStore.CutImg.wrap.find(".Property").val() + ')');
                    opts.imgName = JMStore.CutImg.setFilename(imgPath);
                    if(editData.cutData){
                        opts.data = editData.cutData;
                    }
                    var img = new Image();
                    img.src = imgPath;
                    img.onload = function(){
                        JMStore.CutImg.imgW = img.width;
                        JMStore.CutImg.imgH = img.height;
                        $(".img_wrap").attr("style","height:"+JMStore.CutImg.imgH+"px;width:"+JMStore.CutImg.imgW+"px").html(cutCode+'<div class="tip" style="display: none;">请上传图片</div>').find(".hotspot").each(function(){
                            $(this).append(hotInner);
                            $(this).find(".ui-resizable-handle").remove();
                        });
                        $(".hotspot").each(function(){
                            var _this = $(this);data = JMStore.CutImg.getData(opts,this.id);
                            if(data){
                                if(data.hotType == "link"){
                                    $('<span class="h-type">热区类型：链接</span>').appendTo($(this));
                                }else if(data.hotType == "video"){
                                    $('<span class="h-type">热区类型：视频</span>').appendTo($(this));
                                }else if(data.hotType == "popup"){
                                    $('<span class="h-type">热区类型：弹出层</span>').appendTo($(this));
                                }else if(data.hotType == "brand"){
                                    $('<span class="h-type">热区类型：收藏品牌</span>').appendTo($(this));
                                }else if(data.hotType == "hotik"){
                                    $('<span class="h-type">热区类型：点击领券</span>').appendTo($(this));
                                }else if(data.hotType == "baijia"){
                                    $('<span class="h-type">热区类型：败家排行</span>').appendTo($(this));
                                }else if(data.hotType == "anchor"){
                                    $('<span class="h-type">热区类型：定位至模块</span>').appendTo($(this));
                                }else if(data.hotType == "countdown"){
                                    $('<span class="h-type">热区类型：倒计时</span>').appendTo($(this));
                                    var options = {
                                        container: _this,
                                        endTime : _this.attr("endTime"),
                                        fontSize: _this.attr("fontSize"),
                                        fontColor: "#"+_this.attr("fontColor"),
                                        fontBold: _this.attr("fontBold"),
                                        spacing: _this.attr("spacing"),
                                        setDay: _this.attr("setDay"),
                                        setMilisec: _this.attr("setMilisec"),
                                        hasAminate: false
                                    };
                                    new window.CountDown(options);
                                }
                            }else{
                                $('<span class="h-type">请双击编辑热区</span>').appendTo($(this));
                            }
                        });
                        if(img.width > $(opts.img_center).width()){
                            $(opts.img_center).css({"border":"1px dashed #FF3366"});
                        }else{
                            $(opts.img_center).css({"border": "none"});
                        }
//                        $(opts.img_center).css({"max-width":"960px","width":"auto"});
                        var qw = $(opts.modal).width(), qh = $(opts.modal).height();
                        $(opts.modal).css({top:(opts.wh - qh) * 382 / 1000,left:(opts.ww-qw)/2});
                    }

                    var img_ab = '图片尺寸： <span id="size">'+JMStore.CutImg.imgW+'*'+JMStore.CutImg.imgH+'</span>，图片地址： <a class="img-url" target="_blank" href="'+imgPath+'">'+imgPath+'</a>'+
                        '<a href="javascript:;" id="copyUrl"><div id="text-success">图片地址复制成功！</div><i class="icon-copy"></i>复制</a>'+
                        '<a href="###" id="delImg"><i class="icon-del"></i>删除</a>';
                    $(".img_ab").html(img_ab).removeClass("v_hidden");
                }
                var qw = $(opts.modal).width(), qh = $(opts.modal).height();
                $(opts.modal).css({top:(opts.wh - qh) * 382 / 1000,left:(opts.ww-qw)/2});
                $(opts.modal).removeClass("v_hidden");
//                $("html").css("overflow","hidden");
                $(".mask").show();
                return false;
            });
        },
        <!--打开设置-->
        openSet:function(opts){
            $("#Modal-c").delegate(".hotspot","dblclick",function(e){
                opts.hotspot = $(this);
                var data = {};
                data = JMStore.CutImg.getData(opts,opts.hotspot[0].id);
                if(data){
                    $(opts.hotType).val(data.hotType);
                    $(opts.hotType).trigger("liszt:updated");
                    if(data.hotType == "link"){
                        $(".hotType").hide();$("#linkWrap").show();
                        $(opts.jumpType).val(data.type);
                        $(opts.jumpType).trigger("liszt:updated");
                        JMStore.CutImg.changeType(opts);
                        var $inputs = $(opts.settingUrl+" input");
                        for(i=0; i<$inputs.length; i++){
                            $inputs[i].value = data.array[i]
                        }
                        if(data.target == "a"){
                            $("#radio-lable-a").html('<input type="radio" name="open-w" id="a" checked/>当前页');
                            $("#radio-lable-b").html('<input type="radio" name="open-w" id="b"/>新页面');
                            $("#a,#b").uniform();
                        }else{
                            $("#radio-lable-a").html('<input type="radio" name="open-w" id="a"/>当前页');
                            $("#radio-lable-b").html('<input type="radio" name="open-w" id="b" checked/>新页面');
                            $("#a,#b").uniform();
                        }
                    }else if(data.hotType == "video"){
                        $(".hotType").hide();$("#videoWrap").show();
                        if(data.videoW){
                            $("#videoW").val(parseInt(data.videoW));
                            $("#videoH").val(parseInt(data.videoH));
                        }else{
                            $("#videoW").val(parseInt(opts.hotspot.width()));
                            $("#videoH").val(parseInt(opts.hotspot.height()));
                        }
                        $("#videoCode").val(data.videoCode);
                    }else if(data.hotType == "popup"){
                        $(".hotType").hide();$("#popupWrap").show();
                        $("#popupPath").val(data.popupPath);
                    }else if(data.hotType == "brand"){
                        $(".hotType").hide();$("#brandWrap").show();
                        var title = document.getElementById('brand');
                        for(var i=0;i<title.options.length;i++){
                            if(title.options[i].innerHTML == data.brand){
                                title.options[i].selected = true;
                                break;
                            }
                        }
                        $("#brand").trigger("liszt:updated");
                    }else if(data.hotType == "hotik"){
                        $(".hotType").hide();$("#hotikWrap").show();
                        $("#hotik").val(data.hotik);
                    }else if(data.hotType == "baijia"){
                        $(".hotType").hide();$("#baijiaWrap").show();
                        if(opts.roleType){
                        	if(data && data.baijia_id){
                                var title = document.getElementById('baijia');
                                for(var i=0;i<title.options.length;i++){
                                    if(title.options[i].innerHTML == data.baijia){
                                        title.options[i].selected = true;
                                        break;
                                    }
                                }
                                $("#baijia").trigger("liszt:updated");
                            }
                        }else{
                            if(data && data.baijia_id.length){
                                var html = '';
                                for(i=0; i < data.baijia_id.length; i++){
                                    if(i == 0){
                                        html += '<p class="clearfix"><lable>品牌ID</lable> <input type="text" value="' + data.baijia_id[i] +'"/><span>' + data.baijia_name[i] +'</span></p>';
                                    }else{
                                        html += '<p class="clearfix"><lable>品牌ID</lable> <input type="text" value="' + data.baijia_id[i] +'"/><span>' + data.baijia_name[i] +'</span><a href="javascrip:;" class="del_baijia_pro">删除</a></p>';
                                    }
                                }
                                $("#baijia").html(html);
                            }else{
                                $("#baijia").html('<p class="clearfix"><lable>品牌ID</lable> <input type="text"/><span></span></p>').show();
                            }
                        }
                    }else if(data.hotType == "anchor"){
                        var anchor = "";
                        if(data && data.anchor){
                            anchor = data.anchor;
                        }
                        $("#anchor").val(anchor);
                        $(".hotType").hide();
                        $("#anchorWrap").show();
                    }else if( data.hotType == "countdown"){
                        if(data && data.countdown){
                            var countdown;
                            if(typeof(data.countdown) == "string"){
                                countdown = eval('('+data.countdown+')');
                            }else{
                                countdown = data.countdown;
                            }
                            for(key in countdown){
                                if((key == "countdown_weight" ||  key == "countdown_set_day" || key == "countdown_set_millisecond")){
                                    if(countdown[key] == "1"){
                                        $("#countdownWrap").find('#'+key).prop("checked",true);
                                    }else{
                                        $("#countdownWrap").find('#'+key).prop("checked",false);
                                    }
                                }else{
                                    $("#countdownWrap").find('#'+key).val(countdown[key]);
                                }
                            }
                        }else{
                            $("#countdown_fontsize").val("30");
                            $("#countdown_spacing").val("24");
                            $("#countdown_weight").prop("checked",true);
                            $("#countdown_set_day").prop("checked",true);
                            $("#countdown_set_millisecond").prop("checked",false);
                            $("#countdown_color").val("000000");
                            $("#countdown_end_time").val(JMStore.CutImg.default_time);
                        }
                        $("#countdown_weight,#countdown_set_day,#countdown_set_millisecond").uniform();
                        $(".colorSelector").initLayout({ zIndex:10});
                        $(".hotType").hide();
                        $("#countdownWrap").show();
                    }
                }else{
                    $(opts.hotType).val("link");
                    $(opts.hotType).trigger("liszt:updated");
                    $(".hotType").hide();
                    $("#linkWrap").show();
                    $(opts.jumpType).val("img_deal");
                    $(opts.jumpType).trigger("liszt:updated");
                    JMStore.CutImg.changeType(opts);
                    $(opts.settingUrl+" input").val("");
                    $("#radio-lable-a").html('<input type="radio" name="open-w" id="a"/>当前页');
                    $("#radio-lable-b").html('<input type="radio" name="open-w" id="b" checked/>新页面');
                    $("#a,#b").uniform();
                }
                $(".text-error").hide();
                var ow = $(opts.linkWrap).width(),oh = $(opts.linkWrap).height();
                var l = (opts.ww-ow)/ 2, t = (opts.wh-oh)*383/1000;
                $(opts.linkWrap).css({"top":t,"left":l}).removeClass("v_hidden");
                $(opts.modalShade).show();
                e.stopPropagation();//阻止冒泡
                return false;
            });
        },
        <!--获取数据-->
        getData:function(opts,obj){
            var data=null;
            $.each(opts.data, function(i, item) {
                if(item.obj == obj){
                    data = item;
                }
            });
            return data;
        },
        <!--删除数据-->
        delData:function(opts,obj_id){
            var k=[];
            $.each(opts.data, function(i, val) {
                if(val.obj == obj_id){
                    k.push(i);
                }
            });
            $.each(k,function(i,val){
                opts.data.splice(val,1);
            });
        },
        <!--保存数据-->
        setData: function (opts, hotType, type, array, target, videoCode, videoW, videoH, brand, brandId, popupPath,hotik,baijia_id,baijia_name,anchor,countdown) {
            var item = {
                obj:opts.hotspot[0].id,
                hotType:hotType,
                type:type,
                array:array,
                target:target,
                videoCode:videoCode,
                videoW:videoW,
                videoH:videoH,
                brand:brand,
                brandId:brandId,
                popupPath:popupPath,
                hotik:hotik,
                baijia_id:baijia_id,
                baijia_name:baijia_name,
                anchor:anchor,
                countdown:countdown
            };
            var k=[];
            $.each(item,function(i){
                if(!item[i]){
                    k.push(i);
                }
            });
            $.each(k,function(i,val){
                delete item[val];
            });//删除为空的属性

            JMStore.CutImg.delData(opts,item.obj);//删除已经存在的旧数据
            opts.data.push(item);
        },
        <!--保存设置-->
        saveSet: function (opts,hotType){
                var flag = true;
                if(hotType == "link"){
                    var url = JMStore.CutImg.getUrl(opts);
                    if(url){
                        opts.hotspot.attr("href",url);
                        var checkedId = "";
                        if($("#b:checked").length > 0){
                            opts.hotspot.attr("target","_blank");
                            checkedId = "b";
                        }else{
                            opts.hotspot.attr("target","_self");
                            checkedId = "a";
                        }
                        var type = $(opts.jumpType).val();
                        var $inputs = $(opts.settingUrl+" input"),val=[];
                        var $img_url = $(opts.settingUrl+" .cust_url input");

                        for(var i=0; i<$inputs.length; i++){
                            if($(opts.jumpType).val()=="img_url"){

                                val.push(JMStore.CutImg.filterUrl($inputs[i].value));
                            }else{
                                val.push($inputs[i].value);
                            }

                        }

                        //设置热区属性
                        var json_val = {};
                        function getDataAttr(dataAttr){
                            for(i=0; i<opts.dataAttr.length; i++){
                                if($inputs[i]){
                                    json_val[opts.dataAttr[i]]=$inputs[i].value;
                                }
                            }
                            json_val["url"]=url;
                        }

                        //链接从deal改为mall（其他类型）的时候，需要删除之前的数据
                        var clearData = function(id){
                            $.each(JMStore.CutImg.pro, function (i,val) {
                                var pro_i = i;
                                $.each(JMStore.CutImg.pro[i],function(k,item){
                                    if( k == id) {
                                        delete JMStore.CutImg.pro[pro_i][k];
                                    }
                                });
                            });
                        };

                        var linkType = $(opts.jumpType).val();
                        switch (linkType) {
                            case 'img_deal':
                                opts.dataAttr=["hash_id"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.deal[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["deal"]=jQuery.extend(JMStore.CutImg.pro["deal"], JMStore.CutImg.deal);
                                break;
                            case 'global_deal':
                                opts.dataAttr=["hash_id"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.deal[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["deal"]=jQuery.extend(JMStore.CutImg.pro["deal"], JMStore.CutImg.deal);
                                break;
                            case 'global_combination_deal':
                                opts.dataAttr=["hash_id","combination_id"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.deal[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["deal"]=jQuery.extend(JMStore.CutImg.pro["deal"], JMStore.CutImg.deal);
                                break;
                            case 'img_mall_list':
                                opts.dataAttr=["product_list"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.mall_list[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["mall_list"]=jQuery.extend(JMStore.CutImg.pro["mall_list"], JMStore.CutImg.mall_list);
                                break;
                            case 'product':
                                opts.dataAttr=["product_id"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.mall[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["mall"]=jQuery.extend(JMStore.CutImg.pro["mall"], JMStore.CutImg.mall);
                                break;
                            case 'store_domain':
                                opts.dataAttr=["store"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.store_index_page[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["store_index_page"]=jQuery.extend(JMStore.CutImg.pro["store_index_page"], JMStore.CutImg.store_index_page);
                                break;
                            case 'img_store_page':
                                opts.dataAttr=["store","store_page"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.store_subpage[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["store_subpage"]=jQuery.extend(JMStore.CutImg.pro["store_subpage"], JMStore.CutImg.store_subpage);
                                break;
                            case 'img_store_list':
                                opts.dataAttr=["store","product_list"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.store_mall_list[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["store_mall_list"]=jQuery.extend(JMStore.CutImg.pro["store_mall_list"], JMStore.CutImg.store_mall_list);
                                break;
                            case 'img_url':
                                opts.dataAttr=["url"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.custom[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["custom"]=jQuery.extend(JMStore.CutImg.pro["custom"], JMStore.CutImg.custom);
                                break;
                            case 'img_session':
                                opts.dataAttr=["img_session"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.special_activity[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["special_activity"]=jQuery.extend(JMStore.CutImg.pro["special_activity"], JMStore.CutImg.special_activity);
                                break;
                            case 'img_freepie_detail':
                                opts.dataAttr=["freepie_id"];
                                getDataAttr();
                                clearData(opts.hotspot[0].id);
                                JMStore.CutImg.freepie[opts.hotspot[0].id]=json_val;
                                JMStore.CutImg.pro["freepie"]=jQuery.extend(JMStore.CutImg.pro["freepie"], JMStore.CutImg.freepie);
                                break;
                            default:
                                break;
                        }

                        var text = JSON.stringify(JMStore.CutImg.pro);
                        JMStore.CutImg.clipPro.setText(text);
                        //热区数据
                        if(opts.hotspot.find("iframe").length>0){
                            opts.hotspot.find("iframe").remove();
                            opts.hotspot.removeAttr("data-swf");
                        }
                        JMStore.CutImg.setData(opts,hotType,type,val,checkedId);
                        //复制代码
                        opts.hotspot.addClass("linkbox").removeClass("videobox popupbox brandbox hotikbox baijiabox anchorbox countdown").removeAttr("data-swf data-url brand brand_id hotik");
                        JMStore.CutImg.copyCode(opts);

                        opts.hotspot.find(".h-type").text("热区类型：链接");
                        $inputs.val("");
                    }else {
                        return false;
                    }
                }else if(hotType == "video"){
                    var videoCode = $.trim($("#videoCode").val()),videoW = $.trim($("#videoW").val()),videoH = $.trim($("#videoH").val());
                    //检查swf格式
                    var reg = /(http|https|ftp):\/\/([^\/\\]*)[^\'\">][^\s\;]*\.swf$/ig;
                    if(videoCode==''||videoW==''||videoH==''){
                        $(".text-error").html("请输入swf地址和宽高！").show();
                        return false;
                    }else if(match = reg.exec(videoCode)){
                        //热区数据
                        opts.hotspot.removeAttr("href");
                        JMStore.CutImg.setData(opts,hotType,"",[],"",videoCode,videoW,videoH);
//                        var swfIframe = '<iframe src="' + videoCode + '" width="'+videoW+'" height="'+videoH+'" frameborder="0" allowfullscreen=""></iframe>'
//                        if(opts.hotspot.find("iframe").length){
//                            opts.hotspot.find("iframe").attr({"src":videoCode,"width":videoW,"height":videoH});
//                        }else{
//                            opts.hotspot.append(swfIframe);
//                        }
                        var swfIframe = '<embed src="' + videoCode + '" width="'+videoW+'" height="'+videoH+'" allowFullScreen="true" wmode="opaque" />';
                        if(opts.hotspot.find("iframe").length){
                            opts.hotspot.find("iframe").remove();
                        }else if(opts.hotspot.find("embed").length){
                            opts.hotspot.find("embed").attr({"src":videoCode,"width":videoW,"height":videoH});
                        }else{
                            opts.hotspot.append(swfIframe);
                        }
                        opts.hotspot.addClass("videobox").removeClass("linkbox popupbox brandbox hotikbox baijiabox anchorbox countdown").attr({"data-swf":videoCode}).removeAttr("data-url brand brand_id hotik");
                        JMStore.CutImg.copyCode(opts);
                        opts.hotspot.find(".h-type").text("热区类型：视频");
                    }else{
                        $(".text-error").html("请输入正确的swf地址！").show();
                        return false;
                    }
                }else if(hotType == "popup"){
                    var popupPath = $.trim($("#popupPath").val());
                    if(popupPath==''){
                        $(".text-error").html("请输入弹出层地址！").show();
                        return false;
                    }else if(JMStore.CutImg.validateUrl(opts,popupPath)){
                        //热区数据
                        if(opts.hotspot.find("iframe").length>0){
                            opts.hotspot.find("iframe").remove();
                            opts.hotspot.removeAttr("data-swf");
                        }
                        JMStore.CutImg.setData(opts,hotType,"",[],"","","","","","",popupPath);
                        opts.hotspot.addClass("popupbox").removeClass("linkbox videobox brandbox hotikbox baijiabox anchorbox countdown").attr({"data-url":popupPath,"href":"#"}).removeAttr("data-swf brand brand_id hotik");
                        JMStore.CutImg.copyCode(opts);
                        opts.hotspot.find(".h-type").text("热区类型：弹出层");
                    }else{
                        $(".text-error").html("图片地址不合法，请重新输入").show();
                        return false;
                    }
                }else if(hotType == "hotik"){
                    var hotik = $("#hotik").val();
                    if(hotik==''){
                        $(".text-error").html("请输入现金券链接！").show();
                        return false;
                    }
                    $.post(opts.hotiklink,{ 'hotiklink':hotik},function(data){ // 现金券链接验证
                        if(data == false){
                            $(".text-error").html("您输入的现金券链接不合法！").show();
                            flag = false;
                        }else{
                            //热区数据
                            if(opts.hotspot.find("iframe").length>0){
                                opts.hotspot.find("iframe").remove();
                                opts.hotspot.removeAttr("data-swf");
                            }
                            JMStore.CutImg.setData(opts,hotType,"",[],"","","","","","","",hotik);
                            opts.hotspot.addClass("hotikbox").removeClass("linkbox videobox popupbox brandbox baijiabox anchorbox countdown").attr({"hotik":hotik,"href":"#"}).removeAttr("data-swf data-url brand brand_id");
                            JMStore.CutImg.copyCode(opts);
                            opts.hotspot.find(".h-type").text("热区类型：点击领券");

                        }
                    }, 'json');
                }else if(hotType == "brand"){
                    var brand = $("#brand option:selected").text(),brandId = $("#brand option:selected").val();
                    if(brand==''||brandId==''){
                        $(".text-error").html("请输入品牌名和ID！").show();
                        return false;
                    }
                    //热区数据
                    if(opts.hotspot.find("iframe").length>0){
                        opts.hotspot.find("iframe").remove();
                        opts.hotspot.removeAttr("data-swf");
                    }
                    JMStore.CutImg.setData(opts,hotType,"",[],"","","","",brand,brandId);
                    opts.hotspot.addClass("brandbox").removeClass("linkbox videobox popupbox hotikbox baijiabox anchorbox countdown").attr({"brand":brand,"brand_id":brandId,"href":"#"}).removeAttr("data-swf data-url hotik");
                    JMStore.CutImg.copyCode(opts);
                    opts.hotspot.find(".h-type").text("热区类型：收藏品牌");
            }else if(hotType == "baijia"){
                    if(opts.roleType){
                        var baijiaName = $("#baijia option:selected").text(),baijiaId = $("#baijia option:selected").val();
                    }else{
                        var $inputs = $("#baijia input"),$baijia_name = $("#baijia span"), baijiaId = [],baijiaName =[];
                        for(i=0; i<$inputs.length; i++){
                            baijiaId.push($inputs[i].value);
                            if($inputs[i].value == ""){
                                flag = false;
                                $(".text-error").html("请输入品牌ID！").show();
                            }else{
                                flag = true;
                                $(".text-error").html("").hide();
                            }
                        }
                        for(i=0; i< $baijia_name.length; i++){
                            baijiaName.push($baijia_name[i].innerHTML);
                        }
                        $baijia_name.each(function(){
                            if($(this).hasClass("red")){
                                flag = false;
                            }
                        });
                    }
                    var cw = opts.hotspot.width(),ch = opts.hotspot.height();
                    if($(opts.img_center).width()< 290 || $(opts.img_center).height() < 220){
                        alert("当前热区尺寸不符合最低要求：290(宽)*220(高)，请修改");
                        return false;
                    }
                    if(cw < 290){
                        var maxW = $(opts.img_center).width() - opts.hotspot.position().left;
                        if(maxW < 290){
                            opts.hotspot.css({
                                "width":"290px",
                                "left":"auto",
                                "right":0
                            });
                        }else{
                            opts.hotspot.css({
                                "width":"290px",
                                "right":"auto"
                            });
                        }
                    }
                    if(ch < 220){
                        var maxH = $(opts.img_center).height() - opts.hotspot.position().top;
                        if(maxH < 220){
                            opts.hotspot.css({
                                "height":"220px",
                                "top":"auto",
                                "bottom":0
                            });
                        }else{
                            opts.hotspot.css({
                                "height":"220px",
                                "bottom":"auto"
                            });
                        }
                    }
                    //热区数据
                    if(opts.hotspot.find("iframe").length>0){
                        opts.hotspot.find("iframe").remove();
                        opts.hotspot.removeAttr("data-swf");
                    }
                    if(flag){
                        if(opts.roleType){
                            JMStore.CutImg.setData(opts,hotType,"",[],"","","","","","","","",baijiaId,baijiaName);
                        }else{
                            JMStore.CutImg.setData(opts,hotType,"",[],"","","","","","","","",baijiaId,baijiaName);
                        }
                        opts.hotspot.addClass("baijiabox").removeClass("linkbox videobox brandbox hotikbox popupbox anchorbox countdown").attr({"baijia_id":baijiaId.toString(),"baijia_name":baijiaName.toString(),"href":"#"}).removeAttr("data-swf data-url brand brand_id hotik");
                        JMStore.CutImg.copyCode(opts);
                        opts.hotspot.find(".h-type").text("热区类型：败家排行");
                    }
            }else if(hotType == "anchor"){
                var anchor = $.trim($("#anchor").val());
                if(anchor==''){
                    $(".text-error").html("请输入模块名称！").show();
                    return false;
                }else{
                    //热区数据
                    if(opts.hotspot.find("iframe").length>0){
                        opts.hotspot.find("iframe").remove();
                        opts.hotspot.removeAttr("data-swf");
                    }
                    var hasName = false ,errorTime = false;
                    if (opts.fromPage == "Flagship") { //旗舰店2.0里面的热区
                        flag = false;
                        var module_title = [];
                        require(["flagship/module_list","flagship/functions"], function(module_list,common) {
                            var current_start_ime = Date.parse(common.dateFormat($("[name='startTime']").val()));
                            var current_end_ime = Date.parse(common.dateFormat($("[name='endTime']").val()));
                            $.each(module_list.source,function(i, item){
                                var content = item.content? eval('(' + item.content + ')'):false;
                                if(content && content.startTime && content.endTime){
                                    var startTime = Date.parse(common.dateFormat(content.startTime));
                                    var endTime = Date.parse(common.dateFormat(content.endTime));
                                    if(startTime <=  current_start_ime &&  current_end_ime<= endTime) {
                                        module_title.push(item.module_title);
                                    }else{
                                        if(item.module_title == anchor){
                                            errorTime = true;
                                            return false;
                                        }
                                    }
                                }else{
                                    module_title.push(item.module_title);
                                }
                            });
                            $.each(module_title, function(i, item){
                                if(item == anchor){
                                    hasName = true;
                                    return false;
                                }
                            });
                            if(hasName){
                                JMStore.CutImg.setData(opts,hotType,"",[],"","","","","","","","","","",anchor);
                                opts.hotspot.addClass("anchorbox").removeClass("linkbox videobox brandbox hotikbox baijiabox popupbox countdown").attr({"href":"#model_"+anchor}).removeAttr("data-swf").removeAttr("brand").removeAttr("brand_id").removeAttr("hotik").removeAttr("data-url");
                                JMStore.CutImg.copyCode(opts);
                                opts.hotspot.find(".h-type").text("热区类型：定位至模块");
                            }else{
                                if(errorTime){
                                    $(".text-error").html("被定位模块的在线时间必须包含此热区的在线时间。").show();
                                }else{
                                    $(".text-error").html("模块名称不存在，请重新输入！").show();
                                }
                                return false;
                            }
                            $(opts.linkWrap).addClass("v_hidden");
                            $(".modal-shade").hide();
                            $(".text-error").html("").hide();
                        });
                    }else{
                        $("input[data-name='[name]']").each(function(){
                            if(this.value == anchor){
                                hasName = true;
                                return false;
                            }
                        });
                        if(hasName){
                            JMStore.CutImg.setData(opts,hotType,"",[],"","","","","","","","","","",anchor);
                            opts.hotspot.addClass("anchorbox").removeClass("linkbox videobox brandbox hotikbox baijiabox popupbox countdown").attr({"href":"#model_"+anchor}).removeAttr("data-swf brand brand_id hotik data-url");
                            JMStore.CutImg.copyCode(opts);
                            opts.hotspot.find(".h-type").text("热区类型：定位至模块");
                        }else{
                            $(".text-error").html("模块名称不存在，请输入正确的模块名称！").show();
                            return false;
                        }
                    }
                    }
                }else if(hotType == "countdown"){
                    if(!$("#countdown_end_time").val()){
                        $(".text-error").html("请输入倒计时结束时间！").show();
                        return false;
                    }else{
                        var countdown_data = JMStore.CutImg.serializeObject($("#countdownWrap"));
                        JMStore.CutImg.setData(opts,hotType,"",[],"","","","","","","","","","","",countdown_data);
                        var countdown_end_time = Math.round(Date.parse(countdown_data.countdown_end_time.replace(/-/g,'/')));
                        opts.hotspot.addClass("countdown").removeClass("linkbox videobox brandbox hotikbox baijiabox popupbox anchorbox").removeAttr("href data-swf brand brand_id hotik data-url").attr({"href":"javascript:;", "fontColor": countdown_data.countdown_color, "endTime": countdown_end_time, "fontSize":countdown_data.countdown_fontsize, "setDay":countdown_data.countdown_set_day,"setMilisec":countdown_data.countdown_set_millisecond,"spacing":countdown_data.countdown_spacing,"fontBold":countdown_data.countdown_weight });
                        opts.hotspot.css("cursor","default");
                        JMStore.CutImg.copyCode(opts);
                        opts.hotspot.find(".h-type").text("热区类型：倒计时");
                        opts.hotspot.find(".count_down_timer").remove();
                        var options = {
                            container: opts.hotspot,
                            endTime : countdown_end_time,
                            fontSize: countdown_data.countdown_fontsize,
                            fontColor: "#"+countdown_data.countdown_color,
                            fontBold: opts.hotspot.attr("fontBold"),
                            spacing: opts.hotspot.attr("spacing"),
                            setDay: opts.hotspot.attr("setDay"),
                            setMilisec: opts.hotspot.attr("setMilisec"),
                            hasAminate: false
                        };
                        new window.CountDown(options);
                    }
                }
                if(flag){
                    $(opts.linkWrap).addClass("v_hidden");
                    $(".modal-shade").hide();
                    $(".text-error").html("").hide();
                    $("#videoCode").val("");
                    $("#popupPath").val("");
                    $("#hotik").val("");
                    $("#anchor").val("");
                }
        },
        serializeObject:function(obj) {
            var result = {};
            var inputs = $(obj).find('input,select,textarea');
            inputs.each(function(index, input) {
                var name = $(input).attr('id');
                if(name.indexOf('[]') > -1) {
                    if(!result[name])
                        result[name] = [];
                    result[name].push($(input).val());
                }
                else if($(input).attr('type') == 'checkbox') {
                    if($(input)[0].checked) {
                        result[name] = 1;
                    }else{
                        result[name] = 0;
                    }
                }
                else
                    result[name] = $(input).val();
            });
            return result;
        },
        <!--验证图片地址-->
        validateUrl: function (opts, style) {
            var reg = /(http|https|ftp):\/\/([^\/\\]*)[^\'\">][^\s\;]*\.(jpg|jpeg|png|gif)/ig, result = true , reg2;
            if(!(match = reg.exec(style))){
                return false;
            }else{
                while ((match = reg.exec(style)) && result) {
                    var splitRule = RegExp.$2.trim(), tempResult = false;
                    $.each(opts.whiteList, function (key, val) {
                        var p = splitRule.lastIndexOf(val), len = splitRule.replace(val, '').length;
                        if (p !== -1 && p === len) {
                            tempResult = true;
                            return false;
                        }
                    });
                    result = tempResult
                }
            }
            return result;
        },
        <!--关闭并清除-->
        clear:function(opts){
            $(opts.modal).addClass("v_hidden");
            JMStore.CutImg.deal={};
            JMStore.CutImg.mall={};
//            $(opts.fileInput).val("");
//            $("#imgName").text("未选择文件");
//            $("#imgPath").val("");
            $(opts.img_map).find(".hotspot").remove();
            opts.data = [];
            $(opts.img_map).css({"background":"none","height":"150px"});
            $(opts.img_center).css({"background":"none","height":"150px"});
            $(opts.imgAb).addClass("v_hidden");
            $(opts.imgAb).addClass("#size").text("");
            $(opts.imgUrl).html("").attr("href","");
            $(opts.img_wrap).css({ "width":"500px","height":"150px"});
            $(opts.img_center).css({"border":"none"});
            $(".tip").html("请上传文件").show();
            $(".checkMsg").hide();
            $(".text-error").hide();
//            $("html").css("overflow","");
            $(".mask").hide();
        },
        <!--关闭设置-->
        closeSet:function(opts){
            $(opts.linkWrap).find(".close, .close-btn").click(function(){
                $(opts.linkWrap).addClass("v_hidden");
                $(opts.modalShade).hide();
                $(opts.settingUrl+" input").val("");
                return false;
            });
        },
        setFilename:function (filename) {
            if (filename === "") {
                filename = "未选择文件";
            } else {
                filename = filename.split(/[\/\\]+/);
                filename = filename[(filename.length - 1)];
            }
            return filename;
        },
        showImg:function(imgpath){
            var opts = this.defaultOptions;
            var $img_ab = $(opts.imgAb),
                $url = $(opts.imgUrl),
                $tipok = $(opts.tipOk),
                $tiper = $(opts.tipEr),
                $tip = $(opts.modal+" .tip");
            var img = new Image();
            img.src = imgpath + '?t=' + Math.random();
            img.onload = function(){
                var w = img.width ,h = img.height;
                if(w != JMStore.CutImg.maxWidth){
                    alert("插入图片的宽度必须等于模块宽");
                    return false;
                }
                if(h > opts.maxHeight){
                    $tiper.html("图片高度不能超过2000px！").show();
                    setTimeout(function () {
                        $tiper.fadeOut();
                    }, 2000);
                }else{
                    $tipok.show();
                    $tip.hide();
                    setTimeout(function () {
                        $tipok.fadeOut();
                    }, 2000);
                    $img_ab.removeClass("v_hidden");
                    $url.attr("href",imgpath).html(imgpath);
                    JMStore.CutImg.imgW = img.width;
                    JMStore.CutImg.imgH = img.height;
                    JMStore.CutImg.imgUrl = imgpath;
                    opts.imgName = JMStore.CutImg.setFilename(imgpath);
                    $(opts.img_center).height(img.height);
                    $(opts.img_map).height(img.height);
                    $(opts.img_wrap).css({ "width":w,"height":h});
                    $img_ab.find("#size").text(w+"*"+h);
                    var qw = $(opts.modal).width(), qh = $(opts.modal).height();
                    $(opts.modal).css({"top":(opts.wh - qh) * 382 / 1000,"left":(opts.ww-qw)/2});
                    $(opts.img_map).css("background","url("+imgpath+") center 0 no-repeat");
//                    $(opts.img_center).css("background","none");
                    if(img.width > $(opts.img_center).width()){
                        $(opts.img_center).css({"border":"1px dashed #FF3366"});
                    }else{
                        $(opts.img_center).css({"border":"none"});
                    }
                    $("#moduleAddImg").hide();
                    $("#moduleAddImg").find("iframe").attr("src","");
                }
            }
        },
        <!--ajax上传图片-->
        uploadImg:function(opts){
            //切图传图
            $("#cutAddImg").click(function(){
                var src = '/Image/ImageManager?width='+JMStore.CutImg.maxWidth+'&height='+opts.maxHeight+'&width_check_type=eq&height_check_type=leq&from=cut';
                $("#moduleAddImg").find("iframe").attr("src",src);
                if (opts.fromPage == "Flagship") { //旗舰店2.0里面的热区
                    $("#moduleAddImg").show().centerMiddle();
                }else{
                $("#moduleAddImg").show();
                }
               $(opts.modal+" .tip").html("正在加载图片...");
            });
        },
        <!--切图热区-->
        cut:function(opts){
            var draggableObj;
            var dropObj;
            var resizeObj;
            $(document)
                .bind('mousedown',function(e){
                    if(e.which === 1){
                        var target = $(e.target);
                        if(target.is(".draggable")){
                            var $wrap = target.closest('.q-modal');
                            draggableObj = $.extend({
                                pageX: e.pageX,
                                pageY: e.pageY,
                                wrap: $wrap,
                                maxLeft : $(window).width() - $wrap.width(),
                                maxTop : $(window).height() - $wrap.height()
                            }, $wrap.position());
                            $("html").addClass("ondrop");
                        }
                        else if(target.is(".h-type") || target.is(".count_down_timer") || target.is(".tens") || target.is(".units")){
                            var img_center = target.closest(opts.img_center);
                            var hotspot = target.closest(".hotspot");
                            dropObj = $.extend({
                                pageX: e.pageX,
                                pageY: e.pageY,
                                target: hotspot,
                                maxLeft: img_center.width() - target.width(),
                                maxTop: img_center.height() - target.height()
                            }, hotspot.position());
                            //create
                        }
                        //move
                        else if(target.is(".hotspot")){
                            var img_center = target.closest(opts.img_center);
                            dropObj = $.extend({
                                pageX: e.pageX,
                                pageY: e.pageY,
                                target: target,
                                maxLeft: img_center.width() - target.width(),
                                maxTop: img_center.height() - target.height()
                            }, target.position());
                        //create
                        } else if(target.is(opts.img_center)){
                            var offset = target.offset();
                            var date = new Date(),hotspotId = date.getTime();
                            var left = e.pageX - offset.left;
                            var top = e.pageY - offset.top;
                            resizeObj = {
                                target: $('<a class="hotspot" style="position: absolute;" id="'+hotspotId+'"><span class="h-w"></span><span class="h-h"></span></a>').appendTo(target),
                                maxHeight: target.height(),
                                maxWidth: target.width(),
                                pageX: e.pageX,
                                pageY: e.pageY,
                                left: left,
                                top: top
                            };
                            resizeObj.target.addClass("showsizeinfo");
                        //resize
                        } else if(target.is(".handle")){
                            var targetP = target.closest(".hotspot");
                            var position = targetP.position();
                            var img_center = target.closest(opts.img_center);
                            resizeObj = {
                                type: target.css("cursor").replace(/-resize$/, ""),
                                pageY: e.pageY - targetP.height(),
                                pageX: e.pageX - targetP.width(),
                                maxHeight: img_center.height(),
                                maxWidth: img_center.width(),
                                left: position.left,
                                top: position.top,
                                target: targetP
                            };
                            resizeObj.target.addClass("showsizeinfo");
                        }
                        if(target.closest(opts.img_center).length){
                            e.preventDefault();
                            $("html").addClass("ondrop");
                        }
                    }
                })
                .bind('mousemove', function(e){
                    if(e.which === 1){
                        if(draggableObj){
                            draggableObj.wrap.css({
                                left: Math.min(draggableObj.maxLeft, Math.max(0, draggableObj.left + e.pageX - draggableObj.pageX)),
                                top: Math.min(draggableObj.maxTop, Math.max(0, draggableObj.top + e.pageY - draggableObj.pageY))
                            })
                        }
                        else if(dropObj){
                            dropObj.target.css({
                                left: Math.min(dropObj.maxLeft, Math.max(0, dropObj.left + e.pageX - dropObj.pageX)),
                                top: Math.min(dropObj.maxTop, Math.max(0, dropObj.top + e.pageY - dropObj.pageY))
                            })
                        } else if(resizeObj){
                            var x1 = resizeObj.left,
                                y1 = resizeObj.top,
                                x2 = x1 + e.pageX - resizeObj.pageX,
                                y2 = y1 + e.pageY - resizeObj.pageY,
                                switchNum;
                            if(x1 > x2){
                                switchNum = x1;
                                x1 = x2;
                                x2 = switchNum;
                            }
                            if(y1 > y2){
                                switchNum = y1;
                                y1 = y2;
                                y2 = switchNum;
                            }

                            x1 = Math.max(0, x1);
                            y1 = Math.max(0, y1);
                            x2 = Math.min(resizeObj.maxWidth, x2);
                            y2 = Math.min(resizeObj.maxHeight, y2);

                            resizeObj.target.css({
                                left: x1,
                                top: y1
                            });
                            resizeObj.target.find(".h-w").text(parseInt(resizeObj.target.width()));
                            resizeObj.target.find(".h-h").text(parseInt(resizeObj.target.height()));

                            if(!resizeObj.type || /s/i.test(resizeObj.type)){
                                resizeObj.target.height(y2 - y1);
                            }
                            if(!resizeObj.type || /e/i.test(resizeObj.type)){
                                resizeObj.target.width(x2 - x1);
                            }
                            resizeObj.target.toggleClass("toosmail", resizeObj.target.width() < 80 || resizeObj.target.height() < 30);
                        }
                    }
                })
                .bind('mouseup blur', function(e){
                    if(resizeObj && !resizeObj.type ){
                        if(Math.abs(e.pageX - resizeObj.pageX) >= 10 && Math.abs(e.pageY - resizeObj.pageY) >= 10){
                            resizeObj.target.append('<span class="h-close"></span><span class="h-type">请双击编辑热区</span><span class="handle resizable-e"></span><span class="handle resizable-s"></span><span class="handle resizable-se"></span>');
                        } else {
                            resizeObj.target.remove();
                        }
                    }
                    if(resizeObj){
                        resizeObj.target.removeClass("showsizeinfo");
                    }
                    if(resizeObj){
                        var data = {};
                        opts.hotspot = $(resizeObj.target);
                        data = JMStore.CutImg.getData(opts,opts.hotspot.attr("id"));
                        if(data){
                            if(data.hotType == "video"){
                                $("#videoW").val(parseInt(opts.hotspot.width()));
                                $("#videoH").val(parseInt(opts.hotspot.height()));
                                $("#videoCode").val(data.videoCode);
                                JMStore.CutImg.saveSet(opts,data.hotType);
                            }
                        }
                    }

                    draggableObj = resizeObj = dropObj = null;
                    $("html").removeClass("ondrop");
                });
        },
        <!--删除热区-->
        closeHot:function(opts){
            $("#Modal-c").delegate(".h-close","click",function(e){
                var $parent = $(this).parent(".hotspot");
                var id = $parent.attr("id");
                JMStore.CutImg.delData(opts,id);//删除模块数据

                $.each(JMStore.CutImg.pro["deal"], function(i, item) {
                    if(i == id){
                        delete JMStore.CutImg.pro["deal"][i];
                    }
                });
                $.each(JMStore.CutImg.pro["mall"], function(i, item) {
                    if(i == id){
                        delete JMStore.CutImg.pro["mall"][i];
                    }
                });
                $parent.remove();
                return false;
                e.stopPropagation();
            });
        },
        setCode:function(opts){
            var code = "";
            var $oldImgMap = $(opts.img_map).clone();
            $oldImgMap.find(".linkbox,.brandbox,.popupbox,.hotikbox,.baijiabox,.anchor,.countdown").empty().removeClass("ui-resizable");
            var hots = $oldImgMap.find(".hotspot");
            if(JMStore.CutImg.imgUrl){
                hots.each(function(){
                    if( !$(this).hasClass("linkbox") && !$(this).hasClass("videobox") && !$(this).hasClass("brandbox") && !$(this).hasClass("popupbox") && !$(this).hasClass("hotikbox") && !$(this).hasClass("baijiabox")){
                        $(this).empty().removeClass("ui-resizable");
                    }
                });
                $oldImgMap.find(".videobox span").remove();
                $oldImgMap.find(opts.img_center).css("border","none");
                $oldImgMap.find(".h-w").remove();
                //败家div
                var baijiaDiv = "";
                $oldImgMap.find(".baijiabox").each(function(){
                    var baijia_style = $(this).attr("style");
                    var baijia_class = $(this).attr("class");
                    var baijia_id = $(this).attr("id");
                    var baijia_Id = $(this).attr("baijia_id");
                    var baijia_name = $(this).attr("baijia_name");
                    baijiaDiv += '<div class="'+baijia_class+'" id="'+baijia_id+'" data-baijiaBrandId="'+baijia_Id+'" data-baijiaBrandName="'+baijia_name+'" style="'+baijia_style+'"></div>';
                });
                if(baijiaDiv != ""){
                    $oldImgMap.find(".baijiabox").remove();
                    $(baijiaDiv).appendTo($oldImgMap.find(opts.img_center));
                }

                //败家改成其他类型的热区
                $oldImgMap.find("div.hotspot").each(function(){
                    if(!$(this).hasClass("baijiabox")){
                        var _style = $(this).attr("style");
                        var _class = $(this).attr("class");
                        var _id = $(this).attr("id");
                        var a = "";

                        if ($(this).attr("data-swf")) {
                            var _swf = $(this).attr("data-swf");// for vediobox
                            var _html = $(this).html();//for vediobox
                            a = '<a class="' + _class + '" id="' + _id + '" data-swf="' + _swf + '" style="' + _style + '">' + _html + '</a>';
                        }else if($(this).attr("data-url")) {
                            var _url = $(this).attr("data-url");// for popupbox
                            a = '<a class="' + _class + '" id="' + _id + '" data-url="' + _url + '" style="' + _style + '"></a>';
                        }else if($(this).attr("brand")) {
                            var _brand = $(this).attr("brand");// for brandbox
                            var _brand_id = $(this).attr("brand_id");// for brandbox
                            a = '<a class="' + _class + '" id="' + _id + '" brand="' + _brand + '" brand_id="' + _brand_id + '" style="' + _style + '"></a>';
                        }else if($(this).attr("hotik")) {
                            var _hotik = $(this).attr("hotik");// for hotikbox
                            a = '<a class="' + _class + '" id="' + _id + '" hotik="' + _hotik + '" style="' + _style + '"></a>';
                        }else{
                            var _href = $(this).attr("href");// for linkbox
                            a = '<a class="' + _class + '" id="' + _id + '" href="' + _href + '" style="' + _style + '"></a>';
                        }
                        $(this).remove();
                        $(a).appendTo($oldImgMap.find(opts.img_center));
                    }
                });

                var backgroundPos="";
//                if(JMStore.CutImg.getImgWidth() > $(opts.img_center).width()){
                    backgroundPos = 'background: url('+ JMStore.CutImg.imgUrl+') center 0 no-repeat';
                    code = '<! -- 图片 '+opts.imgName+' 开始 -->\r\n<div class="img_map" style="width: 100%; height:'+JMStore.CutImg.getImgHeight()+'px;'+backgroundPos+'">';
//                }else{
//                    backgroundPos = 'url('+ JMStore.CutImg.imgUrl+') left 0 no-repeat';
//                    $oldImgMap.find(opts.img_center).css("background",backgroundPos);
//                    code = '<! -- 图片 '+opts.imgName+' 开始 -->\r\n<div class="img_map" style="width: 100%; height:'+JMStore.CutImg.getImgHeight()+'px;">';
//                }
                code += $oldImgMap.html() + '</div>\r\n<! -- 图片 '+opts.imgName+' 结束 -->\r\n';
            }else{
               code='<div class="img_center" style="position: relative;width:960px; margin:0 auto;"></div>';
            }
            return code;
        },
        <!--在光标位置插入文字-->
        insertText:function(obj, str){
            obj.focus();
            if (document.selection) {
                var sel = document.selection.createRange();
                sel.text = str;
            } else if (typeof obj.selectionStart == 'number'
                && typeof obj.selectionEnd == 'number') {
                var startPos = obj.selectionStart, endPos = obj.selectionEnd, cursorPos = startPos, tmpStr = obj.value;
                obj.value = tmpStr.substring(0, startPos) + str
                    + tmpStr.substring(endPos, tmpStr.length);
                cursorPos += str.length;
                obj.selectionStart = obj.selectionEnd = cursorPos;
            } else {
                obj.value += str;
            }
        },
        <!--预览路径-->
        preview:function(opts){
            $(opts.previewBtn).bind("click",function(){
                var code = JMStore.CutImg.setCode(opts);
                $("#previewData").val(code);
                return true;
            });
        },
        <!--插入热区代码-->
        insertCode:function(opts){
            $(opts.insertBtn).bind("click",function(){
                var code = JMStore.CutImg.setCode(opts);
                obj = document.getElementById(opts.insertId);
                JMStore.CutImg.insertText(obj,code);
                JMStore.CutImg.clear(opts);
            });
        },
        <!--复制路径-->
        copyUrl:function(opts){
            $("#Modal-c").delegate("#copyUrl","mouseover",function(){
                var url = $(opts.imgUrl).text();
                var tip = $(opts.imgAb+" #text-success");
                if (JMStore.CutImg.clipUrl.div) {
                    JMStore.CutImg.clipUrl.reposition(this);//如果已经存在flash，那么重新定位{ 如果父级有滚动条，定位有问题，修改了插件Line :72}
                }else {
                    JMStore.CutImg.clipUrl.glue(this);
                    JMStore.CutImg.clipUrl.addEventListener('complete', function () {
                        tip.effect("drop",{ direction:"up"},1000);
                    });
                }
                JMStore.CutImg.clipUrl.setText(url);
            });
        },
        <!--复制代码-->
        initCopyCode:function(opts){
            $("#copyBtn").bind("mouseover",function(){
                var tip = $(opts.text_suc2);
                opts.code = JMStore.CutImg.setCode(opts);
                if (JMStore.CutImg.clipCode.div) {
                    JMStore.CutImg.clipCode.reposition(this);//如果已经存在flash，那么重新定位{ 如果父级有滚动条，定位有问题，修改了插件Line :72}
                }else {
                    JMStore.CutImg.clipCode.glue(this);
                    JMStore.CutImg.clipCode.addEventListener('complete', function () {
                        tip.effect("drop",{ direction:"up"},1000);
                    });
                }
                JMStore.CutImg.clipCode.setText(opts.code);
            });
        },
        copyCode:function(opts){
            opts.code = JMStore.CutImg.setCode(opts);
            JMStore.CutImg.clipCode.setText(opts.code);
        },
        <!--复制属性-->
        initCopyPro:function(){
            $("#copyPro").bind("mouseover",function(){
                var tip = $("#text-success3");
                if (JMStore.CutImg.clipPro.div) {
                    JMStore.CutImg.clipPro.reposition(this);//如果已经存在flash，那么重新定位{ 如果父级有滚动条，定位有问题，修改了插件Line :72}
                }else {
                    JMStore.CutImg.clipPro.glue(this);
                    JMStore.CutImg.clipPro.addEventListener('complete', function () {
                        tip.effect("drop",{ direction:"up"},1000);
                    });
                }
            });
        },
        commit:function(opts){
            $("#commit").bind("click",function(){
                var flag = true;
                $(".hotspot").each(function(){
                    if(!JMStore.CutImg.getData(opts,this.id)){
                        alert("当前还有未编辑过的热区，请编辑后再保存");
                        flag = false;
                        return false;
                    }
                    if(parseInt(this.style.top.match(/[0-9]+/)[0]) + $(this).height() > $(opts.img_map).height()){
                        $("#cutImgBody").scrollTop(parseInt(this.style.top.match(/[0-9]+/)[0]));
                        alert("存在超出图片高度范围的热区，请删除或修改热区范围");
                        flag = false;
                        return false;
                    }
                });
                if(flag){
                    var stringObj = JMStore.CutImg.setCode(opts);
                    code = stringObj.replace(/url\("([a-zA-Z0-9\/\._:]+)"\)/g,"url($1)");//过滤url中的双引号

                    //删除多余data数据
                    if($(".hotspot").length == 0){
                        opts.data = [];
                        JMStore.CutImg.pro = {"mall": "", "deal": ""};
                    }else{
                        var k = [];
                        $.each(opts.data, function (i, item) {
                            var item = item, flag;
                            $(".hotspot").each(function () {
                                if (item.obj != this.id) {
                                    flag = false;
                                } else {
                                    flag = true;
                                    return false;
                                }
                            });
                            if (!flag) {
                                k.push(i);
                            }
                        });
                        $.each(k, function (i, item) {
                            opts.data.splice(item, 1);
                        });

                        //删除多余property数据
                        var pro_flage = true, pro_A={}, pro_i,pro_k;
                        $.each(JMStore.CutImg.pro, function (i,val) {
                            pro_i = i;
                            $.each(JMStore.CutImg.pro[i],function(k,item){
                                $(".hotspot").each(function () {
                                    if (k == this.id && $(this).hasClass("linkbox")) {
                                        pro_flage = true;
                                        return false;
                                    } else {
                                        pro_flage = false;
                                    }
                                });
                                if (!pro_flage) {
                                    delete JMStore.CutImg.pro[pro_i][k];
                                }
                            });
                        });
                    }

                    var dataEdit={"cutData":opts.data};
                    var property = JSON.stringify(JMStore.CutImg.pro);
                    JMStore.CutImg.wrap.find(".cutCode").text(code).val(code);
                    JMStore.CutImg.wrap.find(".cutImage").val(JMStore.CutImg.imgUrl);
                    JMStore.CutImg.wrap.find(".Property").text(property).val(property);
                    JMStore.CutImg.wrap.find(".DataEdit").text(JSON.stringify(dataEdit)).val(JSON.stringify(dataEdit));
                    JMStore.CutImg.wrap.find(".imgName").html("图片地址："+JMStore.CutImg.imgUrl);
                    JMStore.CutImg.wrap.find(".img-thumb").attr("src",JMStore.CutImg.imgUrl);
                    JMStore.CutImg.clear(opts);
                    var helpHtml = '<p class="help-block fl">以上为缩略预览图， <a href="'+JMStore.CutImg.imgUrl+'" target="_blank">实际尺寸（宽*高）：'+JMStore.CutImg.getImgWidth()+' * '+JMStore.CutImg.getImgHeight()+'</a></p>';
                    JMStore.CutImg.wrap.find(".cut_after").html("");
                    $(helpHtml).appendTo(JMStore.CutImg.wrap.find(".cut_after"));
                    $(".mask").hide();
                }
            });
        },
        <!--删除图片-->
        delImg:function(opts){
            $(opts.imgAb).delegate("#delImg","click",function(){
                if (confirm("否确认删除图片?")){
                    $(opts.imgUrl).html("").attr("href","");
                    $(opts.imgAb).addClass("v_hidden");
                    $(".hotspot").remove();
                    opts.data = [];
                    JMStore.CutImg.imgUrl = "";
                    $(".tip").html("请上传图片").show();
                    $(opts.img_map).css({"background":"none","height":"150px"});
                    $(opts.img_center).css({"height":"150px","border":"none","background":"none"});
                    setTimeout(function(){
                    $(opts.img_wrap).css({ "width":"500px","height":"150px"});
                    }, 50);
                    setTimeout(function(){
                    var qw = $(opts.modal).width(), qh = $(opts.modal).height();
                        var _top = (opts.wh-qh)*382/1000, _left = (opts.ww-qw)/2;
                        $(opts.modal).css({"top":_top,"left":_left});
                    }, 100);
                }else{
                    return false;
                }
            });
        },
        <!--ajax跳转设置-->
        changeType:function(opts){
            var val = $(opts.jumpType).val();
            var html = "", $open_url = $(".open-url");
            var error_info = $(opts.jumpType).closest(".q-modal").find(".text-error");
            $open_url.hide();
            error_info.hide();
            switch (val) {
                case 'img_session':
                    html += "<i style='padding-right: 15px; font-style: normal'>专场ID</i>  <span class='session_id'><input type='text' id = 'content' name = 'content' placeholder='专场ID'></span>";
                    $open_url.show();
                    break;
                case 'img_deal':
                    html += "<span class='AjaxVerify' data-type='deal'>http://www.jumei.com/i/deal/ <input type='text' id = 'content' name = 'content' placeholder='填入hashid'>.html</span>";
                    $open_url.show();
                    break;
                case 'img_mall_list':
                    html += "<span>http://mall.jumei.com/products/ <input style='width:170px' type='text' id = 'content' name = 'content' placeholder='填入链接中的0-0-0-0-0部分'>.html</span>";
                    $open_url.show();
                    break;
                case 'product':
                    html += "<span class='AjaxVerify' data-type='product'>http://mall.jumei.com/product_ <input type='text' id = 'content' name = 'content' placeholder='填入产品ID'>.html</span>";
                    $open_url.show();
                    break;
                case 'store_domain':
                    if(opts.store_domain){
                        html += "<span data-type='store'>http://"+opts.store_domain+".jumei.com/</span>";
                    }else{
                        html += "<span class='AjaxVerify' data-type='store'>http:// <input type = 'text' id = 'content' name = 'content' placeholder='填入旗舰店标识'>.jumei.com/</span>";
                    }
                    $open_url.show();
                    break;
                case 'img_store_page':
                    if(opts.store_domain){
                        html += "<span data-type='storeSubPage' class='AjaxVerify'>http://"+opts.store_domain+".jumei.com/ <input type = 'text' id = 'content2' name = 'content2'  placeholder='填入二级页标识'>.html</span>";
                    }else{
                        html += "<span data-type='storeSubPage' class='AjaxVerify'>http:// <input type = 'text' id = 'content' name = 'content' placeholder='填入旗舰店标识'>.jumei.com/ <input type = 'text' id = 'content2' name = 'content2'  placeholder='填入二级页标识'>.html</span>";
                    }
                    $open_url.show();
                    break;
                case 'img_store_list':
                    if(opts.store_domain){
                        html += "<span>http://mall.jumei.com/"+opts.store_domain+"/products/ <input style='width:170px' type = 'text' id = 'content2' name = 'content2' placeholder='填入链接中的0-0-0-0-0部分'>.html</span>";
                    }else{
                        html += "<span>http://mall.jumei.com/ <input type = 'text' id = 'content' name = 'content' placeholder='填入旗舰店标识'>/products/ <input style='width:170px' type = 'text' id = 'content2' name = 'content2' placeholder='填入链接中的0-0-0-0-0部分'>.html</span>";
                    }
                    $open_url.show();
                    break;
                case 'img_store_detail':
                    if(opts.store_domain){
                        html += "<span>http://mall.jumei.com/"+opts.store_domain+"/product_ <input type = 'text' id = 'content2' name = 'content2' placeholder='填入产品ID'>.html</span>";
                    }else{
                        html += "<span>http://mall.jumei.com/ <input type = 'text' id = 'content' name = 'content' placeholder='输入旗舰店标识'>/product_ <input type = 'text' id = 'content2' name = 'content2' placeholder='填入产品ID'>.html</span>";
                    }
                    $open_url.show();
                    break;
                case 'img_pop_promotion':
                    html += "<span class='pop'>http://pop.jumei.com/promotion/ <input style='width:260px' type = 'text' id = 'content' name = 'content' placeholder='填入POP专场ID，留空不填表示转至POP首页'>.html</span>";
                    $open_url.show();
                    break;
                case 'img_pop_detail':
                    html += "<span>http://pop.jumei.com/i/deal/ <input type = 'text' id = 'content' name = 'content' placeholder='填入deal主站hashid'>.html</span>";
                    $open_url.show();
                    break;
                case 'img':
                    html += "";
                    break;
                case 'img_keywords':
                    html += "<span>http://search.jumei.com/?filter=0-0-0-0-11-1&search= <input style='width:240px' type='text' id = 'content' name = 'content' placeholder='填入搜索关键词，多关键词以“+”相隔'></span> ";
                    $open_url.show();
                    break;
                case 'img_url':
                    html += "<span class='cust_url'><input type='text' id = 'content' name = 'content' placeholder='http://url' class='input-m'></span> 填入url，以http://开头";
                    $open_url.show();
                    break;
                case 'img_freepie_detail':
                    html += " <span class='AjaxVerify' data-type='freepie'>http://koubei.jumei.com/i/trialactivity/?id= <input type='text' id = 'content' name = 'content' placeholder='填入freepie_id'></span>";
                    $open_url.show();
                    break;
                case 'back_to_index':
                    html += "<span class=''>http://www.jumei.com</span>";
                    $open_url.show();
                    break;
                case 'global_deal':
                    html += "<span class='AjaxVerify' data-type='globalDealDetail'>http://www.jumeiglobal.com/deal/ <input type='text' id = 'content' name = 'content' placeholder='填入hashid'>.html</span>";
                    $open_url.show();
                    break;
                case 'global_combination_deal':
                    html += " <span class='globalGroup' data-type='globalCombinationDealDetail'>http://www.jumeiglobal.com/Deal/Combination?hash_id= <input type='text'  id = 'content' name = 'content' placeholder='填写hashid'>&com_id= <input type='text' placeholder='组合ID' disabled></span>";
                    $open_url.show();
                    break;
                default:
                    break;
            }
            $(opts.settingUrl).html(html);
            var ow = $(opts.linkWrap).width(),oh = $(opts.linkWrap).height();
            var l = (opts.ww-ow)/ 2, t = (opts.wh-oh)*383/1000;
            $(opts.linkWrap).css({"top":t,"left":l});
        },
        <!--获取设置url-->
        getUrl:function(opts){
            var $p = $(".inline-setting span");
            var $inputs = $(opts.settingUrl+" input");
            if(!($p.hasClass("pop")|| $p.hasClass("globalGroup"))){
                for(var i=0; i<$inputs.length; i++){
                    if($inputs[i].value == ''){
                        $(".text-error").html("请填写链接！").show();
                        return false;
                    }else{
                        $inputs[i].value = $.trim($inputs[i].value);
                    }
                }
            }
            $(".text-error").hide();
            if($p.hasClass("pop")&&$.trim($inputs.val())==""){
                url = "http://pop.jumei.com/promotion.html";
                $inputs.val($.trim($inputs.val()));
            }else if($p.hasClass("session_id")){
                var sessionId = $("#content").val();
                $.ajaxSetup({
                    async: false
                });
                $.post(opts.session_Url,{poster_linkType:'new_activity',poster_link: sessionId, _no_message_:true}, function(data) {//根据专场ID返回专场链接
                    var data = JSON.parse(data);
                    if (data.code == 0) {
                        url =  "http://www.jumei.com" + data.data;
                    }else{
                        $(".text-error").html("专场：" + sessionId + " 不存在").show();
                        return false;
                    }
                });

            }else if($p.hasClass("cust_url")){
                    var url = JMStore.CutImg.filterUrl($.trim($inputs.val()));
//                    console.log("過濾后的URL："+url);
                    var reg = jmstoreCommon.whiteListReg;
                    if(!(match = reg.exec(url))){
                        $(".text-error").html("请填写正确的链接格式!").show();
                        return false;
                    }

            }else{
                var flag = true;
                if($p.hasClass("AjaxVerify")){

                    var type = $p.attr("data-type");
                    var value = [];
                    $p.find("input").each(function (i) {
                        value.push($(this).val());
                    });
                    if(opts.partner_type){
                        type = opts.partner_linktype;
                    }
                    var param = {
                        "param":value,
                        "verifyType":type,
                        "actId":window.activityId || "0",
                        "isAct":window.is_special || "0",
                        "storeId":window.store_id || "0"
                    };
                        $.post("/SpecialActivity/AjaxVerify",param, function(data) {
                            data=JSON.parse(data);
                            if (data.error) {
                                if(data.error == 10){ //11
                                    if (opts.fromPage == "Flagship") {
                                        require(["flagship/functions"], function(common) {
                                            common.alert(data.message);
                                        });
                                    }else{
                                        alert(data.message);
                                    }
                                    flag=true;
                                }else if(data.error == 0){
                                    flag=true;
                                }else{
                                    var msg = data.message || "";
                                    switch(type){
                                        // case 'deal':msg='hashid：' + value[0] + ' 不存在或未发布'; break;
                                        // case 'product':msg='产品ID：' + value[0] + ' 不存在或未发布'; break;
                                        case 'store':msg='旗舰店：' + value[0] + ' 不存在'; break;
                                        // case 'storeSubPage':msg='页面：' + value[1] + ' 不存在'; break;
                                        case 'freepie':msg="freepie_id：" + value[0] + ' 不存在'; break;
                                    }
                                    $(".text-error").html(msg).show();
                                    flag=false;
                                }
                            }
                        });
                }
                if($p.hasClass("globalGroup")){
                    var type = $p.attr("data-type");
                    var value = [];
                    var param = {
                        "param":value,
                        "verifyType":type
                    };
                    value.push($p.find("input").first().val());
                    $.post("/SpecialActivity/AjaxVerify",param, function(data) {
                        data=JSON.parse(data);
                        if(data.error == 0){
                            $p.find("input").last().val(data.message);
                            flag=true;
                        }else{
                            var msg = data.message || "";
                            $(".text-error").html(msg).show();
                            flag=false;
                        }
                    });
                }
                if(flag){
                    var text = $p.text();
                    var text_array =text.split(" ");
                    var $input = $p.find("input");
                    var url = "";
                    var k=0;
                    for (i = 0; i < $input.length; i++){
                        url += text_array[i] + $input[i].value;
                        k++;
                    }
                    url += text_array[k];
                }else{
                    return false;
                }
            }
            return url;
        },
        filterUrl:function (url){
        var urlObject = {};
        var index_flag = url.indexOf("?");
        var urlString = url.substring(index_flag+1);
        var root_url = url.substring(0,index_flag);
        if (/\?/.test(url)) {
            if(index_flag != -1){
                if(urlString.indexOf("&")>-1){
                    var urlArray = urlString.split("&");
                    for (var i=0, len=urlArray.length; i<len; i++) {
                        var urlItem = urlArray[i];
                        var item = urlItem.split("=");
                        if(item[0]!=""){
                            urlObject[item[0]] = item[1];
                        }

                    }
                    var obj = {};
                    for(var key in urlObject){
                        if(key != "site" && key!="from" && key!="status"){
                            obj[key] =  urlObject[key];
                        }
                    }
                    var str,arry = [];
                    $.each(obj,function(index,value){
                        if(value!=""){
                            var this_key = index+"="+value;
                            arry.push(this_key);
                        }

                    });
                    str = arry.join("&");
                    if(str){
                        var new_url = root_url+"?"+str;
                    }else{
                        new_url = root_url;
                    }
                }else{
                    if(urlString.indexOf("=")>-1){
                        var arr_key = urlString.split("=");
                        if(arr_key[0]!=""){
                            if(arr_key[0] == "site" || arr_key[0]=="from" || arr_key[0]=="status"){
                                new_url = root_url;
                            }else{
                                new_url = url;
                            }
                        }else{
                            new_url = url;
                        }
                    }else if(urlString == "site" || urlString=="from" || urlString=="status"){
                        new_url = root_url;
                    } else{
                        new_url = root_url;
                    }
                }

            }

        }else{
            new_url = url;
        }
        return new_url;
    },
        openUrl:function(opts){
            $(opts.linkWrap).delegate(".open-url","click",function(){
                var url = JMStore.CutImg.getUrl(opts);
                if(url){
                    window.open(url);
                }
                return false;
            });
        }
    };

})(jQuery);