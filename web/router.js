'use strict';

const auth = require('./middlewares/auth');
const controllers = require('./controllers');
const service = require('./middlewares/service');
const logger = require('../common/utils/logger');
var koaBody = require('koa-body')();
var bodyParse =require('koa-better-body');  


module.exports = function(app) {
  app.get('/', controllers.home);
  app.get('/signup', controllers.signup);
  app.get('/login', controllers.login);
  app.get('/password/retake', controllers.password);
  app.get('/password/reset', controllers.password);
  app.get('/task/:taskId', auth.user, controllers.task);
  app.get('/history/:projectId', auth.user, controllers.history);
  app.get('/history/:projectId/page/:pageNo', auth.user, controllers.history);
  app.get('/dashboard', auth.user, controllers.dashboard);
  app.get('/dashboard/page/:pageNo', auth.user, controllers.dashboard);
  app.get('/dashboard/:catalog', auth.user, controllers.dashboard);
  app.get('/dashboard/:catalog/page/:pageNo', auth.user, controllers.dashboard);
  app.post('/dashboard/:catalog', auth.user, controllers.dashboard);
  app.get('/auth/:catalog', controllers.auth);
  app.get('/auth/:catalog/callback', controllers.auth);
  app.get('/badgeboard', controllers.badgeboard);
  app.get('/badgeboard/:projectId', controllers.badgeboard);
  app.get('/badgeboard/page/:pageNo', controllers.badgeboard);

  // service
  app.all('/api/login', controllers.api.login);
  app.all('/api/logout', controllers.api.logout);
  app.post('/api/signup', controllers.api.signup);
  app.post('/api/auth', controllers.api.auth);
  app.post('/api/password/:method', controllers.api.password);
  app.post('/api/user/:method', auth.user, controllers.api.user);

  app.post('/api/project/:method', auth.user, controllers.api.project);
  app.post('/api/task/:method', auth.user, controllers.api.task);
  app.post('/api/task/:method/gitlab-push.json', service.gitlabCi, controllers.api.task);

  app.get('/api/data', auth.user, controllers.api.data);


  //matc
  app.get('/api/matc/devices/:method', controllers.api.matc.devices);
  app.post('/api/matc/jobs/:method',koaBody, controllers.api.matc.job);
  app.post('/api/matc/result',bodyParse({multipart:true}), controllers.api.matc.result);
  app.post('/api/matc/test',bodyParse({multipart:true}), controllers.api.matc.test);

  //app/script/aaa
  app.get('/getAttachments/:method/:attachmentId',koaBody,controllers.api.matc.attachments);

  logger.debug('router set');
};
