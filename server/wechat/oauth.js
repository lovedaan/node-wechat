import rp from 'request-promise';

const base = 'https://api.weixin.qq.com/sns/';
const api = {
    authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
    accessToken: base + 'oauth2/access_token?',
    userInfo: base + 'userinfo?'
};

export default class WechatOauth {

    constructor(opts) {
        this.appID = opts.appID;
        this.appSecret = opts.appSecret;
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
            console.log(err);
        }

    }

    getAuthorizeURL(scope = 'snsapi_base', target, state) {
        const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

        return url;
    }

    async fetchAccessToken(code) {

        let url = `${api.accessToken}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;
        let data = await this.request({
            url: url
        });

        return data;
    }

    async getUserInfo(token, appID, lang = 'zh_CN') {
        const url = `${api.userInfo}access_token=${token}&openid=${appID}&lang=${lang}`;
        //console.log(url, 'oauth.js  url ============');
        let data = await this.request({
            url: url
        });

        return data;
    }
}