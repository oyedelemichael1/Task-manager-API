const jwt=require('jsonwebtoken')
const User=require('../models/user')

const auth= async (req,res,next)=>{
    // console.log('auth middleware')
    // next()

    try{
        const token=req.header('Authorization').replace('Bearer ','')//replace() replaces removes Bearer and the space in its front,leaving everything else
        //console.log(token)
        const decoded =jwt.verify(token, process.env.JWT_SECRET)
       
        const user= await User.findOne({_id:decoded._id, 'tokens.token':token})

        if(!user){
            throw new Error()
        }
        //console.log('user found')

        req.token=token
        req.user=user
        
        next()

    }catch(e){
        res.status(401).send('Error: Please authenticate')
    }


}

module.exports=auth