/*
 * @Author: Marte
 * @Date:   2017-12-14 20:09:40
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-01-13 17:21:25
 */

import Koa from 'koa';
import KoaStatic from 'koa-static';
import koaBody from 'koa-body';
//要确保数据库定义的Schema先执行，才能保证路由里面能正常使用，所以要优于路由文件加载进来
import database from './database/index';
import router from './router';
const app = new Koa();
app.use(koaBody({
    multipart: true
}));

database(app);
router(app);
app.use(KoaStatic('./client/'));

app.listen(8000, () => {
    console.log('服务器运行中，监听8000');
});