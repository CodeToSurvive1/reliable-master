'use strict';

const mongoose = require('mongoose');

const _ = require('../../common/utils/helper');

const Schema = mongoose.Schema;
const P = mongoose.Promise;
const PAGE_SIZE = 10;

/**
 * 设备状态
 * 1 - > 可用
 * 2 - > 维修中
 * 3 - > 使用中
 * 4 - > 不可用
 */
global.DEVICE_STATUS = {
    AVAILABLE: 1,
    MAINTAIN: 2,
    USING: 3,
    UNAVAILABLE: 4
};

// Device table schema
const Devicechema = new Schema({

    /**
     * 设备序列号
     */
    serialNumber: {
        type: String
    },


    /**
     * slave节点IP
     */
    slaveIP: {
        type: String
    },

    /**
     * slave节点id
     */
    slaveId: {
        type: String
    },

    /**
     * 设备系统
     */
    plantForm: {
        type: String
    },
    /**
     * 设备厂商
     */

    brand: {
        type: String
    },

    /**
     * 设备型号（mate8，iPhone6）
     */

    model: {
        type: String
    },

    /**
     * 系统版本号（安卓4.1）
     */

    releaseVersion: {
        type: String
    },


    /**
     * 系统版本号（安卓4.1）
     */
    sdkVersion: {
        type: String
    },


    /**
     * 系统版本号（安卓4.1）
     */
    abi: {
        type: String
    },

    /**
     * 屏幕宽度
     */
    screenWidth: {
        type: String
    },

    /**
     * 屏幕高度
     */
    screenHeight: {
        type: String
    },

    /**
     * 设备状态
     * 1 - > 可用
     * 2 - > 维修中
     * 3 - > 使用中
     * 4 - > 不可用
     */

    status: {
        type: Number,
        default: global.DEVICE_STATUS.AVAILABLE
    },

    /**
     * 错误信息
     */
    errorMessage: {
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

Devicechema.index({
    _id: 1,
    create_date: -1
});

Devicechema.methods.add = function () {
    const promise = new P();

    this.save((error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

Devicechema.methods.removeById = function (id) {
    const promise = new P();

    Device.remove({
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

Devicechema.methods.updateById = function (id, data) {
    const promise = new P();

    Device.update({
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

Devicechema.methods.updateBySlaveId = function (slaveId, serialNumbers, data) {
    const promise = new P();

    Device.update({
        slaveId: slaveId,
        status: 1,
        serialNumber: {
            $nin: serialNumbers
        }
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

/**
 * slave没有的情况下，将所有可用设备设置为不可用
 * @param slaveId
 * @param serialNumbers
 * @param data
 * @returns {*}
 */
Devicechema.methods.updateByStatus = function (data) {
    const promise = new P();

    Device.update({
        status: 1
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

//根据序列号更新设备信息
Devicechema.methods.updateBySerialNumber = function (serialNumber, data) {
    const promise = new P();

    Device.update({
        serialNumber: serialNumber
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

Devicechema.methods.getById = function (id) {
    const promise = new P();

    Device.findOne({
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


Devicechema.methods.queryValidDevices = function () {
    const promise = new P();

    Device.find({
        status: 1
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};


Devicechema.methods.getBySerialNumber = function (serialNumber) {
    const promise = new P();

    Device.findOne({
        serialNumber: serialNumber
    }, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

Devicechema.methods.getAll = function (page) {
    const _page = parseInt(page, 10) || 1;
    const promise = new P();

    Device.find({}, null, {
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

Devicechema.methods.getTotalCount = function () {
    const promise = new P();

    Device.count({}, (error, data) => {

        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(null, data);
        }
    });
    return promise;
};

Devicechema.methods.getExpectedOne = function () {
    const promise = new P();

    Device.findOne({
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

Devicechema.virtual('created_date').get(function () {
    return _.moment(this.created_at).format('YYYY-MM-DD HH:mm:ss');
});

Devicechema.virtual('updated_date').get(function () {
    return _.moment(this.updated_at).format('YYYY-MM-DD HH:mm:ss');
});


mongoose.model('Device', Devicechema);

const Device = mongoose.model('Device');

module.exports = Device;
