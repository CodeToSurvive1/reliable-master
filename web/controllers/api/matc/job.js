'use strict';
const models = require('../../../../common/models');
const _ = require('../../../../common/utils/helper');
const logger = require('../../../../common/utils/logger');
var request = require('request');
var fs = require("fs");
var http = require("http");
var co = require('co');
var Iconv = require('iconv-lite');
let REQUST = require("co-request");


const Project = models.Project;
const Attachment = models.Attachment;
// 提交任务
function *addTask() {

console.log("xiaoming1231111111111111111111111");

  const project = new Project();
//  project.repositoryUrl = _.trim(this.request.body['repositoryUrl']);
  project.repositoryUrl = 'https://github.com/xiaomingstudy/macaca-test-sample.git';

  //project.repositoryBranch = _.trim(this.request.body['repositoryBranch']);
  project.repositoryBranch = 'master';
  // project.serialNumber = _.trim(this.request.body['serialNumber']);
  project.serialNumber ='PBV0216706008526';
  project.resultUrl = _.trim(this.request.body['result_url']);
  project.scriptUrl = _.trim(this.request.body['script_url']);
  project.apkUrl = _.trim(this.request.body['app_url']);
  project.statusUrl = _.trim(this.request.body['job_status_url']);

  project.time = _.moment().format('x');

  project.environment = 'udid='+project.serialNumber;

  console.log("***************************************************");
  console.log(project);
  console.log("***************************************************");



  const attachment = new Attachment();

  if (yield project.add()) {
    var apkurl = "http://192.1.1.7:9090/demo/services/wsdevice/app/17";
    var scriptUrl = "http://192.1.1.7:9090/demo/services/wsdevice/script/12";
    co(function* () {
      var appResult = yield REQUST.get({ url: apkurl+'.md5sum'});
      var appNames = appResult.headers['content-disposition'].split('\'')[1];
      var names = Iconv.decode(appResult.headers['content-disposition'].split('\'')[1], 'GBK').toString();
      var appName = appNames.substring(0,appNames.lastIndexOf("\."))
      var requestBody = appResult.body;
      var appDir = 'G:\\javaCloud\\github\\macaca-test-sample\\app\\'+requestBody;
      console.log(requestBody);

      /**
        * 获取脚本文件信息，并且下载脚本文件
        */

      var scriptResult = yield REQUST.get({ url: scriptUrl+'.md5sum'});
      var scriptRequestBody = scriptResult.body;
      var scriptNames = scriptResult.headers['content-disposition'].split('\'')[1];
      var scriptName = scriptNames.substring(0,appNames.lastIndexOf("\."))
      console.log(scriptName);
      var scriptDir ='G:\\javaCloud\\github\\macaca-test-sample\\script\\'+scriptRequestBody;
      if (!fs.existsSync(scriptDir)) {
        _.mkdir(scriptDir);
        request('http://192.1.1.7:9090/demo/services/wsdevice/script/12').pipe(
              fs.createWriteStream(scriptDir+"\\"+scriptName)
            );

        attachment.attachmentScriptPath=scriptDir;
        attachment.attachmentScriptName=scriptName;
      }else{
        attachment.attachmentScriptPath=scriptDir;
        attachment.attachmentScriptName=scriptName;
      }
      attachment.projectId = project._id;
      if (!fs.existsSync(appDir)) {
        _.mkdir(appDir);
        request('http://192.1.1.7:9090/demo/services/wsdevice/app/17').pipe(
              fs.createWriteStream(appDir+"\\"+appName)
            );
        attachment.attachmentAppPath=appDir;
        attachment.attachmentAppName=appName;


        if(yield attachment.add()){
          this.body = {
            success: true,
            errorMsg: null,
            data: null
              };
          } else {
            this.body = {
            success: false,
            errorMsg: '提交任务失败',
            data: null
             };
          }
       }else{
         attachment.attachmentAppPath=appDir;
         attachment.attachmentAppName=appName;
         if(yield attachment.add()){
           this.body = {
             success: true,
             errorMsg: null,
             data: null
               };
           } else {
             this.body = {
             success: false,
             errorMsg: '提交任务失败',
             data: null
              };
           }
       }

    }).catch(function (err) {
          console.error(err);
      });

  this.body = {
      data:project._id
    };
  } else {
    this.body = {
      success: false,
      errorMsg: '提交任务失败',
      data: null
    };
  }
}
//任务取消
function *cancelTask(){
   this.body = {
      success: true,
      errorMsg: null,
      data: null
    };
}

function *dispatch() {
  switch (this.params.method) {
    case 'add':
      yield addTask.call(this);
      break;
    case 'cancel':
      yield cancelTask.call(this);
      break;

  }
}

module.exports = dispatch;
