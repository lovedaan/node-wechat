/*
 * @Author: Marte
 * @Date:   2017-12-05 16:14:37
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-26 20:14:05
 */

'use strict';
import sha1 from 'sha1';
import getRawBody from 'raw-body';
import * as util from '../utils/util';

export default function(opts, reply) {
    return async function wechatMiddle(ctx, next) {
        const token = opts.token;
        const {
            signature,
            nonce,
            timestamp,
            echostr
        } = ctx.query;
        //console.log(ctx.query);
        const str = [token, timestamp, nonce].sort().join('');
        const sha = sha1(str);

        if (sha !== signature) {
            console.log(nonce, timestamp, echostr, '出错了');
            ctx.body = '出错了。。。';
            return false;
        }
        const data = await getRawBody(ctx.req, {
            length: ctx.length,
            limit: '1mb',
            encoding: ctx.charset
        });

        const content = await util.parseXML(data);
        //console.log(content.xml,666666666666);
        const message = util.formatMessage(content.xml);
        ctx.weixin = message;

        await reply.apply(ctx, [ctx, next]);
        const replyBody = ctx.body;
        const msg = ctx.weixin;
        //console.log(replyBody,2222222222);
        const xml = util.tpl(replyBody, msg);
        //console.log(xml,333333333);
        ctx.status = 200;
        ctx.type = 'application/xml';
        ctx.body = xml;
    }



}