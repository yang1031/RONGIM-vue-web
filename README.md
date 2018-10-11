# 刚开始接触这一块内容，发现vue接融云还是搜不到很具体的案例，靠自己一点点摸索花费了一些时间
终于完成了一些基本的功能就写了一个demo，希望能够帮助到一些人(虽然我也不确定会不会有人看到这个，哈哈哈)
对啦，我这边只写了一些概念的东西哦，因为这个群聊啊涉及到的APPkey和token都是官网提供的，结果不能用
我也不能用公司的那些信息吧，这边demo里的代码注释已经尽量写得很清楚，如果有问题请加我q 553661679


### index.js

``` html
 <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>rongyun-web</title>
    <script src="https://cdn.ronghub.com/RongIMLib-2.3.3.min.js"></script>
    <script src="https://cdn.ronghub.com/RongEmoji-2.2.7.min.js"></script>
  </head>
```
#### 一定要在头部引入SDK，第二个是表情包

### 融云初始化

#### 建议在公共方法里加入这个方法，可以多次调用

``` html
  RONGIMBreak() {  // 融云断开连接
    RongIMClient.getInstance().disconnect();
  },
   RongIMInit() { // 融云初始化
      RongIMClient.init(Appkey);
      var token = JSON.parse(gaijinCounselor).token.data;
      RongIMClient.connect(token, {
        onSuccess: function(userId) {
          console.log("Login successfully."+ userId);
          //userId是申请token时的填写的id，到时候可以封装在下面的extra中传过去
        },
        onTokenIncorrect: function() {
          console.log('token无效');
        },
        onError:function(errorCode){
          var info = '';
          switch (errorCode) {
            case RongIMLib.ErrorCode.TIMEOUT:
              info = '超时';
              break;
            case RongIMLib.ErrorCode.UNKNOWN_ERROR:
              info = '未知错误';
              break;
            case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
              info = '不可接受的协议版本';
              break;
            case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
              info = 'appkey不正确';
              break;
            case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
              info = '服务器不可用';
              break;
          }
          console.log(errorCode);
        }
      });
      // 连接状态监听器
      RongIMClient.setConnectionStatusListener({
        onChanged: function (status) {
          switch (status) {
            //链接成功
            case RongIMLib.ConnectionStatus.CONNECTED:
              console.log('连接成功');
              break;
            //正在链接
            case RongIMLib.ConnectionStatus.CONNECTING:
              console.log('正在连接');
              break;
            //重新链接
            case RongIMLib.ConnectionStatus.DISCONNECTED:
              console.log('断开连接');
              break;
            //其他设备登陆
            case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
              console.log('其他设备登陆');
              alert('该用户在其它浏览器登录,聊天功能暂不可用');
              break;
            //网络不可用
            case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
              console.log('网络不可用');
              break;
          }
        }
      });
      // 消息监听器
      RongIMClient.setOnReceiveMessageListener({
        // 接收到的消息
        onReceived: function (message) {
          //message接受到的消息（包含发送的信息，也可以在extra中添加要传递的值，如：时间等）

          // 自定义消息
          // do something...
        }

      });
      var config = {
        size: 24, // 大小, 默认 24, 建议18 - 58
        url: "//f2e.cn.ronghub.com/sdk/emoji-48.png", // Emoji 背景图片
        lang: "zh", // Emoji 对应名称语言, 默认 zh
        // 扩展表情
        extension: {
          dataSource: {
            u1F914: {
              en: "thinking face", // 英文名称
              zh: "思考", // 中文名称
              tag: "🤔", // 原生 Emoji
              position: "0 0" // 所在背景图位置坐标
            }
          },
          // 新增 Emoji 背景图 url
          url: "//cdn.ronghub.com/thinking-face.png"
        }
      };
      RongIMLib.RongIMEmoji.init(config);  // 表情初始化
    },
```

#### 初始化完成了以后才可以进行比如获取历史消息，发送等操作，一定要确保这个执行顺序，不然会报错的

### 我能想的到的一些注意点

- web端的聊天界面需要自己绘制的，没有现成的!
- 消息都需要处理过，写几个公共方法来处理消息格式
- 群成员信息(昵称，头像等)不会在消息里，通过后台拿了以后，在处理消息的时候判断这个消息是谁发的，然后把成员信息给加进去
- 图片，文件，语音啊这些资源，都需要上传到服务器生成链接，然后才能通过融云发送，图片要压缩哦，不然最多100k根本不够用(不会的可以下载代码看一下，我有写在项目里)
- 页面刷新就需要重新链接，注意执行顺序
- 我用了vuex，因为当监听到你所在的聊天有消息进入时，页面需要及时做出反应。
- 消息要滚动到底部这个功能也要自己写哦
- qq: 553661679，如果有可以优化的地方十分欢迎来一起交流，谢谢
