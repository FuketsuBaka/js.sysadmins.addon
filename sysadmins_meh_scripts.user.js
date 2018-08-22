// ==UserScript==
// @require      http://code.jquery.com/jquery-2.2.4.min.js
// @require      http://userscripts-mirror.org/scripts/source/107941.user.js
// @require      https://github.com/FuketsuBaka/js.sysadmins.addon/raw/master/hide_page_before_it_loads.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-start
// @name         Sysadmins Meh... scripts
// @namespace    http://sysadmins.ru/
// @version      0.1.1
// @description  Not available.
// @author       Fuketsubaka
// @match        http://sysadmins.ru/*
// ==/UserScript==
(function() {
    'use strict';
})();

var $ = window.jQuery;
document.addEventListener("DOMContentLoaded", DOM_content_ready);
window.addEventListener("load", page_fully_loaded);

function DOM_content_ready(){
    var menu = new user_menu();
    //console.log('---start menu init---');
    menu.init();
    //console.log('MENU - draw top');
    menu.draw_top();
    //console.log('MENU - draw bottom');
    menu.draw_bottom();
    //console.log('MENU - draw options screen');
    menu.draw_options_screen();
    //console.log('MENU - draw css edit');
    menu.draw_css_edit_panel();

    var css = new css_injection();
    //console.log('CSS - injection load');
    css.load();

    var opt = new options();
    //console.log('OPTS - apply');
    opt.apply_options();

    var bl = new ss_blacklist();
    //console.log('BL - parse page');
    bl.parse_page_hide(true);
    //console.log('---done---');
    // *********************************** EVENT CALLS
    //console.log('BIND EVENT - dragElement');
    dragElement(document.getElementById("ss_edit_container"));
    //console.log('BIND EVENT - enableTab');
    enableTab(document.getElementById("ss_edit_textarea"));
}

function page_fully_loaded(){
    // we might need it later
}

