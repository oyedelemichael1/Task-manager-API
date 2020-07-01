const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const Task=require('./task')
const userSchema =new mongoose.Schema({//this whole object is a schema, from this bracket to its end
    name:{
        type:String,
        required:true,
        tirm:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid email')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            // if(value.length<7){
            //     throw new Error('password too short')
            // }
            if(value.toLowerCase().includes("password")){
                throw new Error('password not acceptable')
            }
        }
    },
    age:{
        type:Number,
        default:0,//certain mongoose query bypass some advanced features like middleware

        validate(value){
            if(value<0){
                throw new Error('age must be a positive number')
            }
        }
    },
    tokens:[{
        token:{
        type: String,
        required:true
         }
    }],
    avatar:{
        type : Buffer
    }
},{
    timestamps:true
})

//just a virtual reference to task model from user model. not part of the user model.
//will not be stored in user database.
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON= function(){
    const user=this
    const userObject= user.toObject()

    //thing to remove from user profile that is being sent back, for security and data management purposes.
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}


//we use .methods for instances of the model, user or "this" in this case
userSchema.methods.generateAuthToken= async function(){
    const user=this
    const _id=user.id.toString()
   const token = jwt.sign({_id},process.env.JWT_SECRET)

   user.tokens=user.tokens.concat({token})
   await user.save()
   return token
}

//we use .statics for the model User in this cast
userSchema.statics.findByCredentials= async (email,password)=>{
    const user= await User.findOne({email})
    if(!user){
        throw new Error('unableto login')
    }
    const isMatch = await bcrypt.compare(password, user.password) 
    if(!isMatch){
        throw new Error('unable to login')
    }
    return user
}
//setting up the middleware, save. it could also be validate, init or remove.everything can be found in the mongoose website under guides then middleware
userSchema.pre('save',async function(next){

//"this" is equal to the document that is being saved, it gives us access to individual user that is about to be saved 
const user=this
if(user.isModified('password')){//isModified is a mongoose function
    user.password= await bcrypt.hash(user.password, 8)
}



//console.log('just before saving')

next()//to confirm the fuction, if not it will keep proceesing without saving the user

})//we will use normal function since arrow functions dont bing this




//middlwareto delete task when auser gets deleted
userSchema.pre('remove', async function(next){
    const user=this

    await Task.deleteMany({owner:user._id})
    next()
})
const User=mongoose.model('User',userSchema)//A moddel

// const me=new User({
//     name: '   Tyson ',
//     email:'Mike@mead.io',
//     password:'Faceboook'
// })//an instance of the model

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log('Error',error)
// })//saving the instance in the database



module.exports = User