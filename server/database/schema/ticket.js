/*
 * @Author: Marte
 * @Date:   2017-12-04 19:11:30
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-12-26 21:10:04
 */

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new mongoose.Schema({
    name: String,
    ticket: String,
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


TicketSchema.pre('save', function(next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now();
    } else {
        this.meta.updatedAt = Date.now();
    }

    next();
});


TicketSchema.statics = {
    async getTicket() {
        //console.log('获取数据库ticket=========');
        const ticket = await this.findOne({
            name: 'ticket'
        }).exec();

        //console.log(ticket,2222);
        if (ticket && ticket.ticket) {
            ticket.ticket = ticket.ticket;
        }

        return ticket;
    },

    async saveTicket(data) {
        let ticket = await this.findOne({
            name: 'ticket'
        }).exec();

        if (ticket) {
            ticket.ticket = data.ticket;
            ticket.expires_in = data.expires_in;
        } else {
            ticket = new Ticket({
                name: 'ticket',
                ticket: data.ticket,
                expires_in: data.expires_in
            });
        }
        try {
            await ticket.save();
        } catch (err) {
            console.log(err, '出错了');
        }

        return data;
    }
};

const Ticket = mongoose.model('Ticket', TicketSchema);