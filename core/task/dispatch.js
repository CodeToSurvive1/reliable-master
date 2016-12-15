'use strict';

const co = require('co');
const cluster = require('cluster');

const Slave = require('../slave');
const models = require('../../common/models');
const _ = require('../../common/utils/helper');
const logger = require('../../common/utils/logger');
const options = require('../../common/config').get();
let REQUST = require("co-request");

const Task = models.Task;
const Project = models.Project;
const Device = models.Device;
const Attachment = models.Attachment;

module.exports = co.wrap(function* () {
  const task = new Task();
  const taskData = yield task.getExpectedOne();

  if (!taskData) {
    logger.debug('no queue');
    return;
  }

  const project = new Project();
  const projectData = yield project.getById(taskData.projectId);


  const attachment = new Attachment();
  const attachmentData = yield  attachment.getByProjectId(taskData.projectId);
  console.log("****************************************");
  console.log(attachmentData);
  if (!projectData) {
    logger.debug('no projectData');
    return;
  }

  let body = projectData.repositoryUrl;

  body += `#${projectData.repositoryBranch}`;
  body += `#${projectData.environment}`;

  process.send({
    message: 'dispatchTask',
    data: {
      body: body,
      taskId: taskData._id,
      type: 'task',
      serialNumber: projectData.serialNumber,
      runiOS: projectData.runiOS,
      attachmentId:attachmentData._id
    }
  });
});

/**
 * 通知业务系统任务开始
 */
function* jobstart(projectId) {
  //
  // var result = request({
  //   uri: 'http://192.1.1.7:9090/demo/services/wsdevice/status/' + projectId,
  //   method: 'get'
  // });

  co(function* () {
      var result = yield REQUST.get({ url:  'http://192.1.1.7:9090/demo/services/wsdevice/status/' + projectId+"?status=running"});
      result = yield JSON.parse(result.body);
      console.log("*********************");
      console.log(result);
      return result;

  }).catch(function (err) {
        console.error(err);
    });

}

module.exports.success = co.wrap(function* (data, slave) {
  const task = new Task();
  yield task.updateById(data.taskId, {
    status: 1,
    slaveId: slave.sysInfo.hostname,
    start_at: Date.now()
  });

  //如果存在序列号，则是由业务系统发起的任务
  if (data.serialNumber) {

    //添加device锁定操作,3->使用中
    const device = new Device();
    yield device.updateBySerialNumber(data.serialNumber, {
      status: global.DEVICE_STATUS.USING
    });

    //通知业务系统任务开始
    var thisTaskData = yield task.getById(data.taskId);
    try {
      yield jobstart(thisTaskData.projectId);
    } catch (ex) {
      console.log('通知业务系统task开始运行报错', data.taskId);
    }
  }


});
