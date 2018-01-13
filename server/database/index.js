/*
 * @Author: Marte
 * @Date:   2017-12-20 19:53:49
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-29 20:18:45
 */

'use strict';
import config from '../config';
import mongoose from 'mongoose';
import fs from 'fs';
import {
    resolve
} from 'path';
const models = resolve(__dirname, './schema/');
fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*js$/))
    .forEach(file => {
        //console.log(resolve(models, file));
        require(resolve(models, file));
    });

const database = (app) => {

    mongoose.set('debug', true);
    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongodb, {
        useMongoClient: true
    });
    mongoose.connection.on('disconnected', () => {
        mongoose.connect(config.mongodb);
    });

    mongoose.connection.on('error', (err) => {
        console.error(err);
    });

    mongoose.connection.on('open', async() => {
        console.log('数据库已连接：' + config.mongodb);
    });
}

export default database;