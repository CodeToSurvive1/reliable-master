'use strict';

const co = require('co');
const cluster = require('cluster');

const Slave = require('../slave');
const models = require('../../common/models');
const _ = require('../../common/utils/helper');
const logger = require('../../common/utils/logger');
const options = require('../../common/config').get();

const Task = models.Task;
const Project = models.Project;
const Device = models.Device;


module.exports = co.wrap(function* () {
  const task = new Task();
  const taskData = yield task.getExpectedOne();

  if (!taskData) {
    logger.debug('no queue');
    return;
  }

  const project = new Project();
  const projectData = yield project.getById(taskData.projectId);

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
      runiOS: projectData.runiOS
    }
  });
});

/**
 * 通知业务系统任务开始
 */
function* jobstart(taskId) {

  var result = yield request({
    uri: options.businessUrls.jobstart + taskId,
    method: 'get'
  });

  try {
    result = JSON.parse(result.body);
    return result;
  } catch (e) {
    return false;
  }
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
    try {
      yield jobstart(data.taskId);
    } catch (ex) {
      console.log('通知业务系统task开始运行报错', data.taskId);
    }
  }


});
