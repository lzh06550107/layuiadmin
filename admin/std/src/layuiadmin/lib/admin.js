/** layuiAdmin.std-v1.4.0 LPPL License By https://www.layui.com/admin/ */

layui.define("view", function (exports) {
    var $ = layui.jquery,
        laytpl = layui.laytpl,
        element = layui.element,
        setter = layui.setter,
        view = layui.view,
        device = layui.device(),
        $window = $(window),
        $body = $("body"),
        $container = $("#" + setter.container),
        SHOW = "layui-show",
        HIDE = "layui-hide",
        THIS = "layui-this",
        DISABLED = "layui-disabled",
        APP_BODY = "#LAY_app_body",
        APP_FLEXIBLE = "LAY_app_flexible",
        FILTER_TAB_TBAS = "layadmin-layout-tabs",
        APP_SPREAD_SM = "layadmin-side-spread-sm",
        TABS_BODY = "layadmin-tabsbody-item",
        ICON_SHRINK = "layui-icon-shrink-right",
        ICON_SPREAD = "layui-icon-spread-left",
        SIDE_SHRINK = "layadmin-side-shrink",
        SIDE_MENU = "LAY-system-side-menu",
        TABS_HEADER = "#LAY_app_tabsheader>li";

    var admin = {
        v: "1.4.0 std",
        req: view.req, // 代理访问view请求方法
        //清除本地 token，并跳转到登入页
        exit: view.exit, // 代理访问view退出方法

        //xss 转义
        escape: function (html) {
            return String(html || "").replace(/&(?!#?[a-zA-Z0-9]+;)/g, "&amp;").
            replace(/</g, "&lt;").
            replace(/>/g, "&gt;").
            replace(/'/g, "&#39;").
            replace(/"/g, "&quot;")
        },

        //注册事件监听器，可以是自定义事件
        on: function (events, callback) {
            // setter.MOD_NAME 为admin
            return layui.onevent.call(this, setter.MOD_NAME, events, callback)
        },

        //发送验证码
        sendAuthCode: function (config) {
            config = $.extend({
                seconds: 60,
                elemPhone: "#LAY_phone",
                elemVercode: "#LAY_vercode"
            }, config);

            var timer, seconds = config.seconds, $elem = $(config.elem);

            // 倒计时
            var countDown = function (loop) {
                seconds--;
                if(seconds < 0) {
                    $elem.removeClass(DISABLED).html("获取验证码");
                    seconds = config.seconds;
                    clearInterval(timer);
                }else {
                    $elem.addClass(DISABLED).html(seconds + "秒后重获");
                }

                if(!loop) {
                    timer = setInterval(function () {
                        countDown(true)
                    }, 1000);
                }
            };

            config.elemPhone = $(config.elemPhone);
            config.elemVercode = $(config.elemVercode);

            $elem.on("click", function () {
                var $elemPhone = config.elemPhone, elemPhoneVal = $elemPhone.val();
                if (seconds === config.seconds && !$(this).hasClass(DISABLED)) {
                    if (!/^1\d{10}$/.test(elemPhoneVal)) {
                        $elemPhone.focus();
                        return layer.msg("请输入正确的手机号");
                    }

                    if ("object" == typeof config.ajax) {
                        var success = config.ajax.success;
                        delete config.ajax.success;
                    }

                    admin.req($.extend(true, {
                        url: "/auth/code", // 验证码获取地址
                        type: "get",
                        data: {
                            phone: elemPhoneVal
                        },
                        success: function (res) {
                            layer.msg("验证码已发送至你的手机，请注意查收", {icon: 1, shade: 0});
                            config.elemVercode.focus();
                            countDown();
                            success && success(res);
                        }
                    }, config.ajax));
                }
            });
        },

        //屏幕类型
        screen: function () {
            var width = $window.width();
            if(width >= 1200){
                return 3; //大屏幕
            } else if(width >= 992){
                return 2; //中屏幕
            } else if(width >= 768){
                return 1; //小屏幕
            } else {
                return 0; //超小屏幕
            }
        },

        //侧边伸缩，status 为 null：收缩；status为 “spread”：展开
        sideFlexible: function (status) { // 不传值，默认为收缩
            var app = $container,
                iconElem = $("#" + APP_FLEXIBLE),
                screen = admin.screen();

            //设置状态，PC端：默认展开、移动端：默认收缩
            if(status === 'spread'){
                //切换到展开状态的 icon，箭头：←
                iconElem.removeClass(ICON_SPREAD).addClass(ICON_SHRINK);

                //移动端：从左到右位移；PC端：清除多余选择器恢复默认
                if(screen < 2){
                    app.addClass(APP_SPREAD_SM);
                } else {
                    app.removeClass(APP_SPREAD_SM);
                }

                app.removeClass(SIDE_SHRINK)
            } else {
                //切换到搜索状态的 icon，箭头：→
                iconElem.removeClass(ICON_SHRINK).addClass(ICON_SPREAD);

                //移动：清除多余选择器恢复默认；PC：从右往左收缩
                if(screen < 2){
                    app.removeClass(SIDE_SHRINK);
                } else {
                    app.addClass(SIDE_SHRINK);
                }

                app.removeClass(APP_SPREAD_SM)
            }

            // 调用side事件的回调函数
            layui.event.call(this, setter.MOD_NAME, 'side({*})', {
                status: status // 收缩状态
            });
        },

        //弹出面板
        popup: view.popup,

        //右侧弹出面板
        popupRight: function (options) {
            return admin.popup.index = layer.open($.extend({
                type: 1,
                id: "LAY_adminPopupR",
                anim: -1,
                title: false,
                closeBtn: false,
                offset: "r",
                shade: 0.1,
                shadeClose: true,
                skin: "layui-anim layui-anim-rl layui-layer-adminRight",
                area: "300px"
            }, options));
        },

        //主题设置
        theme: function (options) {
            var theme = setter.theme,
                local = layui.data(setter.tableName),
                id = "LAY_layadmin_theme",
                style = document.createElement("style"),
                //渲染样式模板
                styleText = laytpl([
                    //主题色
                    ".layui-side-menu,",
                    ".layadmin-pagetabs .layui-tab-title li:after,",
                    ".layadmin-pagetabs .layui-tab-title li.layui-this:after,",
                    ".layui-layer-admin .layui-layer-title,",
                    ".layadmin-side-shrink .layui-side-menu .layui-nav>.layui-nav-item>.layui-nav-child",
                    "{background-color:{{d.color.main}} !important;}",

                    //选中色
                    ".layui-nav-tree .layui-this,",
                    ".layui-nav-tree .layui-this>a,",
                    ".layui-nav-tree .layui-nav-child dd.layui-this,",
                    ".layui-nav-tree .layui-nav-child dd.layui-this a",
                    "{background-color:{{d.color.selected}} !important;}",

                    //logo
                    ".layui-layout-admin .layui-logo{background-color:{{d.color.logo || d.color.main}} !important;}",

                    //头部色
                    "{{# if(d.color.header){ }}",
                    ".layui-layout-admin .layui-header{background-color:{{ d.color.header }};}",
                    ".layui-layout-admin .layui-header a,",
                    ".layui-layout-admin .layui-header a cite{color: #f8f8f8;}",
                    ".layui-layout-admin .layui-header a:hover{color: #fff;}",
                    ".layui-layout-admin .layui-header .layui-nav .layui-nav-more{border-top-color: #fbfbfb;}",
                    ".layui-layout-admin .layui-header .layui-nav .layui-nav-mored{border-color: transparent; border-bottom-color: #fbfbfb;}",
                    ".layui-layout-admin .layui-header .layui-nav .layui-this:after, .layui-layout-admin .layui-header .layui-nav-bar{background-color: #fff; background-color: rgba(255,255,255,.5);}",
                    ".layadmin-pagetabs .layui-tab-title li:after{display: none;}", "{{# } }}"
                ].join("")).render(options = $.extend({}, local.theme, options)),
                styleElem = document.getElementById(id);

            //添加主题样式
            if("styleSheet" in style) {
                style.setAttribute("type", "text/css");
                style.styleSheet.cssText = styleText;
            } else {
                style.innerHTML = styleText
            }
            style.id = id;
            // 如果已经存在，则删除
            styleElem && $body[0].removeChild(styleElem);
            // 添加新的样式
            $body[0].appendChild(style);
            $body.attr("layadmin-themealias", options.color.alias);

            //本地存储记录
            local.theme = local.theme || {};
            layui.each(options, function (key, value) {
                local.theme[key] = value
            });
            //同步到本地存储
            layui.data(setter.tableName, {
                key: "theme",
                value: local.theme
            });
        },

        //初始化主题
        initTheme: function (index) {
            var theme = setter.theme;
            index = index || 0; // 默认是第一个索引主题

            if(theme.color[index]){
                theme.color[index].index = index; // 给颜色配置添加索引
                admin.theme({ // 设置主题
                    color: theme.color[index]
                });
            }

        },

        //记录最近一次点击的tab页面标签数据
        tabsPage: {},

        //获取页面tab标签主体元素
        tabsBody: function (index) {
            return $(APP_BODY).find("." + TABS_BODY).eq(index || 0);
        },

        //切换页面tab标签主体
        tabsBodyChange: function (index, options) {
            options = options || {};

            //隐藏其它tab标签主体，显示当前tab标签主体
            admin.tabsBody(index).addClass(SHOW).siblings().removeClass(SHOW);
            //左右滚动页面标签
            events.rollPage("auto", index);

            //执行 {setter.MOD_NAME} 下的tabsPage自定义事件，即admin模块的自定义tabsPage事件
            layui.event.call(this, setter.MOD_NAME, "tabsPage({*})", {
                url: options.url,
                text: options.text
            });
        },

        //resize事件，即窗口大小改变
        //窗口 resize 事件处理，我们推荐你使用该方法取代 jQuery 的 resize 事件，以避免多页面标签下可能存在的冲突
        resize: function (fn) {
            var router = layui.router(),
                key = router.path.join("-");

            // 先解绑事件且清空
            if(admin.resizeFn[key]) {
                $window.off("resize", admin.resizeFn[key]);
                delete admin.resizeFn[key];
            }

            if("off" !== fn) {
                fn(); // 调用回调函数
                admin.resizeFn[key] = fn; // 保存注册回调函数
                $window.on("resize", admin.resizeFn[key]); // 注册监听函数
            }
        },

        resizeFn: {}, // 监听窗口改变事件回调

        // 执行窗口改变事件回调
        runResize: function () {
            var router = layui.router(), key = router.path.join("-");
            admin.resizeFn[key] && admin.resizeFn[key]();
        },

        delResize: function () {
            this.resize("off"); // 解绑事件且清空注册回调函数缓存
        },

        //关闭当前 pageTabs
        closeThisTabs: function () {
            //触发tab标签标题中关闭按钮
            admin.tabsPage.index && $(TABS_HEADER).eq(admin.tabsPage.index).find(".layui-tab-close").trigger("click");
        },

        //进入全屏状态
        fullScreen: function () {
            var documentElement = document.documentElement,
                requestFullScreen = documentElement.requestFullScreen || documentElement.webkitRequestFullScreen || documentElement.mozRequestFullScreen || documentElement.msRequestFullscreen;
            "undefined" != typeof requestFullScreen && requestFullScreen && requestFullScreen.call(documentElement)
        },

        //退出全屏状态
        exitScreen: function () {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            }else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }else if(document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    //事件
    var events = admin.events = {
        //菜单栏伸缩
        flexible: function (othis) {
            var iconElem = othis.find("#" + APP_FLEXIBLE),
                isSpread = iconElem.hasClass(ICON_SPREAD);
            admin.sideFlexible(isSpread ? "spread" : null);
        },
        //刷新，刷新当前右侧区域
        refresh: function () {
            var ELEM_IFRAME = ".layadmin-iframe", length = $("." + TABS_BODY).length;
            if(admin.tabsPage.index >= length) { // 修正切换面板索引
                admin.tabsPage.index = length - 1;
            }

            var iframe = admin.tabsBody(admin.tabsPage.index).find(ELEM_IFRAME);
            iframe[0].contentWindow.location.reload(true) // 重新加载当前iframe页面
        },
        //输入框搜索
        serach: function (othis) {
            othis.off("keypress").on("keypress", function (event) {
                if (this.value.replace(/\s/g, "") && 13 === event.keyCode) {
                    var href = othis.attr("lay-action"), // 搜索路径
                        text = othis.attr("lay-text") || "搜索"; // 标题

                    href += this.value;
                    // 搜索页面标签标题
                    text = text + ' <span style="color: #FF5722;">' + admin.escape(this.value) + "</span>";

                    //调用index模块来打开标签页
                    layui.index.openTabsPage(href, text);

                    events.serach.keys || (events.serach.keys = {});
                    //保存已经搜索关键词tab页面
                    events.serach.keys[admin.tabsPage.index] = this.value;
                    //如果搜索关键词已经打开，则刷新页面即可
                    if(this.value === events.serach.keys[admin.tabsPage.index]) {
                        events.refresh(othis); // 刷新右侧内容iframe
                    }

                    //清空输入框
                    this.value = "";
                }


            });
        },

        //显示通知消息
        message: function (othis) {
            othis.find(".layui-badge-dot").remove();
        },

        //弹出主题设置面板
        theme: function () {
            admin.popupRight({
                id: "LAY_adminPopupTheme",
                success: function () {
                    view(this.id).render("system/theme")
                }
            });
        },

        //便签
        note: function (othis) {
            var mobile = admin.screen() < 2,
                note = layui.data(setter.tableName).note;

            events.note.index = admin.popup({
                title: "便签",
                shade: 0,
                offset: ["41px", mobile ? null : othis.offset().left - 250 + "px"],
                anim: -1,
                id: "LAY_adminNote",
                skin: "layadmin-note layui-anim layui-anim-upbit",
                content: '<textarea placeholder="内容"></textarea>',
                resize: false,
                success: function (layero, index) {
                    var textarea = layero.find("textarea"),
                        value = note === undefined ? "便签中的内容会存储在本地，这样即便你关掉了浏览器，在下次打开时，依然会读取到上一次的记录。是个非常小巧实用的本地备忘录" : note;

                    textarea.val(value).focus().on("keyup", function () {
                        // 同步数据到本地存储
                        layui.data(setter.tableName, {
                            key: "note",
                            value: this.value
                        });
                    });
                }
            })
        },
        //全屏
        fullscreen: function (othis) {
            var SCREEN_FULL = "layui-icon-screen-full", SCREEN_REST = "layui-icon-screen-restore", iconElem = othis.children("i");

            if(iconElem.hasClass(SCREEN_FULL)) {
                admin.fullScreen();
                iconElem.addClass(SCREEN_REST).removeClass(SCREEN_FULL);
            }else{
                admin.exitScreen();
                iconElem.addClass(SCREEN_FULL).removeClass(SCREEN_REST);
            }
        },
        //弹出关于面板
        about: function () {
            admin.popupRight({
                id: "LAY_adminPopupAbout",
                success: function () {
                    view(this.id).render("system/about")
                }
            });
        },
        //弹出更多面板
        more: function () {
            admin.popupRight({
                id: "LAY_adminPopupMore",
                success: function () {
                    view(this.id).render("system/more")
                }
            });
        },
        //返回上一页
        back: function () {
            history.back();
        },
        //主题设置，设置主题弹出面板中会回调本方法
        setTheme: function (othis) {
            var index = othis.data("index"),
                nextIndex = othis.siblings('.layui-this').data('index');

            if(othis.hasClass(THIS)) return;

            othis.addClass(THIS).siblings(".layui-this").removeClass(THIS);
            admin.initTheme(index);

        },
        //左右滚动页面标签
        rollPage: function (type, index) {
            var tabsHeader = $("#LAY_app_tabsheader"),
                liItem = tabsHeader.children("li"),
                scrollWidth = tabsHeader.prop("scrollWidth"),
                outerWidth = tabsHeader.outerWidth(),
                tabsLeft = parseFloat(tabsHeader.css("left"));

            //右左往右
            if ("left" === type) {
                if (!tabsLeft && tabsLeft <= 0) return;

                //当前的left减去可视宽度，用于与上一轮的页标比较
                var prefLeft = -tabsLeft - outerWidth;

                liItem.each(function (index, item) {
                    var li = $(item), left = li.position().left;
                    if (left >= prefLeft) {
                        tabsHeader.css("left", -left);
                        return false;
                    }
                });
            } else if("auto" === type) { //自动滚动
                (function () {
                    var thisLeft, thisLi = liItem.eq(index);
                    if (thisLi[0]) {
                        thisLeft = thisLi.position().left;
                        if (thisLeft < -tabsLeft) {
                            return tabsHeader.css("left", -thisLeft);
                        }
                        if (thisLeft + thisLi.outerWidth() >= outerWidth - tabsLeft) {
                            var subLeft = thisLeft + thisLi.outerWidth() - (outerWidth - tabsLeft);
                            liItem.each(function (i, item) {
                                var li = $(item), left = li.position().left;
                                //从当前可视区域的最左第二个节点遍历，如果减去最左节点的差 > 目标在右侧不可见的宽度，则将该节点放置可视区域最左
                                if (left + tabsLeft > 0 && left - tabsLeft > subLeft) {
                                    tabsHeader.css("left", -left);
                                    return false;
                                }
                            });
                        }
                    }
                }());
            } else {
                //默认向左滚动
                liItem.each(function (i, item) {
                    var li = $(item), left = li.position().left;
                    if (left + li.outerWidth() >= outerWidth - tabsLeft) {
                        tabsHeader.css("left", -left);
                        return false;
                    }
                });
            }

        },
        //向右滚动页面标签
        leftPage: function () {
            events.rollPage("left");
        },
        //向左滚动页面标签
        rightPage: function () {
            events.rollPage()
        },
        //关闭当前标签页
        closeThisTabs: function () {
            var realAdmin = parent === self ? admin : parent.layui.admin;
            realAdmin.closeThisTabs();
        },
        //关闭其它标签页
        closeOtherTabs: function (type) {
            var TABS_REMOVE = "LAY-system-pagetabs-remove";

            if("all" === type) {
                $(TABS_HEADER + ":gt(0)").remove();
                $(APP_BODY).find("." + TABS_BODY + ":gt(0)").remove();
                $(TABS_HEADER).eq(0).trigger("click");
            } else {
                $(TABS_HEADER).each(function (index, item) {
                    if(index && index != admin.tabsPage.index) {
                        $(item).addClass(TABS_REMOVE);
                        admin.tabsBody(index).addClass(TABS_REMOVE);
                    }
                });
                $("." + TABS_REMOVE).remove();
            }

        },
        //关闭全部标签页
        closeAllTabs: function () {
            events.closeOtherTabs("all");
        },
        //遮罩
        shade: function () {
            admin.sideFlexible();
        },

        //layuiadmin更新
        update: function () {
            $.ajax({
                type: "get",
                dataType: "jsonp",
                data: {name: "layuiAdmin", version: admin.v},
                url: "https://fly.layui.com/api/product_update/",
                success: function (resp) {
                    if (0 === resp.status) {
                        if (resp.version === admin.v.replace(/\s|pro|std/g, "")) {
                            layer.alert("当前版本已经是最新版本");
                        } else {
                            layer.alert("检查到更新，是否前往下载？", {btn: ["更新", "暂不"]}, function (index) {
                                layer.close(index);
                                layer.open({
                                    type: 2,
                                    content: "https://fly.layui.com/user/product/",
                                    area: ["100%", "100%"],
                                    title: "检查更新"
                                });
                            });
                        }
                    } else if (1 === resp.status) {
                        layer.alert(resp.msg, {btn: ["登入", "暂不"]}, function (index) {
                            layer.close(index);
                            layer.open({
                                type: 2,
                                content: "https://fly.layui.com/user/login/",
                                area: ["100%", "100%"],
                                title: "检查更新"
                            });
                        })
                    } else {
                        layer.msg(resp.msg || resp.code, {shift: 6});
                    }
                },
                error: function (e) {
                    layer.msg("请求异常，请重试", {shift: 6});
                }
            });
        },

        //呼出IM 示例
        im: function () {
            admin.popup({
                id: "LAY-popup-layim-demo", //定义唯一ID，防止重复弹出
                shade: 0,
                area: ["800px", "300px"],
                title: "面板外的操作示例",
                offset: "lb",
                success: function () {
                    //将 views 目录下的某视图文件内容渲染给该面板
                    layui.view(this.id).render("layim/demo").then(function () {
                        layui.use("im");
                    });
                }
            })
        }
    };

    //页面加载时执行的函数
    !function () {
        //主题初始化，本地主题记录优先，其次为 initColorIndex
        var local = layui.data(setter.tableName);

        if(local.theme) {
            admin.theme(local.theme);
        }else if(setter.theme) { // 如果本地没有保存设置的主题，则使用配置文件中配置
            admin.initTheme(setter.theme.initColorIndex);
        }

        //常规版默认开启多标签页
        if(!("pageTabs" in layui.setter)) {
            layui.setter.pageTabs = true;
        }

        //不开启页面标签时
        if(!setter.pageTabs) {
            $("#LAY_app_tabs").addClass(HIDE); // 隐藏tab页面标题栏
            $container.addClass("layadmin-tabspage-none"); // 添加无tab页面标题栏的样式
        }

        //低版本IE提示
        if(device.ie && device.ie < 10) {
            view.error("IE" + device.ie + "下访问可能不佳，推荐使用：Chrome / Firefox / Edge 等高级浏览器", {
                offset: "auto",
                id: "LAY_errorIE"
            });
        }
    }();

    //监听 tab 组件切换，同步 index，这里监听的是tab页面标题栏
    element.on("tab(" + FILTER_TAB_TBAS + ")", function (data) {
        admin.tabsPage.index = data.index; // 记录当前点击的tab标题索引
    });

    //监听选项卡切换(tabsPage是自定义事件，setMenustatus只是标识作用)，改变菜单状态
    admin.on("tabsPage(setMenustatus)", function (router) {
        var pathURL = router.url,  // 全局记录路由路径
        getData = function (item) {
            return {
                list: item.children(".layui-nav-child"), // 子项是菜单列表
                a: item.children("*[lay-href]") // 子项是菜单项
            }
        },
            sideMenu = $("#" + SIDE_MENU), // 获取左边菜单面板dom
            SIDE_NAV_ITEMD = "layui-nav-itemed", // 左侧菜单项

            //捕获对应菜单，菜单最多支持三级
            matchMenu = function (list) {
                list.each(function (index1, item1) {
                    var othis1 = $(item1),
                        data1 = getData(othis1),
                        listChildren1 = data1.list.children("dd"), // 一级菜单包含子项
                        matched1 = pathURL === data1.a.attr("lay-href"); // 一级菜单不包含子项，路由路径是否匹配当前菜单项

                    listChildren1.each(function (index2, item2) {
                        var othis2 = $(item2),
                            data2 = getData(othis2),
                            listChildren2 = data2.list.children("dd"), // 二级菜单包含子项
                            matched2 = pathURL === data2.a.attr("lay-href"); // 二级菜单不包含子项，路由路径是否匹配当前菜单项

                        listChildren2.each(function (index3, item3) { // 三级菜单项，不能包含子项
                            var othis3 = $(item3),
                                data3 = getData(othis3),
                                matched3 = pathURL === data3.a.attr("lay-href"); // 三级菜单不包含子项，路由路径是否匹配当前菜单项

                            if (matched3) {
                                var selected = data3.list[0] ? SIDE_NAV_ITEMD : THIS;
                                othis3.addClass(selected).siblings().removeClass(selected); //选中指定菜单项
                                return false;
                            }
                        });

                        if (matched2) {
                            var selected = data2.list[0] ? SIDE_NAV_ITEMD : THIS;
                            othis2.addClass(selected).siblings().removeClass(selected);
                            return false;
                        }
                    });

                    if (matched1) {
                        var selected = data1.list[0] ? SIDE_NAV_ITEMD : THIS;
                        othis1.addClass(selected).siblings().removeClass(selected);
                        return false;
                    }
                });
        };
        //移除菜单项选中状态css
        sideMenu.find("." + THIS).removeClass(THIS);
        //当屏幕小时点击菜单会自动收缩
        if(admin.screen() < 2) {
            admin.sideFlexible(); //侧边收缩
        }
        //开始捕获tab标题栏对应的菜单项并选中
        matchMenu(sideMenu.children("li"));
    });

    //监听侧边导航点击事件，nav是element中内置事件
    element.on("nav(layadmin-system-side-menu)", function (elem) {

        if(elem.siblings(".layui-nav-child")[0] && $container.hasClass(SIDE_SHRINK)) {
            admin.sideFlexible("spread");
            layer.close(elem.data("index"));
        }
        admin.tabsPage.type = "nav";
    });

    //监听选项卡的下拉菜单操作
    element.on("nav(layadmin-pagetabs-nav)", function (elem) {
        var dd = elem.parent();
        dd.removeClass(THIS); // 移除dd的选中状态
        dd.parent().removeClass(SHOW); // 点击后立即隐藏下拉菜单
    });

    //同步路由
    var setThisRouter = function (othis) {
        var layid = othis.attr("lay-id"),
            attr = othis.attr("lay-attr"),
            index = othis.index();

        admin.tabsBodyChange(index, {
            url: attr
        });
    };

    //标签页标题点击
    $body.on("click", TABS_HEADER, function () {
        var othis = $(this), index = othis.index();
        admin.tabsPage.type = "tab";
        admin.tabsPage.index = index;
        setThisRouter(othis)
    });

    //监听 tabspage 删除
    element.on("tabDelete(" + FILTER_TAB_TBAS + ")", function (obj) {
        var othis = $(TABS_HEADER + ".layui-this");
        obj.index && admin.tabsBody(obj.index).remove();
        setThisRouter(othis);
        //移除resize事件
        admin.delResize()
    });

    //页面跳转，任何包含 lay-href 属性的标签(不一定是a标签)都会切换body内容
    // 如果需要切换到外部链接在整个页面显示，则使用href属性
    $body.on("click", "*[lay-href]", function () {
        var othis = $(this),
            href = othis.attr("lay-href"), // 标签面板请求地址
            text = othis.attr("lay-text"); // 标签标题

        layui.router();
        admin.tabsPage.elem = othis; // 记录当前触发面板页对象

        //执行跳转
        var topLayui = parent === self ? layui : top.layui;
        topLayui.index.openTabsPage(href, text || othis.text()); // 打开新面板页
        // 如果面板也已经打开，则刷新该页面
        href === admin.tabsBody(admin.tabsPage.index).find("iframe").attr("src") && admin.events.refresh();
    });

    //监听所有包含 layadmin-event 属性元素的点击事件
    $body.on("click", "*[layadmin-event]", function () {
        var othis = $(this),
            attrEvent = othis.attr("layadmin-event"); // 获取layadmin-event属性值，该值为事件名称
        events[attrEvent] && events[attrEvent].call(this, othis); // 执行对应的事件监听函数
    });

    //监听所有包含 lay-tips 属性元素的鼠标移入、移出事件
    $body.on("mouseenter", "*[lay-tips]", function () {
        var othis = $(this);

        if (!othis.parent().hasClass("layui-nav-item") || $container.hasClass(SIDE_SHRINK)) {
            var tips = othis.attr("lay-tips"), // 提示内容
                offset = othis.attr("lay-offset"), // 偏移量
                direction = othis.attr("lay-direction"),  // 提示弹出的方向
            index = layer.tips(tips, this, {
                tips: direction || 1,
                time: -1,
                success: function (layero, index) {
                    offset && layero.css("margin-left", offset + "px")
                }
            });
            othis.data("index", index); // 向元素附加数据
        }
    }).on("mouseleave", "*[lay-tips]", function () {
        layer.close($(this).data("index")); // 取回该数据
    });

    //窗口resize事件
    var resizeSystem = layui.data.resizeSystem = function () {
        layer.closeAll("tips"); // 窗口大小改变，关闭所有提示层

        if(!resizeSystem.lock) {
            setTimeout(function () {
                // 根据屏幕大小收缩侧边菜单
                admin.sideFlexible(admin.screen() < 2 ? "" : "spread");
                delete resizeSystem.lock;
            }, 100);
        }
        resizeSystem.lock = true;
    };

    // 监听窗口大小改变事件
    $window.on("resize", layui.data.resizeSystem);

    exports("admin", admin);
});