/*
 * @Author: Marte
 * @Date:   2017-12-04 19:11:30
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-27 21:05:15
 */

'use strict';

const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../../config');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    username: String,
    userpwd: String,
});


UserSchema.statics = {

    async saveRegister(data) {
        let user = await this.findOne({
            username: data.username
        }).exec();

        if (user) {
            return {
                code: '99',
                msg: '用户名已存在'
            }
        } else {
            user = new User(data);
        }
        try {
            await user.save();
        } catch (err) {
            console.log(err, '出错了');
        }
        const token = jsonwebtoken.sign({
            data: data.username
        }, config.secret, {
            expiresIn: '300s'
        });
        return {
            code: '00',
            msg: '注册成功',
            result: {
                username: data.username,
                token
            }
        };
    },
    async saveLogin(data) {
        let user = await this.findOne(data).exec();

        if (user) {
            const token = jsonwebtoken.sign({
                data: data.username
            }, config.secret, {
                expiresIn: '300s'
            });
            return {
                code: '00',
                msg: '登录成功',
                result: {
                    username: data.username,
                    token
                }
            }
        } else {
            return {
                code: '99',
                msg: '用户名或密码不对',
                result: {}
            };
        }
    }
};

const User = mongoose.model('User', UserSchema);