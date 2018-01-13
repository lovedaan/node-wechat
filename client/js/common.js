/*
 * @Author: Marte
 * @Date:   2017-12-29 20:20:55
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-01-13 17:23:26
 */

(function(win, $) {
    var config = {
        base: '', //你的域名
        storage: function(key, val) {
            if (val && typeof val == 'object') {
                window.localStorage.setItem(key, JSON.stringify(val));
            } else if (val == '') {
                window.localStorage.removeItem(key);
            } else {
                var data = window.localStorage.getItem(key);
                if (data) {
                    try {
                        data = JSON.parse(data);
                        return data;
                    } catch (err) {
                        return data;
                    }
                } else {
                    return '';
                }
            }
        },
        getUsers: function(callback) {
            const url = window.location.href;
            this.myAjax({
                type: 'GET',
                url: '/wechat-userinfo',
                data: {
                    url: encodeURIComponent(url)
                }
            }, function(data) {
                callback && callback(data);
            });

        },
        initWx: function(callback) {
            const url = window.location.href;
            this.myAjax({
                type: 'POST',
                url: '/wechat-oauth',
                data: {
                    url: encodeURIComponent(url)
                }
            }, function(data) {
                data = data.params;
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: data.appId, // 必填，公众号的唯一标识
                    timestamp: data.timestamp, // 必填，生成签名的时间戳
                    nonceStr: data.noncestr, // 必填，生成签名的随机串
                    signature: data.signature, // 必填，签名，见附录1
                    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'previewImage', 'chooseImage', 'startRecord', 'onVoiceRecordEnd', 'stopRecord', 'translateVoice', 'getNetworkType']
                });

                callback && callback();
            });
        },
        showToast: function(msg, callback) {
            var $toast = $('#toast');
            $toast.find('.weui-toast__content').html(msg || '添加成功');
            $toast.fadeIn(100);
            setTimeout(function() {
                $toast.fadeOut(100, function() {
                    callback && callback();
                });
            }, 2000);
        },
        showLoading: function(str) {
            str = str || '加载中...';
            var loadingDom = '<div id="loading-wrap" style="position: fixed; width: 100%; height: 100%; left: 0; top: 0; z-index: 9999; background:rgba(0,0,0,0.6); text-align: center; padding-top: 200px; box-sizing:border-box;"><img src="/images/loading.gif" width="50" alt="" /><p style="color:#fff;font-size:18px; margin-top: 5px;">' + str + '</p></div>';
            if ($('#loading-wrap').length) {
                $('#loading-wrap').find('p').html(str);
                $('#loading-wrap').show();
            } else {
                $('body').append($(loadingDom));
            }
        },
        hideLoading: function() {
            if ($('#loading-wrap').length) {
                $('#loading-wrap').hide();
            }
        },
        myAjax: function(opts, callback) {
            var that = this;
            $.ajax({
                type: opts.type || 'GET',
                url: opts.url,
                dataType: opts.dataType || 'json',
                data: opts.data || {},
                beforeSend: function() {
                    that.showLoading();
                },
                success: function(data) {
                    that.hideLoading();
                    callback && callback(data);
                }
            });
        }
    };
    win.config = config;
})(window, jQuery);