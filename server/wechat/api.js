/*
 * @Author: Marte
 * @Date:   2017-12-18 21:05:22
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-26 20:48:17
 */

import rp from 'request-promise';
import * as _ from 'lodash';
import fs from 'fs';
import path from 'path';
import {
    sign
} from '../utils/util';

const base = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: base + 'token?grant_type=client_credential',
    //临时素材相关
    temporary: {
        //上传临时素材
        upload: base + 'media/upload?', //?access_token=ACCESS_TOKEN&type=TYPE
        //下载临时素材
        fetch: base + 'media/get?', //access_token=ACCESS_TOKEN&media_id=MEDIA_ID
    },
    //永久素材相关
    permanent: {
        //上传永久其他类型素材
        upload: base + 'material/add_material?', //access_token=ACCESS_TOKEN&type=TYPE
        //上传永久图文里面的图片
        uploadNewsPic: base + 'media/uploadimg?', // access_token=ACCESS_TOKEN
        //上传永久图文新闻
        uploadNews: base + 'material/add_news?', //access_token=ACCESS_TOKEN
        //获取永久素材
        fetch: base + 'material/get_material?',
        //删除永久素材
        del: base + 'material/del_material?', //access_token=ACCESS_TOKEN
        //修改永久素材
        update: base + 'material/update_news?', //access_token=ACCESS_TOKEN
        //获取素材总数
        count: base + 'material/get_materialcount?', //access_token=ACCESS_TOKEN
        //获取素材列表
        batchList: base + 'material/batchget_material?' //access_token=ACCESS_TOKEN

    },
    //用户标签相关接口
    tag: {
        //创建标签
        created: base + 'tags/create?',
        //获取标签
        fetch: base + 'tags/get?',
        //更新标签
        update: base + 'tags/update?',
        //删除标签
        del: base + 'tags/delete?',
        //获取标签下粉丝列表
        fetchUser: base + 'user/tag/get?',
        //批量为用户打标签
        batchTag: base + 'tags/members/batchtagging?',
        //批量为用户取消标签
        batchUnTag: base + 'tags/members/batchuntagging?',
        //获取用户身上的标签列表
        getTagList: base + 'tags/getidlist?'
    },
    //用户相关
    user: {
        //设置用户备注名
        remark: base + 'user/info/updateremark?',
        //获取单个用户基本信息
        info: base + 'user/info?',
        //批量获取用户基本信息
        batchInfo: base + 'user/info/batchget?',
        //获取用户列表
        fetchUserList: base + 'user/get?',
        //获取公众号的黑名单列表
        fetchBlackList: base + 'tags/members/getblacklist?',
        //拉黑用户
        batchBlackList: base + 'tags/members/batchblacklist?',
        //取消拉黑用户
        batchUnBlackList: base + 'tags/members/batchunblacklist?'
    },
    //菜单相关
    menu: {
        //创建自定义菜单
        createMenu: base + 'menu/create?',
        //查询自定义菜单
        fetchMenu: base + 'menu/get?',
        //删除自定义菜单
        del: base + 'menu/delete?',
        //创建个性化菜单
        addCondition: base + 'menu/addconditional?',
        //删除个性化菜单
        delCondition: base + 'menu/delconditional?',
        //获取自定义菜单配置接口
        getInfo: base + 'get_current_selfmenu_info?'
    },
    ticket: {
        get: base + 'ticket/getticket?'
    }
};

export default class Wechat {

    constructor(opts) {
        this.opts = Object.assign({}, opts);
        this.appID = opts.appID;
        this.appSecret = opts.appSecret;
        this.getAccessToken = opts.getAccessToken;
        this.getTicket = opts.getTicket;
        this.saveAccessToken = opts.saveAccessToken;
        this.saveTicket = opts.saveTicket;

        this.fetchAccessToken();
        //console.log(opts,'wechat参数');
        //console.log('初始化WeChat=====');
    }

    async request(options) {
        options = Object.assign({}, options, {
            json: true
        });
        try {
            const response = await rp(options);
            //console.log(response,'response');
            return response;
        } catch (err) {
            console.log(err, 'wecha-lib/index.js 第35行报错');
        }

    }

