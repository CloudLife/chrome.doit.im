function getOAuth(callback){
	if(typeof(localStorage)=='undefined'){
		alert('Your browser does not support HTML5 localStorage. Try upgrading.');
	} else {
		var auth_url = 'https://openapi.doit.im/oauth/authorize?client_id=4d7ed681194f9951ca000642&redirect_uri=https%3A%2F%2Fopenapi.doit.im%2Foauth%2Fauth_result.html&response_type=token'
		var login_url = 'https://i.doit.im/signin';
		chrome.tabs.create({
    			url: auth_url,
    			selected: true
		    },
		    function(tab){
		    	chrome.tabs.onUpdated.addListener( function(tabId, changeinfo, tab){
				if((tab.id == tabId) && (changeinfo.url != login_url) && (changeinfo.url != undefined)){
						var token_url = tab.url;
						var token = token_url.split('access_token=')[1].split('&')[0];
						localStorage.setItem('user_token', token);
						chrome.tabs.remove(tab.id, function(){
						    callback && callback();
						});
				    }
		        });
	        }
		);
	}
}
function logout(){
    localStorage.removeItem('user_token');
    showCount();
}
$(document).ready(function() {
	if(localStorage.getItem('user_token') == undefined ){
	    $('#login_tip').show();
	    $('#auth_login').show().unbind('click').bind('click',function() {
	        getOAuth(function(){
	            showCount(function(){
	                location.reload();
	            });
	        });
	    });
	    $('#auth_logout').hide();
	}else{
	    $('#login_tip').hide();
	    $('#auth_login').hide();
	    $('#auth_logout').unbind('click').bind('click', function(){
	        logout();
	        location.reload();
	    }).show();
	}
	$('#logout').unbind('click').bind('click', function (){
	    logout();
	    location.reload();
	});
});