'use strict';
const models = require('../../../../common/models');
const _ = require('../../../../common/utils/helper');
const logger = require('../../../../common/utils/logger');
var path = require('path');
var fs = require('fs');
const options = require('../../../../common/config').get();
var request = require('request');

// 结果返回
function* result() {

  try {
    var files = this.request.files;
    if (files.length > 0) {
      for (var item in files) {
        var tempPath = files[item]['path'];
        var name = files[item]['name'];
        var nameArray = name.split('.');
        var destDir = path.join(__dirname, '../../../', '..', '.temp', nameArray[0]);
        if (fs.existsSync(destDir)) {
          _.rimraf(destDir);
        }
        _.mkdir(destDir);

        var file = path.join(destDir, name);

        var promise = new Promise(function (resolve, reject) {
          var out = fs.createReadStream(tempPath).pipe(
            fs.createWriteStream(file)//创建一个可写流  
          );
          out.on('finish', function () {
            resolve("OK");
            upload(file);
          });
        });

        var resultStr = yield promise;

      }
    }

    this.body = {
      success: true,
      errorMsg: '',
      data: null
    };
  } catch (ex) {
    console.log(ex);
    this.body = {
      success: false,
      errorMsg: 'slave上传结果失败',
      data: null
    };
  }
}

//将结果上传到业务系统中
function upload(file) {
  var formData = {
    // my_field: 'my_value',
    my_buffer: new Buffer([1, 2, 3]),
    attachments: [
      fs.createReadStream(file)
    ],
  };

  request.post({ url: options.businessUrls.jobresult, formData: formData }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('上传结果到业务系统失败:', err,file);
    }
    console.log('上传结果到业务系统成功:', file);
  });
}

function* dispatch() {
  yield result.call(this);
}

module.exports = dispatch;
