'use strict';

const mongoose = require('mongoose');
var co = require('co');
const _ = require('../../common/utils/helper');

const Schema = mongoose.Schema;
const P = mongoose.Promise;
const PAGE_SIZE = 10;


// app table schema
const attachmentSchema = new Schema({

    /**
     * appPath
     */
    attachmentAppPath: {
        type: String
    },

    /**
     * appName
     */
    attachmentAppName: {
        type: String
    },

    /**
     * 脚本路径Path
     */
    attachmentScriptPath: {
        type: String
    },

    /**
     * 脚本名称
     */
    attachmentScriptName: {
        type: String
    },

    /**
      * projectId
      */

    projectId: {
        type: String
    },

    /**
     * 接入时间
     */

    created_at: {
        type: Date,
        default: Date.now
    },

    /**
     * 更新时间
     */

    updated_at: {
        type: Date,
        default: Date.now
    },

});

attachmentSchema.index({
    _id: 1,
    create_date: -1
});

attachmentSchema.methods.add = function () {
    const promise = new P();
    this.save((error, data) => {
        if (error) {
            console.error();
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

attachmentSchema.methods.removeById = function (id) {
    const promise = new P();

    attachment.remove({
        _id: id
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

attachmentSchema.methods.updateById = function (id, data) {
    const promise = new P();

    attachment.update({
        _id: id
    }, data, {
        upsert: true
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};




//根据appname更新app信息
attachmentSchema.methods.updateByAttachmentName = function (attachmentName, data) {
    const promise = new P();

    attachment.update({
        attachmentName: attachmentName
    }, data, {
        upsert: false
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

attachmentSchema.methods.getById = function (id) {
    const promise = new P();

    attachment.findOne({
        _id: id
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

attachmentSchema.methods.getByProjectId = function (projectId) {
    const promise = new P();

    attachment.findOne({
        projectId: projectId
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};




function sleep(milliseconds){
  var start = new Date().getTime();
  while((new Date().getTime() -start) < milliseconds){

  }
}


attachmentSchema.methods.getByAttachmentName = function (attachmentName) {
    const promise = new P();
    attachment.findOne({
        attachmentName: attachmentName
    }, (error, data) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });

    return promise;
};

attachmentSchema.methods.getAll = function (page) {
    const _page = parseInt(page, 10) || 1;
    const promise = new P();

    attachment.find({}, null, {
        skip: PAGE_SIZE * (_page - 1),
        sort: {
            _id: -1
        },
        limit: PAGE_SIZE || Infinity
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

attachmentSchema.methods.getTotalCount = function () {
    const promise = new P();

    attachment.count({}, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

attachmentSchema.methods.getExpectedOne = function () {
    const promise = new P();

    attachment.findOne({
        status: 0,
        time: {
            $lte: Date.now()
        }
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

attachmentSchema.virtual('created_date').get(function () {
    return _.moment(this.created_at).format('YYYY-MM-DD HH:mm:ss');
});

attachmentSchema.virtual('updated_date').get(function () {
    return _.moment(this.updated_at).format('YYYY-MM-DD HH:mm:ss');
});


mongoose.model('attachment', attachmentSchema);

const attachment = mongoose.model('attachment');

module.exports = attachment;
