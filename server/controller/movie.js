/*
 * @Author: Marte
 * @Date:   2017-12-27 18:59:01
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-30 10:00:52
 */

import rp from 'request-promise';
import mongoose from 'mongoose';

const getMovieList = async() => {
    const opts = {
        uri: 'http://api.douban.com/v2/movie/in_theaters',
        json: true
    };

    const data = await rp(opts);

    return data;
}
const Movie = mongoose.model('Movie');
const movieController = {
    async movieList(ctx, next) {
        const data = await getMovieList();
        ctx.body = {
            code: '00',
            msg: '查询电影列表成功',
            result: {
                list: data.subjects
            }
        };
    },
    async collectMovie(ctx, next) {
        const paramsObj = {
            openid: ctx.request.body.openid,
            info: ctx.request.body.info
        }

        const data = await Movie.saveMovies(paramsObj);
        ctx.body = {
            success: true,
            msg: data,
            result: {}
        }
    },
    async queryMovies(ctx, next) {
        const data = await Movie.queryMovies(ctx.query.openid);
        console.log(data, '电影数据=============');
        ctx.body = {
            success: true,
            msg: '查询成功',
            result: {
                list: data[0]
            }
        }
    },
    async deleteMovie(ctx, next) {
        console.log(ctx.request.body);
        const data = await Movie.deleteMovie(ctx.request.body.openid, ctx.request.body.id);
        ctx.body = {
            success: true,
            msg: '删除成功',
            result: {}
        }
    }
};

export default movieController;