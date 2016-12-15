'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const _ = require('./utils/helper');

const mongo = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost';
const defaultCfg = {
  server: {
    worker: os.cpus().length,
    port: 8080,
    protocol: 'http'
  },
  database: `mongodb://${mongo}/reliable`,
  businessUrls:{
    // 任务结束返回打包结果接口
    jobresult:'http://localhost:3333/api/matc/test',
    //任务开始通知修改业务系统状态接口
    jobstart:'http://localhost:3333/',
  },
  site: {
    title: 'Reliable',
    baseurl: 'http://mac.cn:3333',
    locale: 'zh-CN',
    docurl: 'https://macacajs.github.io/macaca',
    issueurl: 'https://github.com/reliablejs/reliable-master',
    login: true
  },
  auth: {
    github: {
      client_id: '8bb3d4f7fa7d3d346a58',
      client_secret: '416bdc362cefb378587aa75c1db9bdd4c84a3461'
    },
    gitlab: {
      protocol: 'http',
      server_url: '127.0.0.1:3000',
      client_id: '8bb3d4f7fa7d3d346a58',
      client_secret: '416bdc362cefb378587aa75c1db9bdd4c84a3461'
    }
  },
  mail: {
    name: '李小蛟',
    port: 465,
    host: 'smtp.163.com',
    secure: true,
    ignoreTLS: true,
    auth: {
      user: 'lixiaojiao_hit@163.com',
      pass: '111'
    },
    sloganImage: 'https://avatars0.githubusercontent.com/u/9263042?v=3&s=200'
  },
  plugins: {
    'reliable-plugin-dingtalk': false,
    'reliable-plugin-slack':false
  },
  pluginTextPrefix: 'reliable-plugin'
};

var config = null;

exports.get = function() {
  if (config) {
    return config;
  }

  var rootPath = path.join(__dirname, '..');
  var list = fs.readdirSync(rootPath);

  list.forEach(item => {
    if (path.extname(item) === '.js' && !!~item.indexOf('.reliable.config.js')) {
      var mod = path.join(rootPath, item);
      config = _.merge({}, defaultCfg, require(mod));
    }
  });

  return config || defaultCfg;
};