    async fetchAccessToken() {

        let data = await this.getAccessToken();
        //console.log(data,4646464646);
        if (!this.isValidToken(data, 'access_token')) {
            data = await this.updateAccessToken();
            // console.log(data,49494949449);
        }

        await this.saveAccessToken(data);

        return data;
    }

    async fetchTicket(token) {

        let data = await this.getTicket();
        //console.log(data,4646464646);
        if (!this.isValidToken(data, 'ticket')) {
            data = await this.updateTicket(token);
        }

        await this.saveTicket(data);

        return data;
    }
    async updateTicket(token) {
        const url = `${api.ticket.get}&access_token=${token}&type=jsapi`;
        const data = await this.request({
            url: url
        });
        const now = (new Date().getTime());
        const expiresIn = now + (data.expires_in - 20) * 1000;

        data.expires_in = expiresIn;

        return data;
    }
    async updateAccessToken() {
        const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;
        const data = await this.request({
            url: url
        });
        //console.log(data,11111);
        const now = (new Date().getTime());
        const expiresIn = now + (data.expires_in - 20) * 1000;

        data.expires_in = expiresIn;

        return data;

    }

    isValidToken(data, name) {
            if (!data || !data.expires_in || !data[name]) {
                return false;
            }

            const expiresIn = data.expires_in;
            const now = (new Date().getTime());

            if (now < expiresIn) {
                return true;
            } else {
                return false;
            }
        }
        //上传临时 | 永久素材
    async handleOperation(opts, ...args) {
            const tokenData = await this.fetchAccessToken();
            const options = this[opts](tokenData.access_token, ...args);
            //console.log(options,22222);
            const data = await this.request(options);
            return data;
        }
        //拼接永久上传素材需要的参数
    uploadMaterial(token, type, material, permanent) {
        let form = {};
        let url = api.temporary.upload;

        if (permanent) {
            url = api.permanent.upload;

            _.extend(form, permanent);
        }

        if (type == 'pic') {
            url = api.permanent.uploadNewsPic;
        }

        if (type == 'news') {
            url = api.permanent.uploadNews;
            form = material;
        } else {

            form.media = fs.createReadStream(material);
        }

        let uploadUrl = url + 'access_token=' + token;

        if (!permanent) {
            uploadUrl += '&type=' + type;
        } else {
            form.access_token = token;
            //form.field('access_token',token);
        }

        const opts = {
            method: 'POST',
            url: uploadUrl,
            json: true
        };

        if (type == 'news') {
            opts.body = form;
        } else {
            opts.formData = form;
        }

        return opts;

    }

    //拼接获取素材的参数
    fetchMaterial(token, mediaId, type, permanent) {
        let form = {};
        let fetchUrl = api.temporary.fetch;

        if (permanent) {
            fetchUrl = api.permanent.fetch;
        }

        let url = fetchUrl + 'access_token=' + token;



        if (permanent) {
            form.media_id = mediaId;
            form.access_token = token;
            options.body = form;
        } else {
            if (type == 'video') {
                url = url.replace('https://', 'http://');
            }

            url += '&media_id=' + mediaId;
        }

        let options = {
            method: 'POST',
            url: url
        };

        return options;
    }

