/** layuiAdmin.std-v1.4.0 LPPL License By https://www.layui.com/admin/ */

layui.define(["laytpl", "layer"], function (exports) {
    var $ = layui.jquery,
        laytpl = layui.laytpl,
        layer = layui.layer,
        setter = layui.setter,
        device = layui.device(),
        hint = layui.hint(),

        //构造函数，传入唯一的视图id
        view = function (id) {
            return new Class(id)
        },
        LAY_BODY = "LAY_app_body",

        Class = function (id) {
            this.id = id;
            this.container = $("#" + (id || LAY_BODY));
        };

    //加载中
    view.loading = function (elem) {
        elem.append(this.elemLoad = $('<i class="layui-anim layui-anim-rotate layui-anim-loop layui-icon layui-icon-loading layadmin-loading"></i>'));
    };

    //移除加载
    view.removeLoad = function () {
        this.elemLoad && this.elemLoad.remove();
    };

    //清除 token，并跳转到登入页
    view.exit = function (callback) {
        //清空本地记录的 token
        layui.data(setter.tableName, {
            key: setter.request.tokenName,
            remove: true
        });

        callback && callback()
    };

    /**
     * Ajax请求，用法同 $.ajax(options)，只是该方法会进行错误处理
     * - 该方法默认进行get请求，且默认返回json格式数据
     * @param options
     * - done:function(res) 只有响应成功且返回状态码为OK的情况下回调
     * - success:function(res) 连接成功而不管状态码是什么的情况下回调
     * - error:function(res) 连接失败的情况下回调
     * - 其它的参数和ajax的一样
     * @returns {*}
     */
    view.req = function (options) {
        var success = options.success, // 只要响应成功就回调本方法
            error = options.error, // 只要响应出错就回调本方法
            request = setter.request, //自定义请求字段
            response = setter.response, //自定义响应字段

        debug = function () {
            return setter.debug ? "<br><cite>URL：</cite>" + options.url : ""
        };

        options.data = options.data || {}; // 额外请求数据
        options.headers = options.headers || {}; // 请求头

        if (request.tokenName) { // 如果需要携带 token 的字段名
            var l = "string" == typeof options.data ? JSON.parse(options.data) : options.data;
            // 如果token字段在options.data中，则从里面获取值，如果不在，则从本地存储中获取
            options.data[request.tokenName] = request.tokenName in l ? options.data[request.tokenName] : layui.data(setter.tableName)[request.tokenName] || "";

            // 如果token字段在options.headers中，则从里面获取值，如果不在，则从本地存储中获取
            options.headers[request.tokenName] = request.tokenName in options.headers ? options.headers[request.tokenName] : layui.data(setter.tableName)[request.tokenName] || "";
        }

        delete options.success; // 清空该参数，防止传递给ajax请求方法
        delete options.error; // 清空该参数，防止传递给ajax请求方法

        return $.ajax($.extend({
            type: "get",
            dataType: "json",
            success: function (res) {
                var statusCode = response.statusCode; // config.js文件中定义

                //只有 response 的 code 一切正常才执行 done
                if (res[response.statusName] == statusCode.ok) {
                    "function" == typeof options.done && options.done(res);
                    //登录状态失效，清除本地 access_token，并强制跳转到登入页
                } else if (res[response.statusName] == statusCode.logout) {
                    view.exit();
                } else { //其它异常
                    var error = [
                        "<cite>Error：</cite> " + (res[response.msgName] || "返回状态码异常"), debug()
                    ].join("");
                    view.error(error);
                }

                //只要 http 状态码正常，无论 response 的 code 是否正常都执行 success
                "function" == typeof success && success(res)
            },
            error: function (res, code) {
                var errorMsg = ["请求异常，请重试<br><cite>错误信息：</cite>" + code, debug()].join("");
                view.error(errorMsg);
                "function" == typeof error && error(res);
            }
        }, options));
    };

    //弹窗
    view.popup = function (options) {
        var success = options.success,
            skin = options.skin;

        delete options.success;
        delete options.skin;

        return layer.open($.extend({
            type: 1,
            title: "提示",
            content: "",
            id: "LAY-system-view-popup",
            skin: "layui-layer-admin" + (skin ? " " + skin : ""),
            shadeClose: true,
            closeBtn: false,
            success: function (layero, index) {
                var elemClose = $('<i class="layui-icon" close>&#x1006;</i>');
                layero.append(elemClose);
                elemClose.on("click", function () {
                    layer.close(index);
                });
                "function" == typeof success && success.apply(this, arguments);
            }
        }, options))
    };

    //异常提示
    view.error = function (content, options) {
        return view.popup($.extend({
            content: content,
            maxWidth: 300,
            offset: "t",
            anim: 6,
            id: "LAY_adminError"
        }, options));
    };

    /**
     * 请求指定路径模板文件并渲染
     * @param views 模板路径，根目录views下的相对路径
     * @param params 渲染参数
     * @returns {Class}
     */
    Class.prototype.render = function (views, params) {
        var that = this;
        router = layui.router();
        views = setter.views + views + setter.engine;

        $("#" + LAY_BODY).children(".layadmin-loading").remove();
        view.loading(that.container);

        //请求模板
        $.ajax({
            url: views,
            type: "get",
            dataType: "html",
            data: {
                v: layui.cache.version
            },
            success: function (html) {
                html = "<div>" + html + "</div>";

                var elemTitle = $(html).find("title"),
                    title = elemTitle.text() || (html.match(/\<title\>([\s\S]*)\<\/title>/) || [])[1];

                var res = {
                    title: title, // 模板标题
                    body: html // 模板内容
                };

                elemTitle.remove();
                that.params = params || {}; //获取渲染参数

                if(that.then) {
                    that.then(res);
                    delete that.then;
                }

                that.parse(html);
                view.removeLoad();

                if(that.done) {
                    that.done(res);
                    delete that.done;
                }
            },
            error: function (e) {
                view.removeLoad();

                if(that.render.isError) {
                    return view.error("请求视图文件异常，状态：" + e.status);
                }

                if(404 === e.status) {
                    that.render("template/tips/404");
                }else {
                    that.render("template/tips/error");
                }
                that.render.isError = true;
            }
        });
        return that;
    };

    //解析模板
    Class.prototype.parse = function (html, refresh, callback) {
        var that = this,
            isScriptTpl = "object" == typeof html, //是否模板元素
            elem = isScriptTpl ? html : $(html),
            elemTemp = isScriptTpl ? html : elem.find("*[template]"), // 找到html中模板部分
            fn = function (options) {
                var tpl = laytpl(options.dataElem.html()); // 获取模板内容
                var o = $.extend({params: router.params}, options.res);
                options.dataElem.after(tpl.render(o)); // 渲染并插入指定位置

                "function" == typeof callback && callback();

                try {
                    // 定义函数并调用执行
                    options.done && new Function("d", options.done)(o);
                } catch (i) {
                    console.error(options.dataElem[0], "\n存在错误回调脚本\n\n", i)
                }
            },

            router = layui.router();

        elem.find("title").remove();
        that.container[refresh ? "after" : "html"](elem.children());

        router.params = that.params || {};

        //遍历模板区块
        for (var i = elemTemp.length; i > 0; i--) {
            (function () {
                var dataElem = elemTemp.eq(i - 1),
                    layDone = dataElem.attr("lay-done") || dataElem.attr("lay-then"), //获取回调
                    url = laytpl(dataElem.attr("lay-url") || "").render(router),//接口 url
                    data = laytpl(dataElem.attr("lay-data") || "").render(router),//接口参数
                    headers = laytpl(dataElem.attr("lay-headers") || "").render(router); //接口请求的头信息
                try {
                    data = new Function("return " + data + ";")();
                } catch (d) {
                    hint.error("lay-data: " + d.message);
                    data = {};
                }

                try {
                    headers = new Function("return " + headers + ";")();
                } catch (d) {
                    hint.error("lay-headers: " + d.message);
                    headers = headers || {};
                }

                if(url) {
                    view.req({
                        type: dataElem.attr("lay-type") || "get",
                        url: url,
                        data: data,
                        dataType: "json",
                        headers: headers,
                        success: function (res) {
                            fn({
                                dataElem: dataElem,
                                res: res,
                                done: layDone
                            });
                        }
                    })
                } else {
                    fn({
                        dataElem: dataElem,
                        done: layDone
                    });
                }
            }());
        }
        return that;
    };

    //自动渲染数据模板
    Class.prototype.autoRender = function (id, callback) {
        var that = this;
        // 查找所有模板并渲染
        $(id || "body").find("*[template]").each(function (index, item) {
            var othis = $(this);
            that.container = othis;
            that.parse(othis, "refresh");
        });
    };

    //直接渲染字符
    Class.prototype.send = function (views, data) {
        var tpl = laytpl(views || this.container.html()).render(data || {});
        this.container.html(tpl);
        return this;
    }

    //局部刷新模板
    Class.prototype.refresh = function (callback) {
        var that = this,
            next = that.container.next(),
            templateid = next.attr("lay-templateid");

        if(that.id != templateid) return that;

        that.parse(that.container, "refresh", function () {
            that.container.siblings('[lay-templateid="' + that.id + '"]:last').remove();
            "function" == typeof callback && callback();
        });

        return  that;
    };

    //视图请求成功后的回调
    Class.prototype.then = function (callback) {
        this.then = callback;
        return this;
    };

    //视图渲染完毕后的回调
    Class.prototype.done = function (callback) {
        this.done = callback;
        return this;
    };

    exports("view", view);
});
