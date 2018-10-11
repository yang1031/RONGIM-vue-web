<template>
  <div v-loading="loading">
    <div class="head">
      <img class="head-img" v-if="userInfo&&userInfo.headUrl" :src="userInfo.headUrl" alt="">
      <img v-else class="head-img" src="../assets/img/head_img_default.png" alt="">
      {{userInfo.name}}同学
    </div>
    <div class="chat">
      <div class="chat-container">
        <div class="chat-record" id="chat-record">
          <div class="history-btn">
            <span v-if="hasHistory" @click="getHistoryMsg($store.state.RongIMmsg[0].sentTime)">查看更多历史记录</span>
          </div>
          <div v-for="item in $store.state.RongIMmsg">
            <div class="hint" v-if="item.messageType === 1">{{item.hintMessage}}</div>
            <div class="chat-item" v-if="item.messageType === 2" :class="item.messageDirection===1?'self-msg':''">
              <img class="head-img" v-if="item.userInfo&&item.userInfo.headUrl" :src="item.userInfo.headUrl" alt="">
              <img class="head-img" v-else src="../assets/img/head_img_default.png" alt="">
              <div class="content">
                <div class="nickName">{{item.userInfo.name}}</div>
                <div class="chat-content" v-if="item.content.messageName === 'TextMessage'" v-html="item.content.content"></div>
                <img v-else-if="item.content.messageName === 'ImageMessage'" :src="item.content.imageUri" @click="picPreview(item.content.imageUri)">
                <a v-else class="chat-file" :href="item.content.fileUrl" :title="item.content.name" target="_blank" download>
                  <i class="icon icon-file"></i>
                  <div class="file-info">
                    <div>{{$com.cutstr(item.content.name, 20)}}</div>
                    <div>{{item.content.size}}</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <div class="operate-line">
            <div class="MessageForm-tool" id="expressionWrap">
              <i class="icon icon-expression" @click="controlEmoji"></i>
              <div class="expressionWrap" v-show="emojiShow">
                <i class="arrow"></i>
                <div class="emoji-item" v-for="(item,index) in emojiLit" :key="index" v-html="item.node.outerHTML" @click="checkedEmoji(item.symbol)"></div>
              </div>
            </div>
            <div class="MessageForm-tool">
              <i class="icon icon-picture" @click="triggerFile('filePic')"></i>
              <input type="file" name="pic" class="inputfile" accept="image/*" ref="filePic" @change="chooseImg">
            </div>
            <div class="MessageForm-tool">
              <i class="icon icon-file" @click="triggerFile('file')"></i>
              <input type="file" name="pic" class="inputfile" ref="file" @change="chooseFile">
            </div>
            <div class="MessageForm-tool">
              <i class="icon icon-add"></i>
            </div>
          </div>
          <div class="import">
            <el-input
              v-model="content"
              type="textarea"
              :rows="4"
              resize="none"
              placeholder="请输入内容">
            </el-input>
            <el-button size="small" type="primary" @click="sendTextMsg">发送</el-button>
          </div>
        </div>
      </div>
    </div>

    <!--&lt;!&ndash; 图片预览 &ndash;&gt;-->
    <!--<el-dialog title="图片预览" :visible.sync="previewData.flag" width="600px">-->
      <!--<div class="preview-content" style="padding: 10px;">-->
        <!--<img :src="previewData.url" alt="">-->
      <!--</div>-->
    <!--</el-dialog>-->
  </div>
</template>