// *********************************** GLOBAL CALLS
function toggle_blacklist_global(e){
    var bl = new ss_blacklist();
    bl.toggle_blacklist(e.id, e.name);
    bl.parse_page_hide(false);
}
function ss_bl_list_remove(e, all){
    function get_selected_vals() {
        var opt;
        for (var i = 0; i < selector.options.length; i++) {
            opt = selector.options[i];
            if (opt.selected) {
                result.push(opt.value);
            }
        }
    }
    var selector = document.getElementById('ss_cb_list');
    if(typeof selector == 'undefined' || selector == null){
        return;
    }
    var result = [];
    var bl;
    if(all === true){
        bl = new ss_blacklist();
        bl.drop_bl();
        bl.parse_page_hide(false);
    } else {
        get_selected_vals();
        if(result.length == 0){
            return;
        }
        bl = new ss_blacklist();
        bl.pop_from_bl_multy(result);
        bl.parse_page_hide(false);
    }
    setup_bl_list(selector, bl.get_bl());
}
function menu_page_scroll(isUp){
    function scrollToTop() {
        if ($('html').scrollTop()) {
            $('html').animate({ scrollTop: 0 });
            return;
        }
        if ($('body').scrollTop()) {
            $('body').animate({ scrollTop: 0 });
            return;
        }
    }
    function scrollToBottom() {
        if ($('html').scrollTop() + $('html').height()) {
            $('html').animate({ scrollTop: $('html').height() });
            return;
        }
        if ($('body').scrollTop() + $('body').height()) {
            $('body').animate({ scrollTop: $('body').height() });
            return;
        }
    }
    if(isUp){
        scrollToTop();
    } else {
        scrollToBottom();
    }
}
function menu_invoke_link(e){
    location.href = e.getAttribute('link');
}
function ss_show_main_menu(){
    var options_screen = document.getElementById('ss_id_options');
    if(options_screen){
        options_screen.classList.toggle('ss_opened');
    }
}
function ss_init_options_firsttime(){

}
function ss_toggle_option(e){
    if(e.value == 'toggle_blacklist'){
        var bl = new ss_blacklist();
        bl.toggle_bl_status(e.checked);
        bl.parse_page_hide(false);
    } else {
        var opts = new options();
        opts.set_option(e.value, e.checked);
        //opts.update_visual(e.value, e.id);
        opts.apply_options();
    }
}
function ss_toggle_style(e){
    var css = new css_injection();
    var current_style = css.get_current_style();
    var selected_style = e.value;
    if(current_style == selected_style){ return; }
    if(selected_style === 'disabled'){
        css.set_disabled();
    } else if(selected_style === 'default'){
        css.set_default();
    } else if(selected_style === 'user defined'){
        css.set_user_defined();
    }
    var main_div = document.getElementById('ss_edit_container');
    if(main_div){
        if(main_div.classList.contains('ss_opened')){
            main_div.classList.remove('ss_opened');
        }
    }
    init_edit_css_button();
}
function ss_toggle_hide_type(e){
    var bl = new ss_blacklist();
    var hide_type = bl.hide_type;
    var selected_type = e.value;
    if(selected_type == hide_type){
        return;
    }
    bl.set_hide_type(selected_type);
    bl.parse_page_hide(false);
}
function ss_show_edit_panel(){
    var main_div = document.getElementById('ss_edit_container');
    if(main_div){
        main_div.classList.toggle('ss_opened');
        if(main_div.classList.contains('ss_opened')){
            var textarea = document.getElementById('ss_edit_textarea');
            if(textarea){
                // loaded firsttime
                if(textarea.value == ''){
                    var css = new css_injection();
                    textarea.value = css.get_user_style_css();
                }
            }
        }
    }
}
function init_edit_css_button(){
    // ss_btn_editcss, ss_cb_select_style, user defined
    var edit_btn = document.getElementById('ss_btn_editcss');
    if(!edit_btn){ return; }
    var selector = document.getElementById('ss_cb_select_style');
    if(!selector){ edit_btn.disabled = true; return; }
    edit_btn.disabled = !(selector.value == 'user defined');
}
function ss_edit_controls(btn_cmd){
    var textarea = document.getElementById('ss_edit_textarea');
    if(textarea){
        var css = new css_injection();
        if(btn_cmd === 'load'){
            // load style css from css_injection
            textarea.value = css.get_user_style_css();
        } else if(btn_cmd === 'save'){
            css.set_user_style_css(textarea.value);
            css.load();
        } else if(btn_cmd === 'default'){
            var default_css = css.get_user_style_css('default');
            textarea.value = default_css;
            alert('This is predefined style. You can view it by selecting \'default\' style. Your style will not be overwritten until you \'Save\'');
        }
    }
}
// *********************************** MENU
function user_menu(){
    this.draw_top = function(){
        var paint = new HTML_paint();
        var menu;
        menu = document.createElement('div');
        menu.id = 'ss_menu_top';
        menu.className = 'ss_floatingmenu';
        document.body.appendChild(menu);
        // ****
        var link_options = {
            href: '/',
        };
        var a_href;
        a_href = paint.draw_element(menu, 'a', '◄    Главная', link_options,true);
        link_options.href = '/search.php?search_id=newposts';
        a_href = paint.draw_element(menu, 'a', '◄    Все новые сообщения тут', link_options,true);
        link_options.href = '/search.php?search_id=egosearch';
        a_href = paint.draw_element(menu, 'a', '◄    Мои сообщения', link_options,true);
    }
    this.draw_bottom = function(){
        function set_navigate_params(btn_left, btn_right, btn_first, btn_last){
            var page_navigations = document.querySelectorAll('span.navbig');
            var page_navigation = page_navigations[page_navigations.length - 1];
            if(page_navigation){
                var nav_links = page_navigation.querySelectorAll('span.navbig > a, b');
                var first_a;
                var last_a;
                var next_a;
                var prev_a;
                var max_index = nav_links.length-1;
                if(nav_links[0]){
                    if(nav_links[0].innerHTML.toLowerCase() === "пред." && nav_links[1]){
                        prev_a = nav_links[0];
                        first_a = nav_links[1];
                    } else {
                        first_a = nav_links[0];
                    }
                }
                if(first_a && first_a.tagName.toLowerCase() == 'b'){
                    // we are on first page
                    first_a = null;
                }
                if(nav_links[max_index]){
                    if(nav_links[max_index].innerHTML.toLowerCase() === "след." && nav_links[max_index-1]){
                        next_a = nav_links[max_index];
                        last_a = nav_links[max_index-1];
                    } else {
                        last_a = nav_links[max_index];
                    }
                }
                 if(last_a && last_a.tagName.toLowerCase() == 'b'){
                    // we are on last page
                    last_a = null;
                }
                // apply to buttons
                if(first_a){ btn_first.setAttribute('link', first_a.getAttribute('href'));
                } else { btn_first.disabled = true; }
                if(last_a){ btn_last.setAttribute('link', last_a.getAttribute('href'));
                } else { btn_last.disabled = true; }
                if(prev_a){ btn_left.setAttribute('link', prev_a.getAttribute('href'));
                } else { btn_left.disabled = true; }
                if(next_a){ btn_right.setAttribute('link', next_a.getAttribute('href'));
                } else { btn_right.disabled = true; }
            } else {
                btn_left.disabled = true;
                btn_right.disabled = true;
                btn_first.disabled = true;
                btn_last.disabled = true;
            }
        }
        var paint = new HTML_paint();
        var menu;
        menu = document.createElement('div');
        menu.id = 'ss_menu_bottom';
        menu.className = 'ss_bottommenu';
        document.body.appendChild(menu);
        var btn_options = {};
        var btn;
        // **** GO UP
        btn_options = { class: 'ss_button' };
        btn = paint.draw_element(menu, 'button', '▲', btn_options, true);
        btn.onclick = function(){ menu_page_scroll(true); };
        // **** GO DOWN
        btn = paint.draw_element(menu, 'button', '▼', btn_options, true);
        btn.onclick = function(){ menu_page_scroll(false); };
        // **** SEPARATOR
        paint.draw_element(menu, 'div', '', {class: 'ss_menu_separator'}, false);
        // **** NAVIGATE
        // first
        // left U+25C4
        // right U+25BA
        var btn_first = paint.draw_element(menu, 'button', '|◄', btn_options, true);
        btn_first.onclick = function(){ menu_invoke_link(this); };
        // left and right
        var btn_left = paint.draw_element(menu, 'button', '◄', btn_options, true);
        btn_left.onclick = function(){ menu_invoke_link(this); };
        var btn_right = paint.draw_element(menu, 'button', '►', btn_options, true);
        btn_right.onclick = function(){ menu_invoke_link(this); };
        // last
        var btn_last = paint.draw_element(menu, 'button', '►|', btn_options, true);
        btn_last.onclick = function(){ menu_invoke_link(this); };
        set_navigate_params(btn_left, btn_right, btn_first, btn_last);
        // **** SEPARATOR
        paint.draw_element(menu, 'div', '', {class: 'ss_menu_separator'}, false);
        // **** OPTIONS
        btn_options = { class: 'ss_button', style:{fontSize: '12px'}};
        btn = paint.draw_element(menu, 'button', '☰', btn_options, true);
        btn.onclick = function(){ ss_show_main_menu(); };
    }
    this.draw_options_screen = function(){
        function draw_option_checkbox(parent, opt_id, opt_class, label_text, opt_value){
        // **** Inner Elements Container
            opts_container = paint.draw_element(parent, 'div', '', {class: opt_class}, false);
            // **** Inner Elements
            inner_params = {
                type: 'checkbox',
                class: opt_class,
                value: opt_value
            };
            inner_opt = paint.draw_element(opts_container, 'input', '', inner_params, false);
            inner_opt.id = opt_id;
            paint.draw_element(opts_container, 'label', label_text, { class: opt_class }, false);
            return inner_opt;
        }
        function draw_option_selector(parent, opt_id, opt_class, label_text){
        // **** Inner Elements Container
            opts_container = paint.draw_element(parent, 'div', '', {class: opt_class}, false);
            // **** Inner Elements
            inner_params = {
                class: opt_class
            };
            inner_opt = paint.draw_element(opts_container, 'select', '', inner_params, false);
            inner_opt.id = opt_id;
            paint.draw_element(opts_container, 'label', label_text, { class: opt_class }, false);
            return inner_opt;
        }
        function setup_bl_selector(selector){
            // on create bl have list of users, current style and array of styles
            // this.bad_ids, hide_types, this.hide_type
            var bl = new ss_blacklist();
            var hide_types = bl.hide_types;
            var hide_type = bl.hide_type;
            var bad_ids = bl.bad_ids;
            var opt_match;
            for(var i = 0; i < hide_types.length; i++){
                opt_match = (hide_types[i] == hide_type);
                selector.options.add(new Option(hide_types[i], hide_types[i], opt_match));
                if(opt_match === true){ selector.value = hide_types[i]; }
            }
            selector.onchange = function(){ ss_toggle_hide_type(this); };
        }
        var paint = new HTML_paint();
        var options_screen;

        // ***************************** PREPARE
        options_screen = document.createElement('div');
        options_screen.id = 'ss_id_options';
        options_screen.classList.add('ss_opts');
        options_screen.classList.add('ss_default_closed');
        document.body.appendChild(options_screen);
        // **** HEADER
        var options_header_wrapper = paint.draw_element(options_screen, 'div', '', {id: 'ss_opts_container_h_wrap', class: 'ss_header'}, false);
        var options_header = paint.draw_element(options_header_wrapper, 'div', 'Settings', {id: 'ss_opts_container_header', class: 'ss_header_label'}, false);
        var close_btn = paint.draw_element(options_header_wrapper, 'button', '✖', {class: 'ss_close ss_header'}, false);
        close_btn.onclick = function(){ ss_show_main_menu(); };
        // **** Options left cont
        var options_screen_left = document.createElement('div');
        options_screen_left.id = 'ss_id_options_1';
        options_screen_left.className = 'ss_opts_left';
        options_screen.appendChild(options_screen_left);
        // **** Args prep
        var opts_container;
        var inner_params;
        var inner_opt;

        // ***************************** OPTIONS
        // section header
        paint.draw_element(options_screen_left, 'p', 'Скрытие элементов', {class: 'ss_opts_title', width: '100%'}, false);
        // function draw_option_checkbox(parent, opt_id, opt_class, label_text, opt_value)
        inner_opt = draw_option_checkbox(options_screen_left, 'ss_cb_hide_header', 'ss_opts_checkbox', 'Скрыть шапку', 'hide_header');
        inner_opt.onclick = function(){ ss_toggle_option(this); };
        inner_opt = draw_option_checkbox(options_screen_left, 'ss_cb_hide_search', 'ss_opts_checkbox', 'Скрыть поиск', 'hide_search');
        inner_opt.onclick = function(){ ss_toggle_option(this); };
        inner_opt = draw_option_checkbox(options_screen_left, 'ss_cb_hide_bottom', 'ss_opts_checkbox', 'Скрыть подвал', 'hide_bottom');
        inner_opt.onclick = function(){ ss_toggle_option(this); };
        // section separator
        paint.draw_element(options_screen_left, 'hr', '', {width: '90%'}, false);

        // ***************************** STYLE
        // function to modify = css_injection
        // GM option for current style: currentStyle
        // GM option for list of styles: userStyle
        // section header
        paint.draw_element(options_screen_left, 'p', 'Опции стилей', {class: 'ss_opts_title', width: '100%'}, false);
        // function draw_option_selector(parent, opt_id, opt_class, label_text)
        inner_opt = draw_option_selector(options_screen_left, 'ss_cb_select_style', 'ss_opts_selector', 'Выбранный стиль');
        var css = new css_injection();
        var style_list = css.get_style_list();
        var current_style = css.get_current_style();
        // drawing options
        var style_match;
        for(var i = 0; i < style_list.length; i++){
            style_match = (style_list[i] == current_style);
            inner_opt.options.add(new Option(style_list[i], style_list[i], style_match));
            if(style_match === true){ inner_opt.value = style_list[i]; }
        }
        inner_opt.onchange = function(){ ss_toggle_style(this); };
        // Edit button for custom CSS
        var edit_btn = paint.draw_element(options_screen_left, 'button', 'Edit', {id: 'ss_btn_editcss', class: 'ss_button'}, false);
        edit_btn.onclick = function(){ ss_show_edit_panel(); };
        // ***************************** BLACKLIST
        // --- PREPARE
        // First - draw right container
        // options_screen is a main container
        // .ss_opts_right - class for div on the right side
        // #ss_id_options_2 - id
        // **** Options left cont
        var options_screen_right = document.createElement('div');
        options_screen_right.id = 'ss_id_options_2';
        options_screen_right.className = 'ss_opts_right';
        options_screen.appendChild(options_screen_right);
        // ***************************** OPTIONS
        // section header
        paint.draw_element(options_screen_right, 'p', 'Черные списки', {class: 'ss_opts_title', width: '100%'}, false);
        // function draw_option_checkbox(parent, opt_id, opt_class, label_text, opt_value)
        inner_opt = draw_option_checkbox(options_screen_right, 'ss_cb_blacklist', 'ss_opts_checkbox', 'Вкл/Выкл', 'toggle_blacklist');
        inner_opt.onclick = function(){ ss_toggle_option(this); };
        // function draw_option_selector(parent, opt_id, opt_class, label_text)
        var inner_bl_selector = draw_option_selector(options_screen_right, 'ss_cb_select_style', 'ss_opts_selector', 'Режим скрытия');
        setup_bl_selector(inner_bl_selector);
        // section separator
        paint.draw_element(options_screen_right, 'hr', '', {width: '90%'}, false);
        // list of blacklisted
        // class container .ss_list_item
        var inner_bl_list = draw_option_selector(options_screen_right, 'ss_cb_list', 'ss_list_item', '');
        inner_bl_list.size = 18;
        inner_bl_list.multiple = true;
        setup_bl_list(inner_bl_list, null);
        // bottom controls. Remove, Clear list
        var control_div = paint.draw_element(options_screen_right, 'div', '', {class: 'ss_bl_controls'}, false);
        var remove_btn = paint.draw_element(control_div, 'button', 'Remove', {id: 'ss_btn_bl_remove', class: 'ss_button'}, false);
        var clear_list_btn = paint.draw_element(control_div, 'button', 'Clear', {id: 'ss_btn_bl_clear', class: 'ss_button'}, false);
        remove_btn.onclick = function(){ ss_bl_list_remove(this, false); };
        clear_list_btn.onclick = function(){ ss_bl_list_remove(this, true); };
        // ***************************** FINALLY
        var opts = new options();
        opts.init_options_on_screen();
        init_edit_css_button();
    }
    this.draw_css_edit_panel = function(){
        var paint = new HTML_paint();
        // Container
        var main_div = document.createElement('div');
        main_div.id = 'ss_edit_container';
        main_div.classList.add('ss_edit_css');
        main_div.classList.add('ss_default_closed');
        document.body.appendChild(main_div);
        // header
        // header container
        var main_header_wrapper = paint.draw_element(main_div, 'div', '', {id: 'ss_edit_container_h_wrap', class: 'ss_header', style: {display: 'block'}}, false);
        var main_header = paint.draw_element(main_header_wrapper, 'div', 'Edit user style', {id: 'ss_edit_container_header', class: 'ss_header_label'}, false);
        var close_btn = paint.draw_element(main_header_wrapper, 'button', '✖', {class: 'ss_close ss_header'}, false);
        close_btn.onclick = function(){ ss_show_edit_panel(); };
        // Input field
        var input_field;
        input_field = paint.draw_element(main_div, 'textarea', '', {id: 'ss_edit_textarea', class: 'ss_edit_css'}, false);
        input_field.value = '';
        // Controls
        // Container oes first
        var main_controls_wrapper = paint.draw_element(main_div, 'div', '', {id: 'ss_edit_container_c_wrap', class: 'ss_controls'}, false);
        var btn;
        var btn_options = { class: 'ss_button' };
        btn = paint.draw_element(main_controls_wrapper, 'button', 'Save', btn_options, false);
        btn.onclick = function(){ ss_edit_controls('save'); };
        btn = paint.draw_element(main_controls_wrapper, 'button', 'Load', btn_options, false);
        btn.onclick = function(){ ss_edit_controls('load'); };
        btn = paint.draw_element(main_controls_wrapper, 'button', 'Load \'default\' CSS', btn_options, false);
        btn.onclick = function(){ ss_edit_controls('default'); };
    }
    this.init = function(){
        var paint = new HTML_paint();
        paint.inject_css(new css_lib().css_floatingmenu, 'ss_style_menu_top');
    }
}
// public construction
// call on BL update
// selector id: #ss_cb_list
function setup_bl_list(selector, opts){
    function clear_selector(){
        var i;
        for(i = selector.options.length - 1 ; i >= 0 ; i--)
        {
            selector.remove(i);
        }
    }
    // selector might be null
    if(selector === null){
        selector = document.getElementById('ss_cb_list');
        if(typeof selector == 'undefined' || selector == null){
            return;
        }
    }
    clear_selector();
    if(opts === null){
        opts = new ss_blacklist().bad_ids;
        if(typeof opts == 'undefined'){
           return;
        }
    }
    var x;
    for(x in opts){
        selector.options.add(new Option(opts[x], x, false));
    }
}
// *********************************** CSS Injection
// GM vars:
// userStyle - named array, style_name : css_text
// currentStyle - string style_name
// 3 styles available: 'default', 'user defined', 'disabled'
function css_injection(){
    // ******************************* SUPPORT FUNCTIONS
    var user_styles_available = ['default', 'user defined', 'disabled'];
    function mod_array(userStyle, style_name, css_text){
        if(!userStyle || typeof(userStyle) !== 'object'){
            userStyle = {};
        }
        if(!user_styles_available.includes(style_name)){
            return userStyle;
        }
        userStyle[style_name] = css_text;
        return userStyle;
    }
    function get_array_val(userStyle, style_name){
        if(userStyle.hasOwnProperty(style_name)){
            return userStyle[style_name];
        }
        return '';
    }
    this.get_style_list = function(){
        return user_styles_available;
    }
    // ******************************* SAVE AND LOAD
    this.load = function(){
        var style_name = this.get_current_style();
        if(!user_styles_available.includes(style_name)){
            return;
        }
        // console.log('loading style: ' + style_name);
        var userStyle = GM_getValue('userStyle', {});
        var style = document.querySelector('style#ss_userStyle');
        var need_append = false;
        if(!style){
            style = document.createElement('style');
            style.type = 'text/css';
            style.id = 'ss_userStyle';
            need_append = true;
        }
        // ---------------------------- default || user defined
        if(style_name === 'default' || style_name === 'user defined'){
            if (style.styleSheet) {
                style.styleSheet.cssText = get_array_val(userStyle, style_name);
            } else {
                // remove childs
                while (style.firstChild) {
                    style.removeChild(style.firstChild);
                }
                style.appendChild(document.createTextNode(get_array_val(userStyle, style_name)));
            }
            if(need_append) { document.getElementsByTagName('head')[0].appendChild(style); }
            mod_page_elements();
        }
        // ---------------------------- disabled
        if(style_name === 'disabled'){
            if(style && style != null){
                style.remove();
                return;
            }
        }
    }
    this.save = function(style_name, css_text){
        var userStyle = GM_getValue('userStyle', {});
        userStyle = mod_array(userStyle, style_name, css_text);
        GM_setValue('userStyle', userStyle);
    }
    // ******************************* GET AND SET CURRENT STYLE
    this.get_current_style = function(){
        var currentStyle = GM_getValue('currentStyle', '');
        if(typeof(currentStyle) === 'string' && currentStyle != ''){
            return currentStyle;
        }
        return 'disabled';
    }
    this.set_current_style = function(style_name){
        GM_setValue('currentStyle', style_name);
    }
    // ******************************* DEFAULT
    this.set_default = function(){
        this.set_current_style('default');
        this.save('default', new css_lib().css_default_style);
        this.load();
    }
    // ******************************* USER DEFINED
    this.set_user_defined = function(){
        // get text for userstyle from input field
        var textarea = document.getElementById('ss_edit_textarea');
        var user_css = '';
        if(textarea){
            user_css = textarea.value;
        }
        this.save('user defined', user_css);
        // save it
        this.set_current_style('user defined');
        this.load();
    }
    this.get_user_style_css = function(style_name){
        if(!style_name){ style_name = 'user defined' }
        var userStyle = GM_getValue('userStyle', {});
        var user_css = get_array_val(userStyle, style_name);
        return user_css;
    }
    this.set_user_style_css = function(css_text){
        this.save('user defined', css_text);
    }
    // ******************************* DISABLED
    this.set_disabled = function(){
        this.set_current_style('disabled');
        this.load();
    }
}
// *********************************** OPTIONS
// GM vars:
// options - named array, opt_name: boolean
function options(){
    this.get_options = function(){
        var opts = GM_getValue('options', {});
        if(!opts || typeof(opts) !== 'object'){
            opts = {};
        }
        return opts;
    }
    this.get_option = function(opt_name){
        var opts = this.get_options();
        if(opts[opt_name]){
            return opts[opt_name];
        } else {
            return null;
        }
    }
    this.toggle_option = function(opt_name){
        var opt = this.get_option(opt_name);
        if(opt == null){ opt = false; }
        opt = !opt;
        this.set_option(opt_name, opt);
    }
    this.set_option = function(opt, new_val){
        var opts = this.get_options();
        opts[opt] = new_val;
        GM_setValue('options', opts);
    }
    this.apply_options = function(){
        var i;
        var e;
         // *************** TOP
        var header_e;
        var search_e;
        var es;
        var opts = this.get_options();

        // **** Getting elements
        /*
        es = document.querySelectorAll('table');
        for (i = 0; i < es.length; i++) {
            e = es[i];
            if(e.getAttribute('background') == '/images/header.gif'){
                header_e = e;
                break;
            }
        }
        */
        header_e = getElementByXpath('/html/body/table[1]/tbody/tr/td/table[1]');
        search_e = getElementByXpath('/html/body/table[1]/tbody/tr/td/table[2]');
        // **** Applying
        if(typeof header_e != 'undefined' && header_e){
            if(opts.hasOwnProperty('hide_header') && opts.hide_header === true){
                if(!(header_e.classList.contains("ss_hidden"))){
                    header_e.classList.add("ss_hidden");
                }
            } else {
                if(header_e.classList.contains("ss_hidden")){
                    header_e.classList.remove("ss_hidden");
                }
            }
        }
        if(typeof search_e != 'undefined' && search_e){
            if(opts.hasOwnProperty('hide_search') && opts.hide_search === true){
                if(!(search_e.classList.contains("ss_hidden"))){
                    search_e.classList.add("ss_hidden");
                }
            } else {
                if(search_e.classList.contains("ss_hidden")){
                    search_e.classList.remove("ss_hidden");
                }
            }
        }
        // *************** BOTTOM
        var bottom_e = document.querySelectorAll('center');
        bottom_e = bottom_e[bottom_e.length-1];
        if(bottom_e){
            var parent = bottom_e.parentNode;
            var current_node = parent.children[parent.children.length-1];
            // **** Applying
            // /html/body/table/tbody/tr/td/table/tbody/tr/td
            if(opts.hasOwnProperty('hide_bottom') && opts.hide_bottom === true){
                if(bottom_e && !(bottom_e.classList.contains("ss_hidden"))){
                    bottom_e.classList.add("ss_hidden");
                }
                if(current_node && !(current_node.classList.contains("ss_hidden"))){
                    current_node.classList.add("ss_hidden");
                }
            } else {
                if(bottom_e && bottom_e.classList.contains("ss_hidden")){
                    bottom_e.classList.remove("ss_hidden");
                }
                if(current_node && current_node.classList.contains("ss_hidden")){
                    current_node.classList.remove("ss_hidden");
                }
            }
        }
    }
    this.init_options_on_screen = function(){
        this.update_visual('hide_header', 'ss_cb_hide_header');
        this.update_visual('hide_search', 'ss_cb_hide_search');
        this.update_visual('hide_bottom', 'ss_cb_hide_bottom');
    }
    this.update_visual = function(opt_name, elem_id){
        var opt = this.get_option(opt_name);
        var e = document.getElementById(elem_id);
        if(opt){
            e.checked = opt;
        }
    }
}
function mod_page_elements(){
    // good to know we did all by CSS
}

