// 引入md5加密函数库
const md5 = require("blueimp-md5");
// 引入UserModel
const models = require("../db/models");
const UserModel = models.UserModel
const ChatModel = models.ChatModel
const filter = { password: 0 }; //查询时过滤出指定的属性
var express = require("express");
var router = express.Router();
//注册路由
router.post("/register", async (req, res) => {
  // 1、获取参数数据（username，password，type）
  const { username, password, type } = req.body;
  //2、 处理数据
  //3、返回响应数据
  //2.1、根据username查询数据库判断是否存在
  await UserModel.findOne({ username }, async (err, user) => {
    //3.1 如果存在返回提示响应数据，用户已存在
    if (user) {
      res.send({ code: 1, msg: "此用户已存在" });
    } else {
      //2.2 如果不存在保存早数据库中
      await new UserModel({ username, password: md5(password), type }).save(
        function (err, user) {
          //生成一个cookie（userId：user._id) 并交给浏览器保存
          res.cookie("userId", user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 });
          //持久化保存在本地
          //3.2 保存成功，返回响应数据：user
          res.send({ code: 0, data: { _id: user._id, username, type } }); //返回数据中不要携带pwd
          //res.send({code:0,data:{username,type}})//返回数据中不要携带pwd
        }
      );
    }
  });
});
//登录路由
router.post("/login", async (req, res) => {
  //1. 获取请求参数（username，password）
  const { username, password } = req.body;
  //2. 处理数据：根据username和password去数据库查询得到user
  await UserModel.findOne(
    { username, password: md5(password) },
    filter,
    function (err, user) {
      //3. 返回响应数据
      //3.1 如果user没有值。返回一个错误的提示：用户名或密码错误
      if (!user) {
        res.send({ code: 1, msg: "用户名或密码错误" });
      } else {
        //生成一个cookie（userId：user._id)并交给浏览器保存
        res.cookie("userId", user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 });
        //如果有值，返回user
        res.send({ code: 0, data: user });
      }
    }
  );
});
//更新路由
router.post('/update',function(req,res){
  // 得到请求cookie的userid
  const userId = req.cookies.userId;
  if(!userId){
    return res.send({code:1,msg:'请先登录'})
  }
  //更新数据库中对应的数据
  UserModel.findByIdAndUpdate({_id:userId},req.body,function(err,user){
    const {_id,username,type}=user
    //合并用户信息
    const data=Object.assign(req.body,{_id,username,type})
    res.send({code:0,data})
  })
});
//根据cookie 获取对应的user
router.get('/user',function(req,res){
  const userId = req.cookies.userId
  if(!userId)
  {
    return res.send({code:1,msg:'请先登录'})
  }
  // 查询对应的user
  UserModel.findOne({_id:userId},function (err , user) {
    return res.send({code:0,data:user})
  })
})
/**
 * 查看用户列表
*/
router.get('/list',function(req,res){
  const {type} = req.query
  UserModel.find({type},function(err,users){
    return res.json({code:0,data:users})
  })

})
/**
 * 获取当前用户所有相关聊天信息列表
 */
router.get('/msglist',function(req,res){
  //获取cookies中的userid
  const userId = req.cookies.userId
  console.log('--------userId---------')
  console.log(userId)
  console.log('--------userId---------')
  //查询到所有user文档数组
  UserModel.find(function(err,userDocs){
    //用对象存储所有的user信息：key为user的_id,val为name和header组成的user对象
    const users = {}
    userDocs.forEach((doc=>{
      users[doc._id]={username:doc.username,header:doc.header}
    }))
    /**
     * 查询userid相关的所有聊天信息
     * 参数1：查询条件
     * 参数2：过滤条件
     * 参数3：回调函数
     */
    ChatModel.find({'$or':[{from:userId},{to:userId}]},filter,function(err,chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天信息的数据
      res.send({code:0,data:{users,chatMsgs}})
    })
  })
})
/**
 * 修改指定消息为已读
 */
router.post('/readmsg',function (req,res) {
  // 得到请求中的from和to
  const from = req.body.from
  const to = req.cookies.userId
  /**
   * 更新数据库中的chat数据
   * 参数1：查询条件
   * 参数2：更新为指定的数据对象
   * 参数3：是否1次更新多条，默认只更新一条
   * 参数4：更新完成的回调函数
   */
  ChatModel.update({from,to,read:false},{read:true},{multi:true},function (err,doc) {
    console.log('/readmsg',doc)
    res.send({code:0,data:doc.nModified})//更新的数量
  })
})
module.exports = router;