<script>
export default {
  name: 'chat',
  data () {
    return {
      loading: true,
      groupId: 'chatRoomId-008',
      loginUserId: 'user10',
      hasHistory: true,
      memberInfo: [
        {
          name: '杨洋洋',
          phone: 'user10',
          headUrl: 'http://p4yg64rq2.bkt.clouddn.com//1993b42c208e1f3536fa21d0b13294f7?imageView2/0/w/1080/format/jpg'
        },
        {
          name: '咩咩咩',
          phone: '12345678911',
          headUrl: 'http://p4yg64rq2.bkt.clouddn.com/Finpmo_R1nheIgOTzH6SGRIGJdW3'
        }
      ],
      userInfo: {
        name: '杨洋洋',
        phone: 'user10',
        headUrl: 'http://p4yg64rq2.bkt.clouddn.com//1993b42c208e1f3536fa21d0b13294f7?imageView2/0/w/1080/format/jpg'
      },
      emojiShow: false,
      chatRecords: [],
      emojiLit: [],
      content: ''
    }
  },
  watch: {
    getRongIM (curval, oldval) { // 监听computed中getRongIM的值
      // setTimeout(() => {
        // this.scollBottom();
      // },0)
    },
    getConnectStatus (curval, oldval) { // 监听computed中getConnectStatus的值
      console.log(curval)
      if (curval) {
        this.dataInit()
      }
    }
  },
  computed: {
    getRongIM () {
      return this.$store.state.RongIMmsg
    },
    getConnectStatus () {
      return this.$store.state.connectStatus
    }
  },
  created () {
    console.log(this.$store.state.connectStatus)
    if (this.$store.state.connectStatus) { // 如果已经连接
      this.dataInit()
    }
  },
  methods: {
    async dataInit () { // 数据初始化
      // 先获取一下目标聊天室的Id 我这边就直接固定咯  groupId
      // 再获取一下群成员的信息，我这边也固定写啦  memberInfo
      // 还有一个是当前的用户id，这个id是融云那边的id哦，需要跟融云那边消息进行比对看是不是自己发的
      // 这个用户id呢也是最好在登录的时候，和融云的token一起让后台给过来 loginUserId
      // 最后呢遍历一下群成员信息，把自己的信息提取出来 userInfo
      const _this = this;
      this.$store.commit('SET_GROUP', this.groupId); // 存好id
      this.$store.commit('SET_MEMBER', this.memberInfo); // 存好用户信息
      await this.getHistoryMsg(); // 获取历史消息
      this.loading = false;
      document.addEventListener('click', function (e) { // 监听页面的点击事件，为了关闭表情的那个弹窗
        if (document.getElementById('expressionWrap') && !!document.getElementById('expressionWrap').contains(e.target)) return;
        _this.emojiShow = false;
      });
      // 最后把聊天框拉到底部，就是显示最新的那条
      this.scollBottom();
    },
    // 获取历史消息  我这边是获取群聊的 第一个参数:
    // RongIMLib.ConversationType.GROUP 是群聊
    // RongIMLib.ConversationType.PRIVATE 是单独的
    // 第二个参数就是群id， 第三个参数是从哪个时间点获取历史消息， 第四个参数是获取历史消息的条数
    // 一次性最多获取20条哦
    getHistoryMsg(time) {
      let _this = this;
      let recordTime = time || 0;
      return new Promise((resolve, reject) => {
        RongIMClient.getInstance().getHistoryMessages(RongIMLib.ConversationType.GROUP, _this.groupId, recordTime, 20, {
          onSuccess: function (list, hasMsg) {
            // 如果获取到的是20条，那么就说明消息没有被拉取完，还有历史消息
            if (list.length !== 20) {
              _this.hasHistory = false;
            }
            let chatList = [];
            if (list.length) {
              list.every((val, idx, array) => {
                if (val.content.operation) {  // 如果有操作者，说明是一条操作消息
                  val['hintMessage'] = _this.$com.converGroupNotifition(val.content);
                  val['messageType'] = 1; // 操作消息
                } else {
                  if (val.content.messageName === 'TextMessage') { // 文字内容
                    val.content.content = _this.$com.TrimContentAndEmoji(val.content.content);
                  }
                  // 添加这个发送者的信息
                  val['userInfo'] = _this.$com.converMemberNotifition(val, _this.$store.state.memberInfo);
                  val['messageType'] = 2; // 聊天消息
                }
                chatList.push(val);
                return true;
              });
            }
            if (recordTime) { // 历史消息要添加到消息的前面
              _this.chatRecords.unshift(...chatList);
            } else {
              _this.chatRecords.push(...chatList);
            }
            console.log(_this.chatRecords)
            _this.$store.commit('SET_RONGIM', _this.chatRecords);
            resolve()
            // hasMsg为boolean值，如果为true则表示还有剩余历史消息可拉取，为false的话表示没有剩余历史消息可供拉取。
            // list 为拉取到的历史消息列表
          },
          onError: function(error) {
            // APP未开启消息漫游或处理异常
            // throw new ERROR ......
          }
        });
      })
    },
    sendTextMsg() { // 发送消息
      let msg = new RongIMLib.TextMessage({content: RongIMLib.RongIMEmoji.symbolToEmoji(this.content)});
      this.sendMsg(msg);
    },
    sendMsg(msg) { // 发送消息
      let _this = this;
      var conversationtype = RongIMLib.ConversationType.GROUP;
      RongIMClient.getInstance().sendMessage(conversationtype, this.groupId, msg, {
        onSuccess: function (message) { // message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
          let content = JSON.parse(JSON.stringify(message.content));
          // 消息发送成功啦需要自己手动把这个消息插入到聊天记录中去,那这个格式就自己定义好
          let sendData = {
            content: '',
            messageDirection: 1,
            messageType: 2,
            userInfo: _this.userInfo
          };
          sendData.content = content;
          if (content.messageName === 'TextMessage') {
            sendData.content['content'] = RongIMLib.RongIMEmoji.emojiToHTML(content.content);
          }
          _this.content = '';
          _this.chatRecords.push(sendData);
        },
        onError: function (errorCode,message) {
          var info = '';
          switch (errorCode) {
            case RongIMLib.ErrorCode.TIMEOUT:
              info = '超时';
              break;
            case RongIMLib.ErrorCode.UNKNOWN_ERROR:
              info = '未知错误';
              break;
            case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
              info = '在黑名单中，无法向对方发送消息';
              break;
            case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
              info = '不在讨论组中';
              break;
            case RongIMLib.ErrorCode.NOT_IN_GROUP:
              info = '不在群组中';
              break;
            case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
              info = '不在聊天室中';
              break;
            default :
              info = 'x';
              break;
          }
          console.log('发送失败:' + info);
        }
      })
    },
    scollBottom () { // 使聊天框滑到最底部
      // 像发送图片这些，图片渲染需要一点时间，所以要用setTimeout
      let div = document.getElementById('chat-record');
      setTimeout(function() {
        div.scrollTop = div.scrollHeight;
      }, 100)
    },
    controlEmoji() {
      this.emojiShow = !this.emojiShow;
    },
    checkedEmoji(symbol) { // 选中emoji表情
      this.content += symbol;
      this.emojiShow = false;
    },
    triggerFile(ref) {
      this.$refs[ref].click();
    },
    chooseImg() { // 选中图片后的回调
      let picFiles = this.$refs.filePic.files;
      if ((picFiles[0].size)/1024/1024 > 2) {
        this.$message.error('图片大小不能超过2M');
        return;
      }
      this.uploadFile(picFiles[0], 'img');
    },
    chooseFile() {
      let files = this.$refs.file.files;
      this.uploadFile(files[0], 'file');
    },
    uploadFile(file, fileType) {  // 上传文件或者图片
      let _this = this;
      let param = new FormData();
      param.append('file',file);
      if (fileType === 'img') { // 如果上传类型为图片，需要base64的格式
        let reader = new FileReader();
        var imgUrlBase64 = reader.readAsDataURL(file);
        var base64;
        reader.onload = function (e) {
          base64 = _this.canvasDataURL(reader.result);
        };
      }
      // 省略了一下上传图片或者文件的方法，这个自己写哦
      // 然后在上传后的回调中获取到url，再写下面的方法
      if (fileType === 'img') {
        const src = 'http://p4yg64rq2.bkt.clouddn.com//1993b42c208e1f3536fa21d0b13294f7?imageView2/0/w/1080/format/jpg';
        let msg = new RongIMLib.ImageMessage({"content":base64, "imageUri": src, "extra":""});
        _this.sendMsg(msg);
      } else {
        const src = 'http://p4yg64rq2.bkt.clouddn.com/FrZDap35ARjMq2M2hwXcC8tyEI4p';
        const suffix = file.name.split('.').splice(-1)[0];
        let fileContent = {
          name: file.name, // 文件名称
          size: (file.size / 1024).toFixed(1) + 'kB', // 文件大小
          type: suffix,
          fileUrl: src
        };
        let msg = new RongIMLib.FileMessage(fileContent);
        _this.sendMsg(msg);
      }
    },
    // 压缩图片
    canvasDataURL(base64) {
      let img = new Image();
      img.src = base64;
      img.onload = function(){
        let quality = 0.7; // 压缩比例
        var that = this;
        // 默认按比例压缩
        var w = that.width,
          h = that.height,
          scale = w / h;
        w = quality.width || w;
        h = quality.height || (w / scale);
        // 生成canvas
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        // 创建属性节点
        var anw = document.createAttribute("width");
        anw.nodeValue = w;
        var anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // quality值越小，所绘制出的图像越模糊
        var base64 = canvas.toDataURL('image/jpeg', quality);
        // 回调函数返回base64的值
        return base64;
      }
    },
    // 图片预览
    picPreview(url) {
      this.previewData.url = url;
      this.previewData.flag = true;
    }
  }
}
</script>

