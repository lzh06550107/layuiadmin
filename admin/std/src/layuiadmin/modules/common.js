/** layuiAdmin.std-v1.4.0 LPPL License By https://www.layui.com/admin/ */

layui.define(function (exports) {
    var $ = layui.$,
        layer = layui.layer,
        laytpl = layui.laytpl,
        setter = layui.setter,
        view = layui.view,
        admin = layui.admin;

    // 监听注销事件
    admin.events.logout = function () {
        admin.req({
            url: layui.setter.base + "json/user/logout.js",
            type: "get",
            data: {},
            done: function (res) {
                admin.exit(function () {
                    // 重定向到登录页面
                    location.href = "user/login.html"
                });
            }
        });
    };

    exports("common", {});
});