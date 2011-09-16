
/*====================
        加载完成
====================*/
$(document).ready(function() {
    //HTML国际化
    var L = chrome.i18n.getMessage;
    $('#logo h1').text(L('Doitim'));
    $('#task_add_button_wrap button').text(L('Add'));
    $('.message_text').text(L('Processing'));
    $('.tab-unfinished div').text(L('Uncompleted'));
    $('.tab-finished div').text(L('Completed'));
    $('.type-inbox .task-type-text').text(L('Inbox'));
    $('.type-overdue-today .task-type-text').text(L('Overdue_and_Today'));
    $('.type-scheduled .task-type-text').text(L('Scheduled'));
    $('.type-someday .task-type-text').text(L('Someday'));
    $('.type-today-finish .task-type-text').text(L('Today'));
    $('.type-yesterday-finish .task-type-text').text(L('Yesterday'));
    $('.type-earlier-finish .task-type-text').text(L('Earlier'));
//    $('#msg_box_title_text').text(L('Warning'));
//    $('#msg_box_content_text').text(L('Are you sure to delete the task?'));
    $('#msg_box_button_ok').text(L('OK'));
    $('#msg_box_button_cancel').text(L('Cancel'));
    $('#smart_add_help_title_text').text(L('smart_add_shortcuts'));
    $('#smart_add_help_close').text(L('Close'));
    $('#smart_add_project').text(L('Project'));
    $('#smart_add_date').text(L('Date'));
    
    $('#go_to_option_left').text(L('go_to_options_to_login_left'));
    $('#go_to_option').text(L('go_to_options_to_login'));
    $('#go_to_option_right').text(L('go_to_options_to_login_right'));
    //HTML国际化结束啊
    $('#task_add_help a').bind('click',function(){
        showSmartAddHelp();
    });
    $('#smart_add_help_close').bind('click',function(){
        hideSmartAddHelp();
    });
    var _tmpFlag = checkToken();
    //no 刷新
    var ts = JSON.parse(localStorage.getItem('all_tasks'));
    if(ts != null){
        for(var i = 0; i<ts.length; i++) {
            addTaskAuto(ts[i],'no');
        }
    }
    //no 刷新
    setTimeout(function(){
            if( _tmpFlag ){//有料
                setHeader(function(){//加入哦噢嗖
                    getProjects(function(projects){
                        PROJECTS = projects;
                        getProfile(function(profile){
                            var user_timezone = profile.user_timezone.split('T')[1].split(')')[0].toString().replace(':','');//+0800
                            var username = profile.username;
                            //localStorage.setItem('user_timezone',user_timezone);
                            //localStorage.setItem('username',username);
                            PROFILE.USER_TIMEZONE = user_timezone;
                            PROFILE.USERNAME = username;
                            getAllTasks(function(tasks){
                                //localStorage.removeItem('all_tasks');
                                //localStorage.setItem('all_tasks',JSON.stringify(tasks));
                                TASKS = tasks;
                                getUnfinishedTasks(tasks);
                                $('.tab-unfinished').bind('click',function() {
                                    getAllTasks(function(tasks){
                                        TASKS = tasks;
                                        getUnfinishedTasks(tasks);
                                    });
                                });
                                $('.tab-finished').bind('click',function() {
                                    getAllTasks(function(tasks){
                                        TASKS = tasks;
                                        getFinishedTasks(tasks);
                                    });
                                });
                            });
                        });
                        var $input = $('#task_add_input_wrap input');
                        $.smartAdd.setRules({flag:'^',list:[L('Today'),L('Tomorrow'),L('Someday'),'mm-dd','yy-mm-dd'],repeat:false,hr:3,className:['','','']},{flag:'#',list:projects,repeat:false,hr:-1});
                        $input.smartAdd();
                        $input.bind('keydown', function(e){
                            if(e.which == 13 && $('#smart_add_list').css('visibility') == 'hidden'){
                                readyToPostTask(this.value);
                            }
                        });
                        $('#task_add_button_wrap button').click(function(){
                            var v = $(this).parent().prev().find('input').val();
                            readyToPostTask(v);
                        });
                    });
                });
            }else{//没料
                window.close();
                open_option();
                return false;
            }
            
            $('#tasks_list').bind('click', function(e) {
                var $t = $(e.target);
                if($t.parents('#unfinished_tasks').length!=0){
                    if($t.parents('.complete-button').length != 0 || $t.hasClass('complete-button')){
                        var task = $t.parents('.task-wrap').data('task');
                        finishTask(task,function(task){
                            //删掉那个dom的task
                            var id = task.id;
                            slideUpTask(id);
                        });
                    }else if($t.parents('.delete-button-wrap').length != 0 || $t.hasClass('delete-button-wrap')){//删除
                        msg({title:L('Warning'),content:L('ARE_YOU_SURE_TO_DELETE_THE_TASK'),ok:function(){
                            var task = $t.parents('.task-wrap').data('task');
                            deleteTask(task,function(task){
                                //删掉那个dom的task
                                var id = task.id;
                                slideUpTask(id);
                            });
                        },cancel:function(){
                        }});
                    }
                }else if($t.parents('#finished_tasks').length!=0){
                    if($t.parents('.complete-button').length != 0 || $t.hasClass('complete-button')){
                        var task = $t.parents('.task-wrap').data('task');
                        unfinishTask(task,function(task){
                            //删掉那个dom的task
                            var id = task.id;
                            slideUpTask(id);
                        });
                    }else if($t.parents('.delete-button-wrap').length != 0 || $t.hasClass('delete-button-wrap')){//删除
                        msg({title:L('Warning'),content:L('ARE_YOU_SURE_TO_DELETE_THE_TASK'),ok:function(){
                            var task = $t.parents('.task-wrap').data('task');
                            deleteTask(task,function(task){
                                //删掉那个dom的task
                                var id = task.id;
                                slideUpTask(id);
                            });
                        },cancel:function(){
                        }});
                    }
                }
                return false;
            });
            makeTab();
            $('#tasks_list_tab').disableSelection();
            $('.task-type-wrap').disableSelection().click(function(){
                var $this = $(this);
                if($this.hasClass('type-open')){
                    $this.addClass('type-close').removeClass('type-open');
                }else if($this.hasClass('type-close')){
                    $this.addClass('type-open').removeClass('type-close');
                }
            });
            $('#go_to_option').click(function(){
                open_option();
                return false;
            });
            
            showCount();
            function readyToPostTask(smartAddString){
                {
                    var taskString = smartAddString;
                    var ary = taskString.split(' ');
                    var title = '';
                    var project = '';
                    var time = '';
                    for(var i = 0; i< ary.length; i++){
                        if(/^\#/.test(ary[i])){
                            project = ary[i].substring(1,ary[i].length);
                        }else if(/^\^/.test(ary[i])){
                            time = ary[i].substring(1,ary[i].length);
                        }else{
                            title += ' '+ary[i];
                        }
                    }
                    var task = {
                        id:makeUUID(),
                        title : $.trim(unescapeHTML(title)),
                        notes : '',
                        project : unescapeHTML(project),
                        start_at : null,//要拼凑
                        completed : null,
                        all_day : true,
                        attribute: 'inbox'
                    };
                    //task验证
                    if(task.title == '') {
                        M(L('TASK_VALI_TITLE_REQUIRED'));
                        return false;
                    } else if(task.title.length > 225) {
                        M(L('TASK_VALI_TITLE_TOO_LONG'));
                        return false;
                    } else if (task.project.length > 30){
                        M(L('TASK_VALI_PROJECT_TOO_LONG'));
                        return false;
                    }
                    //time处理
                    var start_at_tmp = null;
                    if($.trim(time)==''){
                        start_at_tmp = null;
                        task.attribute = 'inbox';
                    }else if(new RegExp(L('Tomorrow'),'i').test(time)){
                        start_at_tmp = Date.today().add(1).days().toString('yyyy-MM-dd HH:mm:ss ')+PROFILE.USER_TIMEZONE;
                        task.attribute = 'plan';
                        //U.log('tomorrow');
                    }else if(new RegExp(L('Someday'),'i').test(time)){
                        start_at_tmp = null;
                        task.attribute = 'noplan';
                        //U.log('someday');
                    }else if(new RegExp(L('Today'),'i').test(time)){
                        start_at_tmp = Date.today().toString('yyyy-MM-dd HH:mm:ss ')+PROFILE.USER_TIMEZONE;
                        task.attribute = 'plan';
                        //U.log('today');
                    }else{
                        task.attribute = 'plan';
                        var input_text = $.trim(time);
                        //这边是需要重构的
                        if( input_text.match(/^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/) ){//yyyy-mm-dd
                            start_at_tmp = input_text+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp);
                        }else if( input_text.match(/^(\d{4})\/(0\d{1}|1[0\/2])\/(0\d{1}|[12]\d{1}|3[01])$/) ){//yyyy/mm/dd
                            start_at_tmp = input_text.replace(/\//g,'-')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp);
                        }else if( input_text.match(/^(\d{2})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/) ){//yy-mm-dd
                            start_at_tmp = new Date().getFullYear().toString().substring(0,2)+input_text+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp);
                        }else if ( input_text.match(/^(\d{2})\/(0\d{1}|1[0\/2])\/(0\d{1}|[12]\d{1}|3[01])$/) ){//yy/mm/dd
                            start_at_tmp = new Date().getFullYear().toString().substring(0,2)+input_text.replace(/\//g,'-')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp);
                        }else if ( input_text.match(/^(\d{2})-([1-9])-([1-9])$/) ){//yy-m-d
                            start_at_tmp = new Date().getFullYear().toString().substring(0,2)+input_text.replace(/-/g,'-0')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                        }else if ( input_text.match(/^(\d{2})\/([1-9])\/([1-9])$/) ){//yy/m/d
                            start_at_tmp = new Date().getFullYear().toString().substring(0,2)+input_text.replace(/\//g,'-0')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                        }else if (input_text.match(/^(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/)){//mm-dd
                            start_at_tmp = new Date().getFullYear().toString()+'-'+input_text+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp+'mm-dd');
                        }else if (input_text.match(/^(0\d{1}|1[0\/2])\/(0\d{1}|[12]\d{1}|3[01])$/)){//mm/dd
                            start_at_tmp = new Date().getFullYear().toString()+'-'+input_text.replace(/\//g,'-')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp+'mm/dd');
                        }else if(input_text.match(/^([1-9])-(0\d{1}|[12]\d{1}|3[01])$/)){//m-dd
                            start_at_tmp = new Date().getFullYear().toString()+'-0'+input_text+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp+'m-dd');
                        }else if(input_text.match(/^([1-9])\/(0\d{1}|[12]\d{1}|3[01])$/)){//m/dd
                            start_at_tmp = new Date().getFullYear().toString()+'-0'+input_text.replace(/\//g,'-')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp+'m/dd');
                        }else if(input_text.match(/^(0\d{1}|1[0-2])-([1-9])$/)){//mm-d
                            start_at_tmp = new Date().getFullYear().toString()+'-'+input_text.replace(/-/g,'-0')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp+'mm-d');
                        }else if(input_text.match(/^(0\d{1}|1[0\/2])\/([1-9])$/)){//mm/d
                            start_at_tmp = new Date().getFullYear().toString()+'-'+input_text.replace(/\//g,'-0')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp+'mm/d');
                        }else if(input_text.match(/^([1-9])-([1-9])$/)){//m-d
                            start_at_tmp = new Date().getFullYear().toString()+'-0'+input_text.replace(/-/g,'-0')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp+'m-d');
                        }else if(input_text.match(/^([1-9])\/([1-9])$/)){//m/d
                            start_at_tmp = new Date().getFullYear().toString()+'-0'+input_text.replace(/\//g,'-0')+' 00:00:00 '+PROFILE.USER_TIMEZONE;
                            //U.log(start_at_tmp+'m/d');
                        }else{
                            start_at_tmp = Date.today().toString('yyyy-MM-dd HH:mm:ss ')+PROFILE.USER_TIMEZONE;
                            //U.log('today'); 
                        }
                    }
                    task.start_at = start_at_tmp;
                    postTask(task,function(){
                        addTaskAuto(task);
                        $input.val('');
                    });
                    return false;
                }
            }
        },350)
    
});