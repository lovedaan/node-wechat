/*
 * @Author: Marte
 * @Date:   2017-12-18 20:49:05
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-30 09:47:44
 */

'use strict';
import Router from 'koa-router';
import wechatController from '../controller/wechat';
import userController from '../controller/user';
import movieController from '../controller/movie';
import replyWechat from '../wechat/middleware';
import reply from '../wechat/reply';
import config from '../config';

export default function initRouter(app) {

    const router = new Router();
    //跟微信的服务器验证
    router.get('/wechat-hear', wechatController.provingWechat);

    router.post('/wechat-hear', replyWechat(config.wechat, reply));
    router.post('/register', userController.userReg);
    router.post('/login', userController.userLogin);
    router.get('/movie', movieController.movieList);
    router.post('/collection-movie', movieController.collectMovie);
    router.get('/usermovie', movieController.queryMovies);
    router.post('/deletemovie', movieController.deleteMovie);

    //验证签名，前端调用jssdk
    router.post('/wechat-oauth', wechatController.oauthWechat);
    router.get('/wechat-redirect', wechatController.redirect);
    router.get('/wechat-userinfo', wechatController.userinfo);

    app.use(router.routes()).use(router.allowedMethods());
}