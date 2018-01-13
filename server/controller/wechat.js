/*
 * @Author: Marte
 * @Date:   2017-12-20 19:36:27
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-01-01 11:43:12
 */

import sha from 'sha1';
import {
    parse as urlParse
} from 'url';
import {
    parse as queryParse
} from 'querystring';
import oriConfig from '../config';
import {
    getWechat,
    getAutho
} from '../wechat';
const client = getWechat();
const oauth = getAutho();

function proving(config) {
    const token = oriConfig.wechat.token;
    const {
        signature,
        timestamp,
        nonce,
        echostr
    } = config;
    let str = [token, timestamp, nonce].sort().join('');
    str = sha(str);
    return str;
}
//获取签名地址
async function getSignatureAsync(url) {

    const data = await client.fetchAccessToken();
    const token = data.access_token;
    const ticketData = await client.fetchTicket(token);
    const ticket = ticketData.ticket;
    let params = client.sign(ticket, url);
    params.appId = client.appID;
    return params;

}

function getAuthorizeURL(...args) {
    return oauth.getAuthorizeURL(...args);
}

async function getUserByCode(code) {
    const data = await oauth.fetchAccessToken(code);
    //console.log(data,'data============================');
    const user = await oauth.getUserInfo(data.access_token, data.openid);
    return user;
}

const wechatController = {
    async provingWechat(ctx, next) {
        const str = proving(ctx.query);
        if (str == ctx.query.signature) {
            ctx.body = ctx.query.echostr;
        } else {

            ctx.body = '出错了。。。'
        }
    },
    async oauthWechat(ctx, next) {
        const params = ctx.request.body;
        let url = decodeURIComponent(params.url);
        url = url.split('#')[0];
        const opts = await getSignatureAsync(url);
        ctx.body = {
            success: true,
            params: opts
        };
    },
    async redirect(ctx, next) {
        console.log(ctx.query);
        const target = oriConfig.SITE_ROOT_URL + 'oauth.html';
        let params = '';
        if (ctx.query.type !== 'detail') {
            params = `${ctx.query.type}-`;
        } else {
            const id = ctx.query['mid'] || ctx.query['amp;mid'];
            params = `${ctx.query.type}-${id}`;
        }
        const scope = 'snsapi_userinfo';
        //console.log(target, 'target================');
        const url = getAuthorizeURL(scope, target, params);
        // console.log(url, 'url================');
        ctx.redirect(url);

    },
    async userinfo(ctx, next) {

        let url = decodeURIComponent(ctx.query.url);
        const urlObj = urlParse(url);
        const paramsObj = queryParse(urlObj.query);
        const code = paramsObj.code;
        const user = await getUserByCode(code);
        ctx.body = {
            success: true,
            data: user
        };
    }
};

export default wechatController;