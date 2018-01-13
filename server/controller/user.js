/*
 * @Author: Marte
 * @Date:   2017-12-27 18:59:01
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-27 20:07:22
 */

import mongoose from 'mongoose';
const User = mongoose.model('User');

const userController = {
    async userReg(ctx, next) {
        const params = {
            username: ctx.request.body.username,
            userpwd: ctx.request.body.userpwd
        }

        const data = await User.saveRegister(params);

        ctx.body = data;

    },
    async userLogin(ctx, next) {
        const params = {
            username: ctx.request.body.username,
            userpwd: ctx.request.body.userpwd
        }

        const data = await User.saveLogin(params);

        ctx.body = data;

    }
};

export default userController;