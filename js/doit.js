/*====================
        全局变量
====================*/
var PROFILE_URL = 'https://openapi.doit.im/v1/settings';
var TASKS_URL = 'https://openapi.doit.im/v1/tasks';
var PROJECTS_URL = 'https://openapi.doit.im/v1/projects';

var PROFILE = {};
var TASKS = [];
var PROJECTS = [];

var UNFINISHED_INBOX = 'unfinished_inbox';
var UNFINISHED_OVERDUE_TODAY = 'unfinished_overdue_today';
var UNFINISHED_SCHEDULED = 'unfinished_scheduled';
var UNFINISHED_SOMEDAY = 'unfinished_someday';

var FINISHED_TODAY = 'finished_today';
var FINISHED_YESTERDAY = 'finished_yesterday';
var FINISHED_EARLIER = 'finished_earlier';

//根据task返回task类型
function showTaskType(task){
    var tmp = task;
    var startAt = Date.parse(tmp.start_at);
    var endAt = Date.parse(tmp.end_at);
    if(tmp.completed==null){
        if(tmp.repeater == null && tmp.hidden == null && tmp.deleted == null && tmp.trashed == null && tmp.completed == null && tmp.attribute == 'inbox' && (endAt==null || !(endAt.isBefore(Date.today().add(1).day())))){
            return UNFINISHED_INBOX;
        }else if(tmp.repeater==null && tmp.assignment==null && tmp.hidden==null && tmp.deleted==null && tmp.trashed==null && tmp.completed==null && ((tmp.attribute=='plan' && startAt!=null && startAt.isBefore(Date.today().add(1).day())) || (endAt!=null && endAt.isBefore(Date.today().add(1).day())))){
            return UNFINISHED_OVERDUE_TODAY;
        }else if(tmp.repeater==null && tmp.hidden==null && tmp.deleted==null && tmp.trashed==null && tmp.completed==null && tmp.attribute=='plan' && startAt!=null && !(startAt.isBefore(Date.today().add(1).day()))){
            return UNFINISHED_SCHEDULED;
        }else if(tmp.repeater==null && tmp.hidden==null && tmp.deleted==null && tmp.trashed==null && tmp.completed==null && ((tmp.attribute=='noplan' && (endAt==null || (endAt!=null && !(endAt.isBefore(Date.today().add(1).day()))))) || (tmp.attribute=='waiting' && tmp.assignment==null))){
            return UNFINISHED_SOMEDAY;
        }
    }else{
        var c = Date.parse(tmp.completed);
        var _today = Date.today();
        var _yesterday = Date.today().add(-1).days();
        var _tomorrow = Date.today().add(1).days();
        
        if(tmp.archived == null && tmp.hidden == null && tmp.deleted == null && tmp.trashed == null && c.isBefore(_tomorrow) && !(c.isBefore(_today))){
            return FINISHED_TODAY;
        }else if(tmp.archived == null && tmp.hidden == null && tmp.deleted == null && tmp.trashed == null && c.isBefore(_today) && !(c.isBefore(_yesterday))){
            return FINISHED_YESTERDAY;
        }else if(tmp.archived == null && tmp.hidden == null && tmp.deleted == null && tmp.trashed == null && c.isBefore(_yesterday)){
            return FINISHED_EARLIER;
        }
    }
}
/*====================
        交互模块
====================*/
//加入请求头
function setHeader(callback){
    var addHeaders = function(token){
    	var token=localStorage.getItem('user_token');
    	return 'OAuth '+token;
    }
    $.ajaxSetup({
    	dataType: 'json',
    	beforeSend: function(req){
    		req.setRequestHeader('Authorization', addHeaders())
    	},
    	contentType: "application/json; charset=utf-8"
    });
    $('#message').ajaxStart(function() {
        $(this).html('<p id="message_text">'+chrome.i18n.getMessage('Processing')+'</p>').show();
    }).ajaxStop(function(event,request, settings){
        if($(this).html()=='<p id="message_text">'+chrome.i18n.getMessage('Processing')+'</p>'){
            $(this).hide();
        }else{
            var $tmp = $(this);
            setTimeout(function(){
                $tmp.hide();
            },1500);
        }
    });
    callback && callback();
}

//获得所有任务
function getAllTasks(callback){
    var tasks = [];
    $.get(TASKS_URL, function(data) {
        if(data.entries.length != 0) {
            var items = data.entries;
            for( var i = 0; i< items.length; i++ ){
                tasks.push(items[i]);
            }
            callback && callback(tasks);
        }
    });
}