// *********************************** BLACKLIST
// GM vars:
// bl_status: true / false
// blacklist: named array, user_id : user_name
// hide_types: predefined array, ['minimize', 'blur', 'hide'], default minimize
function ss_blacklist(){
    this.get_bl_status = function(){
        return GM_getValue("bl_status", false);
    }
    this.toggle_bl_status = function(checked){
        GM_setValue("bl_status", checked);
        this.bl_status = checked;
    }
    // *********************************************** UPDATE
    this.update = function(){
        this.bl_status = this.get_bl_status();
        this.hide_type = this.get_hide_type();
        this.hide_style = 'ss_bl_' + this.hide_type;
        this.bad_ids = this.get_bl();
    }
    // *********************************************** HIDE TYPE
    this.get_hide_type = function(){
        var saved_value = GM_getValue("hide_type", '');
        if(saved_value !== '' && this.hide_types.includes(saved_value)){
            return saved_value;
        }
        return 'minimize';
    }
    this.set_hide_type = function(new_val){
        GM_setValue("hide_type", new_val);
        this.update();
    }
    // *********************************************** PARSE PAGE
    this.parse_page_hide = function(firstTime){
        if(firstTime){
            var e = document.getElementById('ss_cb_blacklist');
            if(e != null){
                e.checked = this.bl_status;
            }
        }
        //console.log(this.bad_ids);
        var paint = new HTML_paint();
        var span;
        var usr_id;
        function draw_controls(id, name, span){
            var user_root = span.parentNode;
            if(user_root.tagName.toLowerCase() !== "td"){
                user_root = user_root.parentNode;
            }
            var btn_options = {id: id, name : name, class: 'ss_button ss_bl_msg'};
            var btn;
            var btn_container;
            //paint.draw_element(span, 'br', '', {}, false);
            btn_container = paint.draw_element(user_root, 'div', '', {class: 'ss_bl_msg'}, false, true);
            btn = paint.draw_element(btn_container, 'button', '☒', btn_options, false);
            btn.onclick = function(){ toggle_blacklist_global(this); };
        }
        var spans = document.querySelectorAll('span.postdetails, span.postdetails > font');
        for (var i = 0; i < spans.length; i++) {
            span = spans[i];
            // drop top elements
            if(span.children.length < 2){
                continue;
            }
            var inner = span.innerHTML.split('<br>');
            var user_str = find_user_str(inner);
            var user_name = find_user_name(span);
            if (user_str != null){
                usr_id = get_id_from_str(user_str);
                if(firstTime){ draw_controls(usr_id, user_name, span);}
                this.hide_if_listed(usr_id, span, firstTime);
            }
        }
    }
    function find_user_str(span_array){
        var str_to_check;
        for (var i = 0; i < span_array.length; i++) {
            str_to_check = span_array[i];
            if(str_to_check.includes('Пользователь #:')){
                return str_to_check;
            }
        }
        return null;
    }
    function find_user_name(span){
        var user_root = span.parentNode;
        if(user_root.tagName.toLowerCase() !== 'td'){
            user_root = user_root.parentNode;
        }
        var span_name = user_root.querySelector('span.name > b');
        var str_name = '';
        if(span_name !== null){
            if(span_name.children.length != 0){
                str_name = span_name.lastChild.innerHTML;
            } else {
                str_name = span_name.innerHTML;
            }
        }
        return str_name;
    }
    function get_id_from_str(id_str){
        return id_str.substr(id_str.indexOf('#'));
    }
    // ******************************* CHECKS
    this.is_blacklisted = function(id){
        if(this.bl_status === false){ return false; }
        return this.bad_ids.hasOwnProperty(id);
    }
    this.hide_if_listed = function(id, span, firstTime){
        var msg_root;
        var msg_root_tag;
        msg_root = span.parentNode.parentNode;
        msg_root_tag = msg_root.tagName.toLowerCase();
        if(msg_root == null){
            return;
        }
        if(msg_root_tag !== "tr"){
            msg_root = msg_root.parentNode;
        }
        // remove bl styles
        // if not firstTime (style changed via options)
        for(var i = 0; i < this.hide_types.length; i++){
            msg_root.classList.remove('ss_bl_' + this.hide_types[i]);
        }
        // apply new style
        if(this.is_blacklisted(id)){
            msg_root.classList.add(this.hide_style);
        } else {
            msg_root.classList.remove(this.hide_style);
        }
    }
    // ******************************* ACTIONS
    this.toggle_blacklist = function(id, name){
        if(this.is_blacklisted(id)){
            this.pop_from_bl(id);
        } else {
            this.append_to_bl(id, name);
        }
        setup_bl_list(null, this.bad_ids);
    }
    // ******************************* SERVICE
    this.append_to_bl = function(user_id, user_name){
        this.bad_ids[user_id] = user_name;
        GM_setValue('blacklist', this.bad_ids);
    }
    this.pop_from_bl = function(user_id){
        delete this.bad_ids[user_id];
        GM_setValue('blacklist', this.bad_ids);
    }
    this.pop_from_bl_multy = function(user_ids){
        for(var i = 0; i < user_ids.length; i++){
            delete this.bad_ids[user_ids[i]];
        }
        GM_setValue('blacklist', this.bad_ids);
    }
    this.drop_bl = function(){
        this.bad_ids = {};
        GM_setValue("blacklist", this.bad_ids);
    }
    this.get_bl = function(){
        return GM_getValue('blacklist', {});
    }
    this.get_hide_style = function(){
        return 'ss_bl_' + this.get_hide_type();
    }
    this.bl_status = this.get_bl_status();
    this.hide_types = ['minimize', 'blur', 'hide'];
    this.hide_type = this.get_hide_type();
    this.hide_style = 'ss_bl_' + this.hide_type;
    this.bad_ids = this.get_bl();
}
// *********************************** PAINT
function HTML_paint(){
    this.inject_css = function(css_text, style_name){
        var style = document.querySelector('style#' + style_name);
        if(style == null){
            style = document.createElement('style');
            style.type = 'text/css';
            style.id = style_name;
        }
        if (style.styleSheet) {
            style.styleSheet.cssText = css_text;
        } else {
            style.appendChild(document.createTextNode(css_text));
        }
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    this.draw_element = function(parent_element, elem_type, link_text, link_options, wrap, before){
        if(wrap){
            var empty_div = document.createElement('div');
            empty_div.className = 'ss_link_container';
            parent_element.appendChild(empty_div);
            parent_element = empty_div;
        }
        var elem = document.createElement(elem_type);
        for(var key in link_options){
            if(key == 'style'){
                var style_str;
                for(var style_key in link_options[key]){
                    elem.style[style_key] = link_options[key][style_key];
                }
                elem.setAttribute(style_key, style_str);
            } else {
                elem.setAttribute(key, link_options[key]);
            }
        }
        elem.appendChild(document.createTextNode(link_text));
        if(before === true && parent_element.firstChild){
            parent_element.insertBefore(elem, parent_element.firstChild);
        } else {
            parent_element.appendChild(elem);
        }
        return elem;
    }
}
// *********************************** SEARCHING BY XPATH
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
// *********************************** CSS EDIT DRAGGABLE
function dragElement(e_main) {
    if(!e_main){ return; }
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(e_main.id + "_header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(e_main.id + "_header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        e_main.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        e_main.style.top = (e_main.offsetTop - pos2) + "px";
        e_main.style.left = (e_main.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
// *********************************** CSS ENABLE TAB
function enableTab(el) {
    el.onkeydown = function(e) {
        if (e.keyCode === 9) { // tab was pressed

            // get caret position/selection
            var val = this.value,
                start = this.selectionStart,
                end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = val.substring(0, start) + '\t' + val.substring(end);

            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 1;

            // prevent the focus lose
            return false;

        }
    };
}
// *********************************** CSS
function css_lib(){
    this.css_default_style = `
body{
   background-color: #ffffff;
}
tr td.row1{
   background-color: #f5f5f5;
}
tr td.row2{
   background-color: #eaeaea;
}
tr td.row3, tr td.row3Right{
   background-color: #eaeaea;
}
tr td.quote{
   background-color: #d8d8d8;
}
tr th.thCornerL, tr td.catLeft, tr td.catRight, tr td.catSides,
tr td.rowpic, tr td.catHead, tr td.catBottom,
tr th.thSides, tr th.thTop, tr th.thCornerR, tr th.thHead{
   filter: grayscale(100%);
   background-color: #868686;
}
tr td.spaceRow, tr th.thLeft,
tr th.catLeft, tr th.catRight,
tr th.cat{
   background-color: #868686;
   background-image: none;
}
span.postdetails{
   color: #464646;
}
span.postdetails font{
   color: #9c0000;
}
table.forumline{
   background-color: #868686;
}
input.mainoption, input.button, input.liteoption,
td.catLeft, td.catRight{
   background-color: #e6e6e6;
}
input.helpline{
   background-color: #e0e0e0;
}
tr td.attachheader{
   background-color: #868686;
}
.gensmall a, .postdetails a{
   color: #9c0000;
}
[bgcolor="#a0b8a0"]{
   background-color: #868686;
}
select option[style*="background-color: #a0b8a0"]{
   background-color: #f5f5f5 !important;
}
img[src*="templates/subSilver/images/"]{
   filter: contrast(400%) brightness(97%);
}
img[src*="templates/subSilver/images/"][src*="/icon_"],
img[src*="templates/subSilver/images/"][src*="/foto."],
img[src*="templates/subSilver/images/"][src*="/post."],
img[src*="templates/subSilver/images/"][src*="/reply."]{
   filter: grayscale(100%) contrast(200%);
}
img[src*="templates/subSilver/images/msg_"][src*="box."]{
   filter: brightness(200%) grayscale(100%) contrast(200%);
}
img[src*="templates/subSilver/images/"][src*="post."],
img[src*="templates/subSilver/images/"][src*="upload_pic.gif"]{
   filter: grayscale(100%) contrast(200%);
}
img[src*="images/reputation_"]{
   filter: sepia(100%) saturate(2);
}
img[src*="images/reputation_"][src*="_add_plus.gif"],
img[src*="images/reputation_"][src*="_add_minus.gif"]{
   filter: grayscale(100%) contrast(200%);
}
img[src*="images/reputation_"][src*="_size_4."],
img[src*="images/reputation_"][src*="_size_5."]{
   filter: hue-rotate(120deg) invert(1);
}
.mainmenu img{
   display: none;
}
a[style*="#CCFF38"]{
   color: #ff0000 !important;
}
/* SPOILERS */
div[onclick*="unveil_spoiler"]{
   background-color: #d8d8d8 !important;
}
div[style*="background-color: rgb(160, 184, 160)"]{
   background-color: #e8e8e8 !important;
}
`;
    this.css_floatingmenu = `
/* ------------- UNIVERSAL ------------- */
.ss_hidden{
   display: none;
}
/* .ss_opened - for toggling visibility */
.ss_opened{
   z-index: 999999 !important;
}
/* --- move back for inactivity --- */
.ss_default_closed{
   z-index: -1;
}
div.ss_header{
   display: block;
   width: 100%;
}
.ss_header.ss_close{
   position: absolute;
   top: -1px;
   right: 0px;
}
.ss_header_label{
   height: 14px;
   width: 100%;
   background-color: #696969;
   color: #ffffff;
   font-size: small;
   font-family: monospace;
   text-align: center;
   padding-top: 4px;
}
/* ------------- Default Buttons ------------- */
.ss_button{
   color: #505050;
   background-color: #e6e6e6;
   border: 0;
   margin: 1px 2px 0px 2px;
   height: 18px;
}
.ss_button:hover,
.ss_button:focus{
   outline:0;
}
.ss_button:hover{
   background-color: #ffffff;
}
.ss_button:disabled,
.ss_button[disabled]{
   background-color: #e6e6e6;
   filter: contrast(90%);
   color: #aaaaaa;
}
/* ------------- Options CLOSE ------------- */
button.ss_close{
   margin-top: 1px;
   padding: 0px 4px 0px 5px;
   color: #aeaeae;
   background-color: #696969;
   border: 0;
}
button.ss_close:hover,
button.ss_close:focus{
   color: #ff8080;
   outline:0;
}
/* ------------- Button list ------------- */
div.ss_controls{
   display: block;
   margin: 1px 5px 5px 5px;
}
/* ------------- TOP MENU ------------- */
.ss_floatingmenu{
   display: block;
   position: fixed;
   top: 20px;
   right: -210px;
   width: 230px;
   float: right;
   border: 1px solid #ffffff50;
   border-radius: 3px;
   background-color: #86868690;
   padding: 2px 2px 2px 2px;
   transition: all 0.5s;
   transition-delay: 1.5s;
}
.ss_floatingmenu a{
   color: #ffffff50;
   text-decoration: none;
   font-weight: bold;
}
.ss_floatingmenu:hover a{
   color: #d8d8d8;
}
.ss_floatingmenu a:hover{
   color: #ffffff !important
}
.ss_floatingmenu:hover{
   background-color: #5f5f5f !important;
   right: -5px !important;
   transition-delay: 0s;
}
/* ------------- BOTTOM MENU ------------- */
.ss_bottommenu{
   display: inline-flex;
   position: fixed;
   bottom: 1px;
   right: -10px;
   width: 240px;
   height: 20px;
   float: right;
   border: 1px solid #ffffff90;
   border-radius: 3px;
   background-color: #69696990;
   padding: 2px 2px 2px 2px;
   transition: all 0.5s;
}
.ss_bottommenu:hover{
   background-color: #696969 !important;
}
.ss_menu_separator{
   width: 0px;
   height: 22px;
   /*border: 1px solid #bdbdbd90;*/
   margin: -1px 5px 0px 5px;
}
/* ------------- OPTIONS MENU ------------- */
.ss_opts{
   display: block;
   background-color: #525252;
   position: fixed;
   bottom: 27px;
   right: -1px;
   width: 400px;
   height: 0px;
   overflow: hidden;
   float: right;
   border: 1px solid #525252;
   border-radius: 3px;
   -moz-transition: all 0.5s ease-in-out;
   -o-transition: all 0.5s ease-in-out;
   -webkit-transition: all 0.5s ease-in-out;
   transition: all 0.5s ease-in-out;
   opacity: 0;
}
.ss_opts.ss_opened{
   opacity: 1;
   height: 400px;
}
/* ------------- Options INNER ------------- */
div.ss_opts_checkbox{
   display: inline-flex;
}
div.ss_opts_left{
   display: block;
   width: 45%;
   float: left;
}
input.ss_opts_checkbox{

}
div.ss_opts_right{
   display: block;
   width: 45%;
   float: right;
   margin-right: 5px;
}
/* ------------- SELECTOR --------------- */
div.ss_opts_selector{
   display: block;
}
label.ss_opts_checkbox, label.ss_opts_selector{
   color: #e6e6e6;
}
label.ss_opts_selector{
   float: right;
   font-size: smaller;
   font-family: monospace;
}
select.ss_opts_selector{
   width: 100%;
}
.ss_opts_title{
   color: #ffffff;
   margin: 5px 0px 2px 5px;
   font-size: 15px;
   font-weight: bold;
}
/* ------------- LIST --------------- */
div.ss_list_item{
}
.ss_list_item{
}
/* ------------- EDIT ------------- */
button.ss_opts_edit{

}
/* --- Container --- */
div.ss_edit_css{
   display: block;
   background-color: #525252;
   position: fixed;
   left: 10px;
   top: 10px;
   /*transform: translate(-50%, -50%);*/
   width: auto;
   height: 0px;
   border: 1px solid #525252;
   border-radius: 3px;
   -moz-transition: opacity 0.5s ease-in-out;
   -o-transition: opacity 0.5s ease-in-out;
   -webkit-transition: opacity 0.5s ease-in-out;
   transition: opacity 0.5s ease-in-out;
   opacity: 0;
}
.ss_edit_css.ss_opened{
   opacity: 1;
   height: auto;
}
/* --- TEXTAREA --- */
textarea.ss_edit_css{
   min-width: 50vw;
   min-height: 40vh;
   max-width: 90vw;
   max-height: 90vh;
   margin: 5px 5px 5px 5px;
   border: 0px;
   color: #000000;
   background-color: #efefef;
   outline: none;
   font-family: monospace;
}
/* ------------------ BLACKLIST -------------------- */
.ss_bl_msg button{
   color: #50505091;
   background-color: #ffffff00;
   margin: -7px -7px 0 0;
   font-size: x-large;
   float: right;
}
.ss_bl_minimize .ss_bl_msg button,
.ss_bl_blur .ss_bl_msg button{
   color: #8b00007d;
}
.ss_bl_minimize .ss_bl_msg button:hover,
.ss_bl_blur .ss_bl_msg button:hover{
   color: #ffffffb8;
}
.ss_bl_msg button:hover{
   color: #ca0000;
   background-color: #ffffff00;
}
.ss_bl_msg div{
   display: block;
   float: right;
}
.ss_bl_controls{
   display: flex;
}
.ss_bl_controls .ss_button{
   width: 100%;
}
.ss_list_item{
   width: 100%;
   outline: 0;
}
.ss_bl_minimize ::-webkit-scrollbar {
   display: none;
}
/* --- ss_bl_ + ['minimize', 'blur', 'hide'] --- */
.ss_bl_minimize{
   overflow: hidden;
   max-height: 25px;
}
.ss_bl_minimize td{
   overflow: -webkit-paged-y;
   max-height: 25px;
}
/* this is needed, cause overflow + max-height will overload CPU on long messages with images */
/* and script will die */
/* and page will die */
/* sad shit it is */
.ss_bl_minimize td[colspan='2']{
   display: none;
}
.ss_bl_blur td table{
   filter: blur(10px);
}
.ss_bl_hide{
   display: none;
}
`;
}


//console.log('END of script body.');
var ss_loadTime = window.performance.timing.domContentLoadedEventEnd- window.performance.timing.navigationStart;
console.log('full load time: ' + ss_loadTime);
//console.log(window.performance);


