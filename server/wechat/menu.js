/*
 * @Author: Marte
 * @Date:   2017-12-10 16:17:20
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-01-03 21:49:59
 */
import config from '../config';

export default {
    "button": [{
        "name": "榜单",
        "sub_button": [{
            "type": "click",
            "name": "正在热映",
            "key": "in_theaters"
        }, {
            "type": "click",
            "name": "即将上映",
            "key": "coming_soon"
        }, {
            "type": "view",
            "name": "最热",
            "url": config.SITE_ROOT_URL + 'wechat-redirect?type=index'
        }, {
            "type": "view",
            "name": "个人中心",
            "url": config.SITE_ROOT_URL + 'wechat-redirect?type=user'
        }]
    }, {
        "type": "click",
        "name": "TOP250",
        "key": "top250"
    }, {
        "type": "click",
        "name": "北美票房榜",
        "key": "us_box"
    }]
}