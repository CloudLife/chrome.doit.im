var _L = chrome.i18n.getMessage;
//右键添加选中的文字
var title_selection = _L("background_add_select_text_left")+"%s"+_L("background_add_select_text_right");
var id_selection = chrome.contextMenus.create({
    'title': title_selection, 'contexts':['selection'], 'onclick': function(OnClickData){
        var tmp = $.trim(OnClickData.selectionText);
        if(tmp.length > 225){
            alert(_L('TASK_VALI_TITLE_TOO_LONG'));
            return;
        }
        else{
            var task = {
                id:makeUUID(),
                title : tmp,
                notes : '',
                project : '',
                start_at : null,//要拼凑
                completed : null,
                all_day : true,
                attribute: 'inbox'
            }
            postTask(task,function(t){
                //alert('selection '+OnClickData.selectionText);
                alert(_L('Success'));
            });
        }
    }
});
//右键添加链接
var title_link= _L("background_add_link");
var id_link = chrome.contextMenus.create({
    'title': title_link, 'contexts':['link'], 'onclick': function(OnClickData){
        var tmp = $.trim(OnClickData.linkUrl);
        if(tmp.length > 225){
            alert(_L('TASK_VALI_TITLE_TOO_LONG'));
            return;
        }else{
            var task = {
                id:makeUUID(),
                title : tmp,
                notes : '',
                project : '',
                start_at : null,//要拼凑
                completed : null,
                all_day : true,
                attribute: 'inbox'
            }
            postTask(task,function(t){
                alert(_L('Success'));
            });
        }
//        alert('link '+OnClickData.linkUrl);
    }
});
//右键添加当页地址
var title_page= _L("background_add_page_url");
var id_page = chrome.contextMenus.create({
    'title': title_page, 'contexts':['page'], 'onclick': function(OnClickData){
        var tmp = $.trim(OnClickData.pageUrl);
        if(tmp.length > 225){
            alert(_L('TASK_VALI_TITLE_TOO_LONG'));
            return;
        }else{
            var task = {
                id:makeUUID(),
                title : tmp,
                notes : '',
                project : '',
                start_at : null,//要拼凑
                completed : null,
                all_day : true,
                attribute: 'inbox'
            }
            postTask(task,function(t){
                alert(_L('Success'));
            });
        }
        //alert('page '+OnClickData.pageUrl);
    }
});
showCount();
getProjects();
setInterval(function(){
    showCount();
},10000);