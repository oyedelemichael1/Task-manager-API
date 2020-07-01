const express=require('express')
require('../db/mongoose')//we are notgrabbing anything form that file, it is just for mongoose connection to run
const User=require('../models/user')//to load in user.js
const router= new express.Router()
const auth= require('../middleware/auth')

const multer=require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail}= require('../emails/account')

router.post('/users',async (req,res)=>{// add 'async' to the function we are passing to express
    // console.log(req.body)//incomming body data
    // res.send('testing')

    const user=  new User(req.body)
    try{

        sendWelcomeEmail( user.email, user.name)
        const token= await user.generateAuthToken()
        //await user.save(), already done inside  generateAuthToken()
        res.status(201).send({user,token})
        //res.send() does JSON.stringify() brhind the scene
    }catch(e){
        res.status(400).send(e)
    }//instead of below

    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)//change status and send error, can be written as below
    //     // res.status(400)
    //     // res.send(e)
    // })


})

router.post('/users/login',async(req,res)=>{
    try{
        const user= await User.findByCredentials(req.body.email,req.body.password)
      
        const token= await user.generateAuthToken()

       
        res.send({user,token})

    }catch(e){
        res.status(400).send(e)
    }
})


const upload= multer({
    //dest:'avatar',// so that images will no longer be saved in the avatars directory on vs code
    limits: {
        fileSize: 1000000//1mb
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
     const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()// converts the uploaded image to png and resizes it.
     
   // req.user.avatar = req.file.buffer//buffer of all the binary data of the file. this can onlybe accessed when dest is not set up in const upload= multer...
    req.user.avatar = buffer
   await req.user.save()
    res.send()

},(error,req,res,next)=>{
    res.status(400).send({error :error.message})
})

router.delete('/users/me/avatar', auth, async(req,res)=>{
    req.user.avatar= undefined
    //console.log(req.user)
    await req.user.save()
    res.send(req.user)
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
             throw new Error()
        }
        res.set('Content-Type', 'image/png')//we are sure it is always png 
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})


router.get('/users/me', auth, async (req,res)=>{//we call auth function before the route handler.Route hanndler is everything fron async(req,res)
//     try{
//       const users=await  User.find({})
//       res.send(users)
//     }
//    catch(e){
//         res.status(500).send()//we are not sending any error, just status code showing this service is down
//     }

res.send(req.user)//req.user is gotten from auth function

})


// router.get('/users/:id',async (req,res)=>{//route parameter are parts of the url used to capture dynamic values eg ":id"
//     //console.log(req.params)//contains all the route parameters (an object) we are provided,in this case "id"

//     const _id=req.params.id

//     try{
//         const user = await User.findById(req.params.id)
//          //mongodb returns sccess even if user is not found, so we need to fix that ourself 
//             if(user){
//                 //console.log(user)   
//                 return res.send(user)
//             }
//             res.status(404).send()
//         }
//         catch(e){
//             res.status(500).send()
//         }
// })


router.patch('/users/me',auth, async (req,res)=>{
    const updates= Object.keys(req.body)//returns an array of things to be updated eg ['name','password']
    //console.log( Object.keys(req.body))
    const allowedUpdates=['name','email','password','age']
    const isvalidOperation= updates.every((update)=> allowedUpdates.includes(update))//checks if object keys are included in the valid array 
    if(!isvalidOperation){
        return res.status(400).send('error: Invalid Updates')
    }
    //const _id= req.params.id 
    try{
        //certain mongoose query bypass some advanced features like middleware, so we need to refactor to this way, instead of the way commented out .
        //const user=await User.findById(req.params.id)

        const user=req.user
        updates.forEach((update) =>  user[update]=req.body[update])

        await user.save()
        
        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        
        // if(!user){
        // return res.status(404).send()
        // }
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
           return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll',auth, async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()

    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth,async(req,res)=>{
 
    try{
        await req.user.remove()
        sendCancellationEmail(req.user.email,req.user.name)

      res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
    // try{
    //     const userToDelete= await User.findByIdAndDelete(req.params.id)
    //     if(!userToDelete){
    //         return res.status(404).send()
    //     }
    //     res.send(userToDelete)
    // }catch(e){
    //     res.status(500).send(e)
    // }
})



module.exports=router