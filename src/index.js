const express=require('express')
//require('./db/mongoose')//we are notgrabbing anything form that file, it is just for mongoose connection to run
//const User=require('./models/user')//to load in user.js
//const Task=require('./models/task')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

const app=express()
const port=process.env.PORT


// //Express middleware to restrict access to get requests
// app.use((req,res)=>{
//     if(req.method === 'GET'){
//         res.send('GET requests are down ')
//     }else{
//         next()
//     }
// })


// app.use((req,res)=>{
//     res.status(503).send('Site is current;y down, check back soon!')
// })

app.use(express.json())//parses incoming json to an object so we can access it in our request handlers. it is saved in req.body
app.use(userRouter)//to register our router to the app
app.use(taskRouter)

// const myfunction=async ()=>{
//     const token =jwt.sign({_id:'abcde123'},process.env.JWT_SECRET,{expiresIn:'7 days'})
//     console.log(token)
// }
// myfunction()


const multer=require('multer')
const upload= multer({
    dest:'images',
     limits: {
        fileSize: 1000000//1mb
    },
    fileFilter(req,file,cb){//req contains the request being made,file contains the info about the file being uploaded and cb is callback.
    
        if(!file.originalname.match(/\.(doc|docx)$/)){//file.originalname.endsWith('.pdf')
            return cb(new Error('please upload a word document'))
        }
        cb(undefined,true)
    
    
        //  cb(new Error('file has to be a PDF'))
        //  cb(undefined,true)//true if the upload should be accepted
        //  cb(undefined,false)//slently reject the upload
    }
})

const errorMiddeware=(req,res,next)=>{
    throw new Error('From my middleware')

}
app.post('/upload',upload.single('upload'),(req,res)=>{
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error :error.message})
})





app.listen(port,()=>{
    console.log('server is upon port '+port)
})
// toJSON happens before an object is stringified.Therefore, before it is sent back to the screen. That way, an object that is stringified can be manipulated before the output is sent.
// const pet = {
//     name:'hal',
//     age:23,
//     class: 'ss3'
// }
// pet.toJSON=function(){
//     //console.log(this)
//     delete this.class
//     return this
// }
// console.log(JSON.stringify(pet))


const Task=require('./models/task')
const User=require('./models/user')

// const main= async ()=>{
//     // const task= await Task.findById('5ee3d122b8bcb6135ed9893e')
//     // await task.populate('owner').execPopulate()//finds the user associated with this task and task.owner will becomes the owner's entire document rather than just the id
//     // //the populate woked because we have referenced the user model from the task model,under owner.
//     // console.log(task.owner)

//     const user= await User.findById('5ee40538eefe161d1c88d9cd')
//     await user.populate('tasks').execPopulate()//belongs to mongoose
//     console.log(user.tasks)

// }

// main()


