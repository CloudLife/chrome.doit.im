;(function($){
    $.smartAdd = {
        rules : [{flag:'^',list:['今日','明日','择日待办','mm-dd','yy-mm-dd'],repeat:false,hr:3,className:['','','']},{flag:'#',list:['life','study','Doit.im','运动','办公'],repeat:false,hr:-1}],
        getRules : function() {
            return $.smartAdd.rules;
        },
        setRules : function() {
            if(arguments != 'undefined'){
                $.smartAdd.rules = arguments;
            }
        }
    };
    $.fn.smartAdd = function() {
        $input = this;
        //{计算长度用
        var $pDiv = $('<div id="pDiv" style="position:absolute;visibility:hidden"></div>');
        $pDiv.css({'font-size':$input.css('font-size')},{'border':0},{'margin':0},{'padding':0});
        var pTmp = $input.position();
        var lTmpS = $input.parent().css('padding-left');
        var lTmpParent = parseInt(lTmpS.substring(0,lTmpS.length-2),10);
        var lTmpSelfS = $input.css('padding-left');
        var lTmpSelf = parseInt(lTmpSelfS.substring(0,lTmpSelfS.length-2),10);
        //$pDiv.css({'top':pTmp.top+'px'});
        $pDiv.css('left',(pTmp.left+lTmpParent+lTmpSelf)+'px');
        $input.val('').removeAttr('disabled').parent().append($pDiv);
        //}
        //{智能完成用
        var $smartList = $('<div id="smart_add_list" style="text-align:left"></div>');
        
        $('#smart_add_list li').live('mouseover', function() {
            if($(this).hasClass('disabled')){
                ;
            }else{
                $(this).parent().find('.highlight').removeClass('highlight');
            }
            $(this).not('.disabled').addClass('highlight');
        }).live('mouseout', function() {
            if($(this).parent().find('.highlight').length!=1){
                $(this).removeClass('highlight');
            }
        }).live('mousedown', function() {
            if($(this).hasClass('disabled')){
                ;
            }else{
                $input.val($input.val()+$smartList.find('.highlight').text()+' ');
                hideSmartList();
                return false; 
            }
        });
        
        $input.parent().append($smartList);
        //}
        $input.blur().bind('focus', function() {
            $(this).unbind('keyup.saku').bind('keyup.saku', function(e) {
                if( e.which != 38 && e.which != 40 && e.which != 13 && e.which != 16){
                    //{计算长度用
                    $pDiv.text($input.val());
                    //}
                    //{智能完成用
                    var pntPaddingTopS = $input.parent().css('padding-top');
                    var pntPaddingTop = parseInt(pntPaddingTopS.substring(0,pntPaddingTopS.length-2),10);
                    var slfPaddingTopS = $input.css('padding-top');
                    var slfPaddingTop = parseInt(slfPaddingTopS.substring(0,slfPaddingTopS.length-2),10);
                    if($pDiv.width() > $input.width()){
                        $smartList.css({'left':$pDiv.position().left+$input.width()+'px'}).css({'top':$input.position().top+pntPaddingTop+$input.outerHeight()/2-1+'px'});
                    }else{
                        $smartList.css({'left':$pDiv.position().left+$pDiv.width()+'px'}).css({'top':$input.position().top+pntPaddingTop+$input.outerHeight()/2-1+'px'});
                    }
                    //}
                    var s = this.value;
                    var a = s.split(' ');
                    var aLast = a[a.length-1];
                    var sLast = aLast.toString();
                    var _result = false;
                    $.each($.smartAdd.getRules(), function(idx,obj) {
                        var obj = obj;
                        var flag = obj.flag;
                        var _reg1S = '(^| )\\'+flag;
                        var reg1 = new RegExp(_reg1S);
                        var _regR = '\\'+flag+'('+obj.list.join('|')+') ';
                        var regR = new RegExp(_regR.replace(/([\!\$\^\&\*\(\)\+\{\}\|\:\?\-\=\[\]\.\/\\])/g, '\\$1'));
                        var repeat = obj.repeat == undefined ? false : obj.repeat;
                        if(reg1.test(sLast)){//匹配以各种flag开头的情况
                            if(sLast.length == 1 && (repeat || !(new RegExp('(^| )\\'+flag+'.+ ').test($input.val())))){//只有单个flag的时候
                                createSmartList(obj.list,obj.className,obj.hr);
                            }else if(sLast.length > 1){//后面出现的时候
                                //list做成正则来匹配sLast
                                var _a = [];
                                var L = obj.list;
                                var lineTMP = L.length > obj.hr ? obj.hr : L.length;
                                var line = lineTMP < 0 ? L.length : lineTMP;
                                for(var i = 0; i < line; i++){
                                    var _reg2S = '^'+sLast.substring(1,sLast.length).replace(/([\!\$\^\&\*\(\)\+\{\}\|\:\?\-\=\[\]\.\/\\])/g, '\\$1');
                                    var reg2 = new RegExp(_reg2S,'i');
                                    //console.log(_reg2S);
                                    if(reg2.test(L[i])){
                                        _a.push(L[i]);
                                    }
                                }
                                if(_a.length == 0){
                                    hideSmartList();
                                }else{
                                    createSmartList(_a);
                                }
                            }
                            _result = true;
                        }
                    });
                    if(!_result){
                        hideSmartList();
                    }
                }
            }).unbind('keydown.sakd').bind('keydown.sakd', function(e) {
                if(e.which == 38){//上
                    $smartList.find('li.highlight').prev().not('.disabled').addClass('highlight').next().removeClass('highlight');
                    return false;
                }else if(e.which == 40){//下
                    $smartList.find('li.highlight').next().not('.disabled').addClass('highlight').prev().removeClass('highlight');
                    return false;
                }else if(e.which == 13){
                    if($('#smart_add_list').css('visibility') != 'hidden'){
                        //$input.val($input.val()+$smartList.find('.highlight').text()+' ');
                        var inputVal = $input.val();
                        var _ary = inputVal.split(' ');
                        var _last = _ary.pop();
                        _ary.push(_last.substring(0,1)+$smartList.find('.highlight').text()+' ');
                        $input.val(_ary.join(' '));
                        hideSmartList();
                        return false; 
                    }
                }
            });
        }).bind('blur', function() {
            $(this).unbind('keyup.saku').unbind('keydown.sakd');
            hideSmartList();
        });
        //制造list的方法
        function createSmartList(ary,className,hr) {
            if(ary.length == 0){
                return;
            }
            var className = className == undefined ? [] : className;
            var hr = hr == undefined ? -1 : hr;
            var sLis = '';
            for(var i = 0; i<ary.length; i++){
                if(i == 0){
                    sLis += '<li class="highlight '+(className[i]==undefined?'':className[i])+'">'+ary[i]+'</li>';
                }else{
                    if(i>=hr && hr > 0){
                        if(i==hr){
                            sLis += '<li class="disabled hr '+(className[i]==undefined?'':className[i])+'">'+ary[i]+'</li>';
                        }else{
                            sLis += '<li class="disabled'+(className[i]==undefined?'':className[i])+'">'+ary[i]+'</li>';
                        }
                    }else{
                        sLis += '<li class="'+(className[i]==undefined?'':className[i])+'">'+ary[i]+'</li>';
                    }
                }
            }
            var sUl = '<ul>'+sLis+'</ul>';
            $smartList.html(sUl).css('visibility','visible');
        }
        function hideSmartList() {
            $smartList.css('visibility','hidden');
        }
    };
})(jQuery);