    //删除永久素材
    deleteMaterial(token, mediaId) {
            const form = {
                media_id: mediaId
            };

            const url = api.permanent.del + 'access_token=' + token + '&media_id=' + mediaId;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //更新图文素材
    updateMaterial(token, mediaId, news) {
            const form = {
                media_id: mediaId
            };

            _.extend(form, news);

            const url = api.permanent.update + 'access_token=' + token + '&media_id=' + mediaId;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //获取素材总条数
    countMaterial(token) {
        const url = api.permanent.count + 'access_token=' + token;

        return {
            method: 'POST',
            url: url
        }
    }

    //获取列表
    batchMaterial(token, options) {

        options.type = options.type || 'image';
        options.offset = options.offset || 0;
        options.count = options.count || 10;

        const url = api.permanent.batchList + 'access_token=' + token;

        return {
            method: 'POST',
            url: url,
            body: options
        }
    }

    //增加标签
    createdTag(token, name) {
        const form = {
            tag: {
                name: name
            }
        };

        const url = api.tag.created + 'access_token=' + token;

        return {
            method: 'POST',
            url: url,
            body: form
        }
    }

    //获取标签
    fetchTags(token) {
        const url = api.tag.fetch + 'access_token=' + token;

        return {
            method: 'GET',
            url: url
        }
    }

    //更新标签
    updateTag(token, tagId, name) {
        const form = {
            tag: {
                id: tagId,
                name: name
            }
        };

        const url = api.tag.update + 'access_token=' + token;

        return {
            method: 'POST',
            url: url,
            body: form
        }
    }

    //删除标签
    deleteTag(token, tagId) {
        const form = {
            tag: {
                id: tagId
            }
        };

        const url = api.tag.del + 'access_token=' + token;

        return {
            method: 'POST',
            url: url,
            body: form
        }
    }

    //获取标签下粉丝列表
    fetchTagUser(token, tagId, openId) {
            const form = {
                tagid: tagId,
                next_openid: openId || ''
            };

            const url = api.tag.fetchUser + 'access_token=' + token;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //批量为用户打标签
    batchTag(token, tagId, openIdList) {
            const form = {
                tagid: tagId,
                openid_list: openIdList
            };

            const url = api.tag.batchTag + 'access_token=' + token;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //批量为用户取消标签
    batchUnTag(token, tagId, openIdList) {
            const form = {
                tagid: tagId,
                openid_list: openIdList
            };

            const url = api.tag.batchUnTag + 'access_token=' + token;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //批量为用户取消标签
    getTagList(token, openId) {
        const form = {
            openid: openId,
        };

        const url = api.tag.getTagList + 'access_token=' + token;

        return {
            method: 'POST',
            url: url,
            body: form
        }
    }

    //设置用户备注名
    remarkUser(token, openId, remark) {
            const form = {
                openid: openId,
                remark: remark
            };

            const url = api.user.remark + 'access_token=' + token;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //获取用户信息
    getUserInfo(token, openId, lang) {
            const url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang || 'zh_CN'}`;

            return {
                method: 'GET',
                url: url
            }
        }
        //批量获取用户基本信息
    batchUsersInfo(token, userList) {
            const form = {
                user_list: userList
            };

            const url = api.user.batchInfo + 'access_token=' + token;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //获取用户列表
    fetchUserList(token, openId) {
            const url = `${api.user.fetchUserList}access_token=${token}&next_openid=${openId || ''}`;

            return {
                method: 'GET',
                url: url
            }
        }
        // 获取公众号的黑名单列表
    fetchBlackList(token, openId) {
            const form = {
                begin_openid: openId
            };

            const url = api.user.fetchBlackList + 'access_token=' + token;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //拉黑用户
    batchBlackList(token, openidList) {
            const form = {
                openid_list: openidList
            };

            const url = api.user.batchBlackList + 'access_token=' + token;

            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //取消拉黑用户
    batchUnBlackList(token, openidList) {
        const form = {
            openid_list: openidList
        };

        const url = api.user.batchUnBlackList + 'access_token=' + token;

        return {
            method: 'POST',
            url: url,
            body: form
        }
    }

    //创建自定义菜单
    createMenu(token, menu) {

            const url = api.menu.createMenu + 'access_token=' + token;

            return {
                method: 'POST',
                url: url,
                body: menu
            }
        }
        //查询自定义菜单
    getMenu(token) {
            const url = api.menu.fetchMenu + 'access_token=' + token;
            return {
                method: 'GET',
                url: url
            }
        }
        //删除自定义菜单
    delMenu(token) {
            const url = api.menu.del + 'access_token=' + token;

            return {
                method: 'GET',
                url: url
            }
        }
        //创建个性化菜单
    addConditionMenu(token, menu, rule) {
            const url = api.menu.addCondition + 'access_token=' + token;
            const form = {
                button: menu,
                matchrule: rule
            };
            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //删除个性化菜单
    delConditionMenu(token, menuId) {
            const url = api.menu.delCondition + 'access_token=' + token;
            const form = {
                menuid: menuId
            };
            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        //获取自定义菜单配置接口
    getInfoMenu(token) {
        const url = api.menu.getInfo + 'access_token=' + token;

        return {
            method: 'GET',
            url: url
        }
    }

    sign(ticket, url) {

        return sign(ticket, url);
    }
}