## 一、演示
- 地址：[http://139.9.133.4/](http://139.9.133.4/)
- 后台：[http://139.9.133.4//admin](http://139.9.133.4//admin)
- 账号：1009373481@qq.com
- 密码：100861

## 二、安装

```bash
$ npm install --production
$ npm start
```
完成后访问 http://localhost:3000/admin/install 进入安装程序

### 1、环境要求

1. [Node.js](https://www.nodejs.org) v8.9.0 及以上
2. [Mongodb](https://www.mongodb.org) v4.0.0 及以上

   ```js
   //有以下错误警告，可以使用3.6以下版本避免该警告信息
   Db.prototype.authenticate method will no longer be available in the next major release 3.x as MongoDB 3.6 will only allow auth against users in the admin db and will no longer allow multiple credentials on a socket. Please authenticate using MongoClient.connect with auth credentials
   ```
3. [Mongoose](https://www.mongoosejs.net) v4.11.0 及以上

   ```js
   var db = mongoose.createConnection(host,db,port,[opt],fn);
      
   //4.11以下版本使用以下方法，4.11以及以上版本也可以使用该方法，但是会报以下警告
   //open() is deprecated in mongoose >= 4.11.0, use openUri() instead, or set the    //useMongoClient option if using connect() or createConnection()
   db.open(参数同createConnection);
   
   //4.11以及以上版本，应该使用一下方法，但是会报：callback is not a function错误
   db.openUri(参数同createConnection); 
   
   //完美解决方案，不使用open和openUri连接数据库，直接使用createConnection传参的形式进行连接
   ```

或者可以试试Mongodb v3.6 搭配 Mongoose v4.4

### 2、重新安装

1. 清空数据库
2. 删除 /install.lock
3. 访问 http://localhost:3000/admin/install 进入安装程序

## 三、常见问题
### 1、Nginx来反向代理edaCMS

Nginx ("engine x") 是一个高性能的HTTP和反向代理服务器，也是一个IMAP/POP3/SMTP服务器。Nginx是由Igor Sysoev为俄罗斯访问量第二的Rambler.ru站点开发的，第一个公开版本0.1.0发布于2004年10月4日。其将源代码以类BSD许可证的形式发布，因它的稳定性、丰富的功能集、示例配置文件和低系统资源的消耗而闻名

**1）进入 Nginx 配置目录**

```
$ cd /etc/nginx/conf.d
```

注：此为 Centos 的默认配置目录，不同平台默认目录可能不同

**2） 新建 nginx 配置文件并保存，如下所示：**

```
server {
    listen 80;
    server_name www.edaCMS.com;
    location / {
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://localhost:3002;
    }
}
```

保存为 /etc/nginx/conf.d/my-edaCMS.conf

**3）重启 nginx**

### 2、pm2来守护edaCMS

pm2 是一个带有负载均衡功能的Node应用的进程管理器，使用 pm2 可以帮助你守护和监控 edaCMS正常运行

**1）主要特性**

- 内建负载均衡（使用 Node cluster 集群模块）
- 后台运行
- 0 秒停机重载
- 具有 Ubuntu 和 CentOS 的启动脚本
- 停止不稳定的进程（避免无限循环）
- 控制台检测
- 提供 HTTP API
- 远程控制和实时的接口 API ( Nodejs 模块，允许和 PM2 进程管理器交互 )

**2）安装**

```
npm install -g pm2
```

**3）简单示例**

进入 edaCMS 的目录执行以下语句

```
pm2 start bin/www -n my-edaCMS
```

**4）常用命令**

**指定 node 版本启动**

```
pm2 start bin/www -n my-edaCMS --interpreter `/node-6.0.0`
```

其中`/node-6.0.0`为你的 node 目录

**通过 n 来指定 node 版本启动**

```
pm2 start bin/www -n my-edaCMS --interpreter `n bin 5.10.1`
```

**指定 edaCMS 端口号**

```
pm2 start bin/www -n my-edaCMS --interpreter `n bin 5.10.1` -- -p 3001
```

**查看托管列表**

```
pm2 list
```

**重启**

```
pm2 restart my-edaCMS
```

或

```
pm2 restart all
```

**其他命令**

```
pm2 --help
```

### 3、推荐调用使用说明