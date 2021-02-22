/** layuiAdmin.std-v1.4.0 LPPL License By https://www.layui.com/admin/ */

layui.extend({
    setter: "config", //配置模块
    admin: "lib/admin", //核心模块
    view: "lib/view" //视图渲染模块
}).define(["setter", "admin"], function (exports) {
    var setter = layui.setter,
        element = layui.element,
        admin = layui.admin,
        tabsPage = admin.tabsPage,
        view = layui.view,
        APP_BODY = "#LAY_app_body",
        FILTER_TAB_TBAS = "layadmin-layout-tabs",
        $ = layui.$;

    //打开标签页
    var openTabsPage = function (url, text) {
        //遍历页签选项卡
        var matchTo,
            tabs = $("#LAY_app_tabsheader>li"), // 所有已经打开标签页
            path = url.replace(/(^http(s*):)|(\?[\s\S]*$)/g, ""); // 去除协议和空白符

        tabs.each(function (index) {
            var $li = $(this), layid = $li.attr("lay-id");
            if(layid === url) { // 如果已经打开，则记录
                matchTo = true;
                tabsPage.index = index;
            }
        });

        text = text || "新标签页";

        var switchTab = function () {
            element.tabChange(FILTER_TAB_TBAS, url);
            admin.tabsBodyChange(tabsPage.index, {url: url, text: text});
        };

        // 如果开启多标签页且还没有打开
        if(setter.pageTabs && !matchTo) {
            setTimeout(function () {
                $(APP_BODY).append([
                    '<div class="layadmin-tabsbody-item layui-show">', '<iframe src="' + url + '" frameborder="0" class="layadmin-iframe"></iframe>', "</div>"
                ].join(""));
                switchTab();
            }, 10);
            tabsPage.index = tabs.length; // 获取新标签页索引
            element.tabAdd(FILTER_TAB_TBAS, { // 添加标签页
                title: "<span>" + text + "</span>",
                id: url,
                attr: path
            });
        } else { // 如果没有开启多标签页
            var $iframe = admin.tabsBody(admin.tabsPage.index).find(".layadmin-iframe");
            $iframe[0].contentWindow.location.href = url;
        }
        //定位当前tabs
        switchTab();
    };

    //屏幕小于768px，自动收缩菜单栏
    if(admin.screen() < 2) admin.sideFlexible();
    //将模块根路径设置为 modules 目录
    layui.config({
        base: setter.base + "modules/"
    });
    //扩展 lib 目录下的其它模块
    layui.each(setter.extend, function (index, elem) {
        var extend = {};
        extend[elem] = "{/}" + setter.base + "lib/extend/" + elem;
        layui.extend(extend);
    });

    view().autoRender();
    //加载公共模块
    layui.use("common");

    exports("index", {openTabsPage: openTabsPage});
});