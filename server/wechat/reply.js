/*
 * @Author: Marte
 * @Date:   2017-12-05 16:42:56
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-30 11:00:23
 */

'use strict';
import rp from 'request-promise';
import config from '../config';

const tips = '嗨，我是小书童，你好，欢迎关注格林世界\n' +
    '回复 1 ~ 3  测试文字回复 \n' +
    '回复 4  测试图文回复 \n' +
    '回复 图片或拍照 测试图片回复 \n' +
    '回复 文字或语音 搜索电影 \n' +
    '点击<a href="http://coding.imooc.com">一起开心搞事吧</a>';

const search = async(q) => {
    const url = 'http://api.douban.com/v2/movie/search?q=' + encodeURIComponent(q);
    const data = await rp(url);
    return data;
}

const movie = async(type) => {
    const url = 'http://api.douban.com/v2/movie/' + type + '?start=1&count=7';
    const data = await rp(url);
    return data;
}


export default async(ctx, next) => {
    const message = ctx.weixin;
    let mp = require('../wechat/index.js');
    let cilent = mp.getWechat();
    console.log(message);
    if (message.MsgType == 'event') {
        if (message.Event == 'subscribe') {
            ctx.body = tips;
            //首次关注订阅
        } else if (message.Event == 'unsubscribe') {
            //取消订阅
            console.log('有用户取消订阅了，== ');
        } else if (message.Event == 'LOCATION') {
            //ctx.body = message.Latitude + ' : ' + message.Longitude + ' : ' + message.Precision;
        } else if (message.Event == 'VIEW') {
            ctx.body = message.EventKey + ':' + message.MenuId;
        } else if (message.Event == 'pic_sysphoto') {
            ctx.body = message.Count + ' : photo send';
        } else if (message.Event == 'CLICK') {
            const type = message.EventKey;

            let data = await movie(type);
            data = JSON.parse(data);
            if (data.subjects.length) {
                data = data.subjects.slice(0, 7);
                data = data.map(item => {
                    let picUrl, title, description, id;

                    picUrl = item.images ? item.images.large : item.subject.images.large;
                    title = item.title || item.subject.title;
                    id = item.id || item.subject.id;
                    description = item.title || item.subject.title;

                    let ret = {
                        title,
                        description,
                        picUrl,
                        url: config.SITE_ROOT_URL + 'wechat-redirect?type=detail&mid=' + id
                    };
                    return ret;
                });
            } else {
                data = '不好意思！没有搜索到电影。\n请重新输入！/:8*';
            }

            ctx.body = data;
        }
    } else if (message.MsgType == 'text') {
        if (message.Content == '1' || message.Content == '2' || message.Content == '3') {
            /*const list = [{
                openid: 'oEokkvzxN_tmipRVGjSMmRoTAsQ0',
                lang: 'zh_CN'
            }];*/
            // const data = await cilent.handleOperation('fetchTags');
            //const data = await cilent.handleOperation('getMenu');
            //console.log(data,131231313);
            ctx.body = '测试====，您输入了：' + message.Content;
        } else if (message.Content == '菜单') {
            //只有我才能修改 oEokkvzxN_tmipRVGjSMmRoTAsQ0
            const myOpenid = 'oEokkvzxN_tmipRVGjSMmRoTAsQ0';
            let msg = '修改菜单成功！';
            if (message.FromUserName == myOpenid) {
                //初始化菜单
                const list = require('./menu').default;
                const {
                    getWechat
                } = require('./index');
                const cilent = getWechat();
                const menuData = await cilent.handleOperation('createMenu', list);
                //const menuData = await cilent.handleOperation('getMenu');

                console.log(menuData, 131231313);
            } else {
                msg = message.Content;
            }

            ctx.body = msg;
        } else {
            let data = await search(message.Content);
            data = JSON.parse(data);
            if (data.subjects.length) {
                data = data.subjects.slice(0, 7);
                data = data.map(item => {
                    let ret = {
                        title: item.title,
                        description: item.title,
                        picUrl: item.images.large,
                        url: config.SITE_ROOT_URL + 'wechat-redirect?type=detail&mid=' + item.id
                    };
                    return ret;
                });
            } else {
                data = '不好意思！没有搜索到电影。\n请重新输入！/:8*';
            }


            //console.log(data,'-============');

            ctx.body = data;
        }


    } else if (message.MsgType == 'image') {
        ctx.body = {
            type: 'image',
            mediaId: message.MediaId
        };
    } else if (message.MsgType == 'voice') {
        const text = message.Recognition;
        let data = await search(text);
        data = JSON.parse(data);
        if (data.subjects.length) {
            data = data.subjects.slice(0, 7);
            data = data.map(item => {
                let ret = {
                    title: item.title,
                    description: item.title,
                    picUrl: item.images.large,
                    url: config.SITE_ROOT_URL + 'wechat-redirect?type=detail&mid=' + item.id,
                };
                return ret;
            });
        } else {
            data = '不好意思！没有搜索到电影。\n请重新输入！/:8*';
        }
        ctx.body = data;
    } else if (message.MsgType == 'video') {
        ctx.body = {
            type: 'video',
            title: message.ThumbMediaId,
            mediaId: message.MediaId,
            description: '视频描述。。。'
        };
    } else if (message.MsgType == 'location') {
        ctx.body = message.Location_X + ' : ' + message.Location_Y + ' : ' + message.Label;
    } else if (message.MsgType == 'link') {
        ctx.body = message.Title;
    }


}