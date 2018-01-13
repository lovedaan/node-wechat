/*
 * @Author: Marte
 * @Date:   2017-12-05 16:40:50
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-26 20:04:11
 */

import xml2js from 'xml2js';
import template from './tpl';
import sha1 from 'sha1';

function parseXML(xml) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, {
            trim: true
        }, (err, content) => {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }

        });
    });
}

function formatMessage(result) {
    const messages = {};
    if (typeof result === 'object') {
        const keys = Object.keys(result);

        for (let i = 0; i < keys.length; i++) {
            let item = result[keys[i]];
            let key = keys[i];

            if (!(item instanceof Array) || item.length === 0) {
                continue;
            }

            if (item.length === 1) {
                let val = item[0];
                if (typeof val === 'object') {
                    messages[key] = formatMessage(val);
                } else {
                    messages[key] = (val || '').trim();;
                }
            } else {
                messages[key] = [];

                for (let j = 0; j < item.length; j++) {
                    messages[key].push(formatMessage(item[j]));
                }
            }
        }
    }

    return messages;
}

function tpl(content, message) {
    let type = 'text';
    if (Array.isArray(content)) {
        type = 'news';
    }

    if (!content) {
        content = 'Empty News';
    }

    if (content && content.type) {
        type = content.type;
    }

    let info = Object.assign({}, {
        content: content,
        createTime: new Date().getTime(),
        msgType: type,
        toUserName: message.FromUserName,
        fromUserName: message.ToUserName,
    });

    return template(info);
}

//生成签名
function createNonce() {
    return Math.random().toString(36).substr(2, 15);
}

function createTimestamp() {
    return parseInt(new Date().getTime() / 1000) + '';
}

function sign(ticket, url) {
    const nonce = createNonce();
    const timestamp = createTimestamp();
    const signature = signIt(nonce, ticket, timestamp, url);

    return {
        noncestr: nonce,
        timestamp: timestamp,
        signature: signature
    }
}

function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

function signIt(nonce, ticket, timestamp, url) {
    const ret = {
        jsapi_ticket: ticket,
        nonceStr: nonce,
        timestamp: timestamp,
        url: url
    };
    const string = raw(ret);
    const sha = sha1(string);

    return sha;
}

export {
    parseXML,
    formatMessage,
    tpl,
    sign
}