<style lang="less">
  .head {
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #edeff0;
    .head-img {
      margin-right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 100%;
    }
  }
  .chat {
    margin-top: 20px;
  }
  @-moz-document url-prefix() {
    .chat-record div:last-child{
      margin-bottom: 20px;
    }
  }
  .chat-container {
    display: inline-block;
    width: 70%;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    .chat-record {
      padding: 0 20px 20px;
      height: 450px;
      background: #F9FBFD;
      border: 1px solid #edeff0;
      overflow: auto;
      .history-btn {
        margin: 10px 0;
        text-align: center;
      }
      .chat-item {
        margin-top: 20px;
      }
      .hint {
        margin: 20px 0;
        text-align: center;
        color: #aaa;
      }
      .head-img {
        float: left;
        width: 50px;
        border-radius: 5px;
      }
      .content {
        margin-left: 60px;
        img {
          margin-top: 10px;
          max-width: 200px;
        }
        .nickName {
          color: #aaa;
        }
        .chat-content {
          margin-top: 10px;
          font-size: 16px;
        }
        .chat-file {
          margin-top: 10px;
          display: inline-block;
          width: 250px;
          background: #E0E0E0;
          border-radius: 5px;
          text-align: left;
          .file-info {
            margin: 10px 0 0 55px;
            div {
              line-height: 20px;
            }
          }
          .icon-file {
            margin: 10px;
            float: left;
            width: 40px;
            height: 40px;
            background: url('../assets/img/file.png') no-repeat;
            background-size: 100% 100%;
          }
        }
      }
      .self-msg {
        min-height: 50px;
        text-align: right;
        .content {
          margin-right: 60px;
        }
        .head-img {
          float: right;
        }
      }
    }
    .chat-input {
      margin-top: 20px;
      height: 200px;
      border: 1px solid #edeff0;
    }
    .operate-line {
      padding: 20px 0 5px 20px;
      .MessageForm-tool {
        position: relative;
        display: inline-block;
        margin-left: 10px;
        .expressionWrap {
          position: absolute;
          left: -5px;
          bottom: 30px;
          width: 405px;
          border: 1px solid #D9DADC;
          margin: 6px 15px;
          padding: 5px 8px;
          background: #fff;
          z-index: 1100;
          .arrow {
            position: absolute;
            left: 5px;
            bottom: -9px;
            display: inline-block;
            width: 10px;
            height: 9px;
            background: url('../assets/img/arrow.png');
          }
          .emoji-item {
            padding: 4px 4px 0;
            display: inline-block;
            border-radius: 4px;
          }
          .emoji-item:hover {
            background: #EEE;
          }
        }
        .inputfile {
          display: none;
        }
      }
      .icon {
        display: inline-block;
        margin: 0 10px;
        width: 25px;
        height: 25px;
        vertical-align: middle;
        cursor: pointer;
      }
      .icon-expression {
        background: url('../assets/img/expression.png') no-repeat;
        background-size: 100% 100%;
      }
      .icon-expression:hover {
        background: url('../assets/img/expression-hover.png') no-repeat;
        background-size: 100% 100%;
      }
      .icon-picture {
        background: url('../assets/img/picture.png') no-repeat;
        background-size: 100% 100%;
      }
      .icon-picture:hover {
        background: url('../assets/img/picture-hover.png') no-repeat;
        background-size: 100% 100%;
      }
      .icon-file {
        background: url('../assets/img/file.png') no-repeat;
        background-size: 100% 100%;
      }
      .icon-file:hover {
        background: url('../assets/img/file-hover.png') no-repeat;
        background-size: 100% 100%;
      }
      .icon-add {
        background: url('../assets/img/user-add.png') no-repeat;
        background-size: 100% 100%;
      }
      .icon-add:hover {
        background: url('../assets/img/user-add-hover.png') no-repeat;
        background-size: 100% 100%;
      }
    }
    .import {
      position: relative;
      margin-top: 10px;
      padding: 0 150px 0 20px;
      button {
        position: absolute;
        right: 80px;
        bottom: 0;
      }
    }
  }
  .text-center {
    text-align: center;
  }
  .dialog-container {
    height: 400px;
    overflow-y: scroll;
  }
  .preview-content {
    padding: 10px;
    text-align: center;
  }
</style>
