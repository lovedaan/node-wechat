/*
 * @Author: Marte
 * @Date:   2017-12-05 12:25:49
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-26 21:11:17
 */

'use strict';
import mongoose from 'mongoose';
import config from '../config';
import Wechat from './api';
import WechatOauth from './oauth.js';

const Token = mongoose.model('Token');
const Ticket = mongoose.model('Ticket');

const wechatConfig = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,
        getAccessToken: async() => await Token.getAccessToken,
        getTicket: async() => await Ticket.getTicket,
        saveAccessToken: async(data) => await Token.saveAccessToken(data),
        saveTicket: async(data) => await Ticket.saveTicket(data)
    }
};

export const getWechat = () => {
    const wechatCilent = new Wechat(wechatConfig.wechat);
    return wechatCilent;
}


export const getAutho = () => {
    const autho = new WechatOauth(wechatConfig.wechat);
    return autho;
}