/*
 * @Author: Marte
 * @Date:   2017-12-04 19:11:30
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-27 10:34:47
 */

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new mongoose.Schema({
    name: String,
    access_token: String,
    expires_in: Number,
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }
});


TokenSchema.pre('save', function(next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now();
    } else {
        this.meta.updatedAt = Date.now();
    }

    next();
});


TokenSchema.statics = {
    async getAccessToken() {
        console.log('获取数据库token=========');
        const token = await this.findOne({
            name: 'access_token'
        }).exec();

        console.log(token,2222);
        if (token && token.access_token) {
            token.access_token = token.access_token;
        }

        return token;
    },

    async saveAccessToken(data) {
        let token = await this.findOne({
            name: 'access_token'
        }).exec();

        if (token) {
            token.access_token = data.access_token;
            token.expires_in = data.expires_in;
        } else {
            token = new Token({
                name: 'access_token',
                access_token: data.access_token,
                expires_in: data.expires_in
            });
        }
        try {
            await token.save();
        } catch (err) {
            console.log(err, '出错了');
        }

        return data;
    }
};

const Token = mongoose.model('Token', TokenSchema);

