const md5 = require('blueimp-md5')
//1、连接数据库
//1.1 引入mongoose
const mongoose = require('mongoose')
//1.2 连接指定数据库（url只有数据库是变化的）
mongoose.connect('mongodb://localhost:27017/tfboys_test')
//1.3 获取连接对象
const conn = mongoose.connection
//1.4 绑定连接完成的监听（用来提示连接成功）
conn.on('connected',function(){
    console.log('数据库连接成功')
})
//2、得到特定集合的model
//2.1 字义Schema（描述文档结构）
const userSchema = mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    type:{type:String,required:true}
})
//2.2 定义Model（与集合对应，可以操作集合）
const UserModel = mongoose.model('user',userSchema)

//3.1 通过Model实例的save()添加数据
function testSave()
{
    const user={
        username:'karry',
        password:md5('0921'),
        type:'tfboys'
    }
    const userModel =new UserModel(user)
    //保存到数据库
    UserModel.save(function(err,user){
        console.log('save',err,user)
    })
}
//3.2 通过model的find()/findOne()查询多个或一个数据
function testFind()
{
    UserModel.find(function(err,users){
        console.log('find()',err,user)
    })
    UserModel.findOne({_id:'111'},function(err,user){
        console.log('findOne()',err,user)
    })
}
//3.3 通过Model的findByIdAndUpdate()更新某个数据
function testUpdate()
{
    UserModel.findByIdAndUpdate({_id:'111'},{username:'yyy'},function(err,user){
        console.log('findByIdAndUpdate()',err,user)
    })
}
//3.4 通过Model的remove删除匹配数据
function testDelete()
{
    UserModel.remove({_id:'111'},function(err,result){
        console.log('remove()',err,result)
    })
}
