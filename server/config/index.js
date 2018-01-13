/*
 * @Author: Marte
 * @Date:   2017-12-18 20:46:54
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-01-13 17:22:57
 */

'use strict';

const config = {
    mongodb: 'mongodb://localhost/ace-wechat', //填写你的mongodb新建数据库的名称，没有会自动新建
    wechat: {
        appID: '', //填写你的公众号上的appID
        appSecret: '', //填写你的公众号上的appSecret
        token: '' //填写你的公众号上的token
    },
    SITE_ROOT_URL: '' //填写你的公众号上的绑定的域名
};

export default config;