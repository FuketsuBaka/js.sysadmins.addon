// ==UserScript==
// @require      http://code.jquery.com/jquery-2.2.4.min.js
// @name         Hide page before it loads
// @namespace    http://sysadmins.ru/
// @version      0.1
// @description  Not needed!
// @author       Fuketsubaka
// @match        http://sysadmins.ru/*
// @grant        none
// ==/UserScript==
var $ = window.jQuery;
(function() {
    'use strict';
    var css = `
body {
   opacity: 0;
   transition: opacity 0.5s;
}
body.all-loaded {
   opacity: 1;
}
`
    var style = document.querySelector('style#ss_page_load');
    var need_append = false;
    if(!style){
        style = document.createElement('style');
        style.type = 'text/css';
        style.id = 'ss_page_load';
        need_append = true;
    }
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        // remove childs
        while (style.firstChild) {
            style.removeChild(style.firstChild);
        }
        style.appendChild(document.createTextNode(css));
    }
    if(need_append) { document.getElementsByTagName('head')[0].appendChild(style); }
})();

$(window).load(function() {
    $("body").addClass('all-loaded');
});