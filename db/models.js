const md5 = require("blueimp-md5");
//1、连接数据库
//1.1 引入mongoose
const mongoose = require("mongoose");
//1.2 连接指定数据库（url只有数据库是变化的）
mongoose.connect("mongodb://localhost:27017/tfboys");
//1.3 获取连接对象
const conn = mongoose.connection;
//console.log(conn);
//1.4 绑定连接完成的监听（用来提示连接成功）
conn.on("connected", function () {
  console.log("数据库连接成功");
});
//2、得到特定集合的model
//2.1 字义Schema（描述文档结构）
const userSchema = mongoose.Schema({
  username: { type: String, required: true }, //用户名
  password: { type: String, required: true }, //密码
  type: { type: String, required: true }, //用户类型
  header: { type: String }, //头像名称
  post: { type: String }, //职位
  info: { type: String }, //个人简介
  company: { type: String }, //公司名称
  salary: { type: String }, //工资
});
//2.2 定义Model（与集合对应，可以操作集合）
const UserModel = mongoose.model("User", userSchema);
exports.UserModel = UserModel;
const chatSchema = mongoose.Schema({
  from:{type:String,require:true},//发送用户的id
  to:{type:String,require:true},//接收用户的id
  chat_id:{type:String,require:true},//from和to组成的字符串
  content:{type:String,require:true},//内容
  read:{type:Boolean,default:false},//标识是否已读
  create_time:{type:Number}//创建时间
})
const ChatModel = mongoose.model("Chat",chatSchema)
exports.ChatModel = ChatModel
