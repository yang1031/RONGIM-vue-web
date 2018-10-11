import store from "../vuex/store";
var _this = this;
export default {
  RONGIMBreak() {  // 融云断开连接
    RongIMClient.getInstance().disconnect();
  },
  RongIMInit() { // 融云初始化
    RongIMClient.init('8w7jv4qb78a9y');  // 注册一个账号然后就有这个APPkey啦
    // 这个token呢，一般是登录之后后台返给你的
    RongIMClient.connect('4FGCL0oQ/E72nU4ivbui8uHR/ySxKaD1cAX2biXsYR6RsLYO9xAA4ooa+q3n42JnVTQyMAdFUiDsjFRDYZaQeg==', {
      onSuccess: function (userId) {
        console.log("Login successfully." + userId);
        store.commit('SET_CONNECTSTATUS', true);
        // userId是申请token时的填写的id，到时候可以封装在下面的extra中传过去
      },
      onTokenIncorrect: function () {
        console.log('token无效');
      },
      onError: function (errorCode) {
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
        console.log(info);
      }
    });
    // 连接状态监听器
    RongIMClient.setConnectionStatusListener({
      onChanged: function (status) {
        switch (status) {
          // 连接成功
          case RongIMLib.ConnectionStatus.CONNECTED:
            console.log('连接成功');
            break;
          // 正在连接
          case RongIMLib.ConnectionStatus.CONNECTING:
            console.log('正在连接');
            break;
          // 重新连接
          case RongIMLib.ConnectionStatus.DISCONNECTED:
            console.log('断开连接');
            break;
          // 其他设备登陆
          case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
            console.log('其他设备登陆');
            alert('该用户在其它浏览器登录,聊天功能暂不可用');
            break;
          // 网络不可用
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
        console.log('receive');
        // 判断发送过来的消息所在的群组，是不是你现在打开的这个群组，如果是的话就处理好了以后加入到vuex的RongIMmsg中
        // 然后聊天界面会监听RongIMmsg这个值，发现变化了就重新渲染聊天界面，顺便把对话框拉到底部
        if (message.targetId === store.state.currentGroup) {
          let newMsgArr = store.state.RongIMmsg;
          if (message.content.operation) {
            message['hintMessage'] = _this.a.converGroupNotifition(message.content);
            message['messageType'] = 1;
          } else {
            message.content.content = _this.a.TrimContentAndEmoji(message.content.content);
            message['userInfo'] = _this.a.converMemberNotifition(message, store.state.memberInfo);
            message['messageType'] = 2;
          }
          newMsgArr.push(message);
          store.commit('SET_RONGIM', newMsgArr);
          console.log(store.state.RongIMmsg)
        }
        // message接受到的消息（包含发送的信息，也可以在extra中添加要传递的值，如：时间等）

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
    RongIMLib.RongIMEmoji.init(config);
  },
  // 转换群组的信息
  converGroupNotifition (content) {
    let comment = '', members = '', contentData = JSON.parse(content.data);
    let loginUserId = 'user10';
    var isself = (content.operatorUserId === loginUserId ? true : false);
    switch (content.operation) {
      case "Add":
        if (isself) {
          comment = '你邀请' + contentData.targetUserDisplayNames.join('、') + "加入了群组";
        } else {
          comment = contentData.operatorNickname + '邀请' + contentData.targetUserDisplayNames.join('、') + "加入了群组";
        }
        members = contentData.targetUserIds;
        break;
      case "Quit":
        comment = contentData.targetUserDisplayNames.join('、') + "退出了群组";
        members = contentData.targetUserIds;
        break;
      case "Kicked":
        if (isself) {
          comment = '你将' + contentData.targetUserDisplayNames.join('、') + " 移出了群组";
        } else {
          comment = contentData.operatorNickname + '将' + contentData.targetUserDisplayNames.join('、') + " 移出了群组";
        }
        members = contentData.targetUserIds;
        break;
      case "Rename":
        if (isself) {
          comment = "你修改名称为" + contentData.targetGroupName;
          // + detail.data.data.targetGroupName;
        } else {
          comment = contentData.operatorNickname + "修改群名称为" + contentData.targetGroupName;
        }
        break;
      case "Create":
        if (isself) {
          comment = "你创建了群组";
        } else {
          comment = contentData.operatorNickname + "创建了群组";
        }
        break;
      case "Dismiss":
        comment = contentData.operatorNickname + "解散了群组";
        break;
      case "exMsg":
        comment = contentData.operatorNickname;
        break;
      default:
        comment = content.operation;
    }
    return comment;
  },
  // 转换用户的信息
  // data就是融云的消息，memberInfo就是当前群组的成员列表，判断出到底是谁发的
  converMemberNotifition(data, memberInfo) {
    let userInfo = {};
    memberInfo.every((val, idx, array) => {
      if (val.phone === data.senderUserId) {
        userInfo['name'] = val.name;
        userInfo['headUrl'] = val.headUrl;
        return false;
      }
      return true;
    });
    return userInfo;
  },
  // 将聊天内容换行以及表情进行转换
  TrimContentAndEmoji(str) {  // str表示要转换的字符串
    let newStr = str || '';
    let content = newStr.replace(/\n|\r\n/g, "<br/>");
    content = RongIMLib.RongIMEmoji.emojiToHTML(content);
    return content;
  },
}
