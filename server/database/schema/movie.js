/*
 * @Author: Marte
 * @Date:   2017-12-04 19:11:30
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-30 10:01:22
 */

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new mongoose.Schema({
    openid: String,
    movies: Array
});

function findMovieId(list, id) {
    return list.findIndex(item => item.id === id);
}

MovieSchema.statics = {

    async saveMovies(data) {
        let movie = await this.findOne({
            openid: data.openid
        }).exec();

        console.log(movie, '查询结果=========');
        let msg = '收藏成功！';
        if (movie) {
            //已经存在要继续更新
            let movies = movie.movies;
            const index = findMovieId(movies, data.info.id);
            if (index >= 0) {
                //已经存在删除
                movies.splice(index, 1);
                msg = '取消收藏成功';
            } else {
                movies.push(data.info);
            }

            const dataObj = await this.updateMany({
                openid: data.openid
            }, {
                movies: movies
            }, {
                multi: true
            });

        } else {
            let movies = [];
            movies.push(data.info);
            const dataObj = await this.create({
                openid: data.openid,
                movies: movies
            });
        }


        return msg;
    },
    async queryMovies(openid) {
        const data = await this.find({
            openid: openid
        }).exec();
        return data;
    },
    async deleteMovie(openid, id) {
        let movie = await this.findOne({
            openid: openid
        }).exec();
        console.log(movie, '查询数据');
        if (movie) {
            //已经存在要继续更新
            let movies = movie.movies;
            const index = findMovieId(movies, id);
            if (index >= 0) {
                //已经存在删除
                movies.splice(index, 1);
            }
            console.log(movies, '更新数据');
            const dataObj = await this.updateMany({
                openid: openid
            }, {
                movies: movies
            }, {
                multi: true
            });
            console.log(dataObj, 'dataObj============');

        }
        return {
            code: '00',
            msg: '删除成功'
        }
    }
};

const Movie = mongoose.model('Movie', MovieSchema);