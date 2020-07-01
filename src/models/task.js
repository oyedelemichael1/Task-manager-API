const mongoose=require('mongoose')


const taskSchema= new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'//user model
    }

},{
    timestamps:true
})
// const Task=mongoose.model('Task',{
    
// })


const Task=mongoose.model('Task',taskSchema)
// const wash=new Task({
//     description:'      wash shoes    '
// })

// wash.save().then(()=>{
//     console.log(wash)
// }).catch((error)=>{
//     console.log(error)
// })


module.exports=Task