//获得收集箱任务
function getInboxTasks(callback){
    var tasks = [];
    for(var i = 0; i<TASKS.length; i++){
        var tmp = TASKS[i];
        if(showTaskType(tmp) == UNFINISHED_INBOX){
            tasks.push(tmp);
        }
    }
    callback && callback(tasks);
}

//获得过期以及今天的任务
function getOverdueAndTodayTasks(callback) {
    var tasks = [];
    for(var i = 0; i<TASKS.length; i++){
        var tmp = TASKS[i];
        if(showTaskType(tmp) == UNFINISHED_OVERDUE_TODAY){
            tasks.push(tmp);
        }
    }
    callback && callback(tasks);
}

//获得特定日程的任务
function getScheduledTasks(callback) {
    var tasks = [];
    for(var i = 0; i<TASKS.length; i++){
        var tmp = TASKS[i];
        var startAt = Date.parse(tmp.start_at);
        var endAt = Date.parse(tmp.end_at);
        if(showTaskType(tmp) == UNFINISHED_SCHEDULED){
            tasks.push(tmp);
        }
    }
    callback && callback(tasks);
}

//获得择日待办的任务
function getSomedayTasks(callback) {
    var tasks = [];
    for(var i = 0; i<TASKS.length; i++){
        var tmp = TASKS[i];
        var startAt = Date.parse(tmp.start_at);
        var endAt = Date.parse(tmp.end_at);
        if(showTaskType(tmp) == UNFINISHED_SOMEDAY){
            tasks.push(tmp);
        }
    }
    callback && callback(tasks);
}
//获得今天完成的任务
function getFTodayTasks(callback){
    var tasks = [];
    for(var i = 0; i<TASKS.length; i++){
        var tmp = TASKS[i];
        var startAt = Date.parse(tmp.start_at);
        var endAt = Date.parse(tmp.end_at);
        if(showTaskType(tmp) == FINISHED_TODAY){
            tasks.push(tmp);
        }
    }
    callback && callback(tasks);
}
//获得昨天完成的任务
function getFYesterdayTasks(callback){
    var tasks = [];
    for(var i = 0; i<TASKS.length; i++){
        var tmp = TASKS[i];
        var startAt = Date.parse(tmp.start_at);
        var endAt = Date.parse(tmp.end_at);
        if(showTaskType(tmp) == FINISHED_YESTERDAY){
            tasks.push(tmp);
        }
    }
    callback && callback(tasks);
}
//获得之前完成的任务
function getFEarlierTasks(callback){
    var tasks = [];
    for(var i = 0; i<TASKS.length; i++){
        var tmp = TASKS[i];
        var startAt = Date.parse(tmp.start_at);
        var endAt = Date.parse(tmp.end_at);
        if(showTaskType(tmp) == FINISHED_EARLIER){
            tasks.push(tmp);
        }
    }
    callback && callback(tasks);
}
//获得个人信息
function getProfile(callback) {
    $.get(PROFILE_URL, function(data) {
        callback && callback(data);
    });
}
//获得项目
function getProjects(callback) {
    var projects = [];
    $.get(PROJECTS_URL, function(data) {
        $.get('https://openapi.doit.im/v1/projects',function(data){$.each(data.entries,function(i,o){
            projects.push(o.name);
        })});
        callback && callback(projects);
    });
}
//完成任务
function finishTask(task,callback) {
    var finish_time = new Date().toString("yyyy-MM-dd HH:mm:ss ")+PROFILE.USER_TIMEZONE;
    task.completed = finish_time;
    task.title = unescapeHTML(task.title);
    task.project = unescapeHTML(task.project);
    task.notes = unescapeHTML(task.notes);
    $.ajax({
        url: TASKS_URL,
        data: task == null?'':JSON.stringify(task),
        type: 'PUT',
        contentType: 'application/json; charset=utf-8',
        complete: function(resp) {
            var status = resp.status;
            if(status == 401) {
                alert('请登录/Pls SignIn');
            } else if(status == 200) {
                callback && callback(task);
            } else if(status == 400) {
                //attr.onError(resp);
            } else if(status == 500) {
                //attr.onFailure(resp);
            }
        }
    });
}
//标记已完成任务为未完成
function unfinishTask(task,callback){
    task.completed = null;
    task.title = unescapeHTML(task.title);
    task.project = unescapeHTML(task.project);
    task.notes = unescapeHTML(task.notes);
    $.ajax({
        url: TASKS_URL,
        data: task == null?'':JSON.stringify(task),
        type: 'PUT',
        contentType: 'application/json; charset=utf-8',
        complete: function(resp) {
            var status = resp.status;
            if(status == 401) {
                alert('请登录/Pls SignIn');
            } else if(status == 200) {
                callback && callback(task);
            } else if(status == 400) {
                //attr.onError(resp);
            } else if(status == 500) {
                //attr.onFailure(resp);
            }
        }
    });
}
//提交任务
function postTask(task,callback) {
    if(task != null){
        task.title = unescapeHTML(task.title);
        task.project = unescapeHTML(task.project);
        task.notes = unescapeHTML(task.notes);
    }
    $.ajax({
        url: TASKS_URL,
        data: task == null?'':JSON.stringify(task),
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        complete: function(resp) {
            var status = resp.status;
            if(status == 401) {
                alert('请登录/Pls SignIn');
            } else if(status == 200) {
                M(chrome.i18n.getMessage('Success'));
                callback && callback(task);
            } else if(status == 400) {
                M(chrome.i18n.getMessage('Error'));
            } else if(status == 500) {
                M(chrome.i18n.getMessage('Failure'));
            }
        }
    });
}
//删除任务
function deleteTask(task,callback) {
    var deleted_time = new Date().toString("yyyy-MM-dd HH:mm:ss ")+PROFILE.USER_TIMEZONE;
    task.deleted = deleted_time;
    task.title = unescapeHTML(task.title);
    task.project = unescapeHTML(task.project);
    task.notes = unescapeHTML(task.notes);
    $.ajax({
        url: TASKS_URL,
        data: task == null?'':JSON.stringify(task),
        type: 'PUT',
        contentType: 'application/json; charset=utf-8',
        complete: function(resp) {
            var status = resp.status;
            if(status == 401) {
                alert('请登录/Pls SignIn');
            } else if(status == 200) {
                callback && callback(task);
            } else if(status == 400) {
                //attr.onError(resp);
            } else if(status == 500) {
                //attr.onFailure(resp);
            }
        }
    });
}
/*====================
        DOM模块
====================*/
//插入所有未完成的任务
function getUnfinishedTasks(tasks){
    getInboxTasks(function(tasks){
        //加到收集箱里面
        $('.type-inbox').next().html('');
        addTasks(tasks,0,0);
    });
    getOverdueAndTodayTasks(function(tasks){
        //加到那个里面

        $('.type-overdue-today').next().html('');
        addTasks(tasks,0,1);
    });
    getScheduledTasks(function(tasks){
        
        $('.type-scheduled').next().html('');
        
        addTasks(tasks,0,2);
        
        
    });
    getSomedayTasks(function(tasks){
        
        $('.type-someday').next().html('');
        
        addTasks(tasks,0,3);
        
        
    });
}
//插入所有已完成的任务
function getFinishedTasks(tasks){
    getFTodayTasks(function(tasks){
        $('.type-today-finish').next().html('');
        addTasks(tasks,1,0);
    });
    getFYesterdayTasks(function(tasks){
        $('.type-yesterday-finish').next().html('');
        addTasks(tasks,1,1);
    });
    getFEarlierTasks(function(tasks){
        $('.type-earlier-finish').next().html('');        
        addTasks(tasks,1,2);
    });
}
//制造tab
function makeTab() {
    var $title = $('#tasks_list_tab');
    var $content = $('#tasks_list');
    $title.find('li:first').children().removeClass('highlight').addClass('highlight');
    $content.find('ul:gt(0)').hide();
    $title.find('li').click( function() {
        $(this).children().removeClass('highlight').addClass('highlight').end().siblings('li').children().removeClass('highlight');
        $content.find('ul').eq($(this).index()).show().siblings("ul").hide();
    });
}
//点删除跳出的确认提示
function msg(obj){
    var title = obj.title;
    var content = obj.content;
    var ok = obj.ok;
    var cancel = obj.cancel;
    var $msg = $('#msg_box_wrap');
    $msg.find('#msg_box_title_text').text(obj.title).end().find('#msg_box_content_text').text(obj.content);
    $msg.show()
    //$msg.find('#msg_box').draggable({ handle: '#msg_box_title', cancel: '#msg_box_button_close', containment: '#msg_box_wrap'});
    $msg.find('#msg_box_title').disableSelection();
    $msg.find('#msg_box_button_close').unbind('click').bind('click', function() {
        $msg.hide();
        return false;
    });
    $msg.find('#shadow_div').unbind('click').bind('click', function() {
        $msg.hide();
    });
    $msg.find('#msg_box_button_cancel').unbind('click').bind('click', function() {
        $msg.hide();
        cancel && cancel();
    });
    $msg.find('#msg_box_button_ok').unbind('click').bind('click', function() {
        $msg.hide();
        ok && ok();
    });
}
//显示智能添加的帮助
function showSmartAddHelp(){
    var $sah = $('#smart_add_help');
    $sah.draggable({ cancel: '#smart_add_help_close', containment: '#container'}).disableSelection().show();
    $sah.find('#smart_add_help_title').disableSelection();
}
//隐藏智能添加的帮助
function hideSmartAddHelp(){
    var $sah = $('#smart_add_help');
    $sah.hide();
}
//检查有无token
function checkToken(){
    if(localStorage.user_token == undefined){//没有验证
        $('#container').css('visibility','hidden');
        $('#please_login').show();
        return false;
    }else{
        $('#container').show();
        $('#please_login').hide();
        return true;
    }
}
//打开设置页面
function open_option(){
	var url=chrome.extension.getURL('options.html');
	chrome.tabs.create({
		url: url,
		selected: true
	});
}
//登出
function logout(){
    localStorage.removeItem('user_token');
}
//添加任务
function addTasks(tasks,finishIndex,listIndex,turn){
    if($.isArray(tasks)){
        for(var i = 0; i<tasks.length; i++){
            var $task = $('<div dyna-id="'+tasks[i].id+'" title="'+tasks[i].title+'" class="task-wrap"><div class="complete-button left"><a href="#"></a></div>'+(tasks[i].project==null?'':'<div class="task-project left">'+unescapeHTML(tasks[i].project)+'</div>')+'<div'+(tasks[i].notes==''?'':' title="'+unescapeHTML(tasks[i].notes)+'"')+' class="task-titile clearfix">'+unescapeHTML(tasks[i].title)+'</div><div class="delete-button-wrap"><div class="delete-button"></div></div></div>');
            $task.data('task',tasks[i]);
            $('#tasks_list ul').eq(finishIndex).children('li').eq(listIndex).children('.task-article').prepend($task);
        }
    }else{
        var $task = $('<div dyna-id="'+tasks.id+'" title="'+tasks.title+'" class="task-wrap"><div class="complete-button left"><a href="#"></a></div>'+(tasks.project==null?'':'<div class="task-project left">'+unescapeHTML(tasks.project)+'</div>')+'<div'+(tasks.notes==''?'':' title="'+unescapeHTML(tasks.notes)+'"')+' class="task-titile clearfix">'+unescapeHTML(tasks.title)+'</div><div class="delete-button-wrap"><div class="delete-button"></div></div></div>');
        $task.data('task',tasks);
        $('#tasks_list ul').eq(finishIndex).children('li').eq(listIndex).children('.task-article').prepend($task);
        turn || changeColor({R:255,G:255,B:180},{R:255,G:255,B:255},5,300, function(c) {
            $task.css('background-color','rgb('+c.R+', '+c.G+', '+c.B+')');
        });
    }
}
//自动按任务类型判断添加任务
function addTaskAuto(task,turn){
    var type = showTaskType(task);
    switch(type){
        case UNFINISHED_INBOX:
            addTasks(task,0,0,turn);
        break;
        case UNFINISHED_OVERDUE_TODAY:
            addTasks(task,0,1,turn);
        break;
        case UNFINISHED_SCHEDULED:
            addTasks(task,0,2,turn);
        break;
        case UNFINISHED_SOMEDAY:
            addTasks(task,0,3,turn);
        break;
        case FINISHED_TODAY:
            addTasks(task,1,0,turn);
        break;
        case FINISHED_YESTERDAY:
            addTasks(task,1,1,turn);
        break;
        case FINISHED_EARLIER:
            addTasks(task,1,2,turn);
        break;
        default:
             ;
   }
    
}
//从dom删除任务
function slideUpTask(id){
    $('.task-wrap[dyna-id='+id+']').slideUp('normal',function(){
        $(this).remove();
    });
}
//显示数字
function showCount(callback){
    if(checkToken()){
        setHeader(
            function(){
                getProfile(function(profile){
                    var user_timezone = profile.user_timezone.split('T')[1].split(')')[0].toString().replace(':','');//+0800
                    var username = profile.username;
                        PROFILE.USER_TIMEZONE = user_timezone;
                        PROFILE.USERNAME = username;
                        getAllTasks(function(tasks){
                            TASKS = tasks;
                            //+++
                            localStorage.removeItem('all_tasks');
                            localStorage.setItem('all_tasks',JSON.stringify(tasks));
                            //+++
                            getOverdueAndTodayTasks(function(tasks){
                                var count = tasks.length;
                                chrome.browserAction.setBadgeText({text:(count==0?'':count.toString())});
                                callback && callback();
                            });
                        });  
                });
            }
        );
    }else{
        chrome.browserAction.setBadgeText({text:''});
    }
}
//提示
function M(s){
    $('#message p').text(s).parent().show();
    setTimeout(function(){
        if($('#message p').text == s){
            $('#message p').parent().hide();
        }else{
            setTimeout(function(){
                $('#message p').parent().hide();
            },1200);
        }
    },1200);
}
//制造task的id
function makeUUID() {
    var uuid = randomUUID(); //生成uuid
    var uuid_b = new Base64();
    var uuid_base64 = uuid_b.encode(uuid);
    return uuid_base64;
}
function randomUUID() {
    var s = [];
    for (var i = 0; i < 16; i++) {
        s[i] = Math.floor(Math.random() * 0x100);
    }
    s[6] = (s[6] & 0x0F) | 0x40;
    s[8] = (s[8] & 0x3F) | 0x80;
    return s;
}
function Base64() {
    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
    this.encode = function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        while (i < input.length) {
            chr1 = input[i++];
            chr2 = input[i++];
            chr3 = input[i++];
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }
 }
 //颜色渐变
 /**
  *动态修改颜色，用于渐变
  *@param (Object)RGB，初始颜色对象，包含R、G、B三个属性
  *@param (Object)RGB，目标颜色对象，包含R、G、B三个属性
  *@param (Integer)step，步长，每次回调函数传参增加或者减少的颜色值
  *@param (Integer)speed，速度，单位毫秒，回调函数调用间隔
  *@param (Function)callback，回调函数，会传入修改中的颜色对象，包含R、G、B三个属性
  *@return 无
  */
 function changeColor(objRGB,objTargetRGB,step,speed,callback) {
     var _r = objRGB.R;
     var _g = objRGB.G;
     var _b = objRGB.B;
     var _t_r = objTargetRGB.R;
     var _t_g = objTargetRGB.G;
     var _t_b = objTargetRGB.B;
     callback({R:_r, G:_g, B:_b});
     var intervalId = setInterval( function() {
         _r = beCloz(_r,_t_r);
         _g = beCloz(_g,_t_g);
         _b = beCloz(_b,_t_b);
         callback({R:_r, G:_g, B:_b});
         if((_r == _t_r) && (_g == _t_g) && (_b == _t_b)) {
             clearInterval(intervalId);
             //U.log('停了');
         }
     },speed);
     function beCloz(c,tc) {
         if(Math.abs(c-tc)>step) {
             if(c>tc) {
                 c-=step;
             } else if(c<tc) {
                 c+=step;
             }
         } else {
             c=tc;
         }
         return c;
     }

 }
 //HTML-escape
 function escapeHTML(data) {
     if(data==null){return;}
     return (
     data.replace(/&/g, '&amp;').
     replace(/>/g, '&gt;').
     replace(/</g, '&lt;').
     replace(/'/g,'&#39').
     replace(/"/g, '&quot;'));
 };
 function escapeArrayHTML(arr) {
     if(data==null){return;}
     for(i=0;i<arr.length;i++){
         if(arr[i] != null){
             arr[i] = arr[i].replace(/&/g, '&amp;').
             replace(/>/g, '&gt;').
             replace(/</g, '&lt;').
             replace(/'/g,'&#39').
             replace(/"/g, '&quot;');
         }
     }
     return arr;
 };
 function unescapeArrayHTML(arr) {
     if(data==null){return;}
     for(i=0;i<arr.length;i++){
         if(arr[i] != null){
             arr[i] = arr[i].replace(/&gt;/g, '>').
             replace(/&lt;/g, '<').
             replace(/&#39/g,"'").
             replace(/&quot;/g, '"').
             replace(/&amp;/g, '&');
         }
     }
     return arr;
 };
 function unescapeHTML(data) {
     if(data==null){return;}
     return(
         data.replace(/&gt;/g, '>').
         replace(/&lt;/g, '<').
         replace(/&#39/g,"'").
         replace(/&quot;/g, '"').
         replace(/&amp;/g, '&')
     );
 };