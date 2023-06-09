/*
 * jQuery Timer Plugin
 * http://www.evanbot.com/article/jquery-timer-plugin/23
 *
 * @version      1.0
 * @copyright    2009 Evan Byrne (http://www.evanbot.com)
 */ 

/**
 * Set timer to run for specified number of milliseconds
 * 
 * @param timer     is the timer interval in milliseconds
 * @param func      is called when the timer expires
 * @param callback  (optional) is called if and when the timer is cancelled
 */
jQuery.timer = function(time,func,callback){
	var a = {timer:setTimeout(func,time),callback:null}
	if(typeof(callback) == 'function'){a.callback = callback;}
	return a;
};

/**
 * Cancel a previous timer
 */
jQuery.clearTimer = function(a){
	clearTimeout(a.timer);
	if(typeof(a.callback) == 'function'){a.callback();};
	return this;
};
