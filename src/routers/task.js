const express=require('express')
const router= new express.Router()
require('../db/mongoose')
const Task=require('../models/task')//to load in user.js
const auth=require('../middleware/auth')

router.get('/tasks/:id',auth, async (req,res)=>{

    const _id= req.params.id
    

    try{
        //const task = await Task.findById(_id)
        const task =await Task.findOne({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(e){
        res.status(500).send()
    }

})

//GET /tasks?cpmpleted=true
//GET /tasks?limit=10&skip=20

//limit is number of results in a page, skip is number of results to be skipped. therfore setting skip and limit to the same value means "go to next page"

//GET /tasks?sortBy=createdAt:asc
router.get('/tasks',auth, async (req,res)=>{

    const userId=req.user._id
    const match={}
    const sort={}

    if(req.query.completed){
        match.completed = req.query.completed==='true'// checkes if req.query.completed is the string 'true',then assignsit to match .completed
    }
    if(req.query.sortBy){
        const parts= req.query.sortBy.split(':')//splits the sortBy query into createdAt and (desc or ascending) and saves the values in the array called parts
        //parts[0] is createdAt, parts[1] can be desc or asc
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1 //checks if(parts[1]=== 'desc'){ sort[parts[0]] = -1 } else{ sort[parts[0] = 1 }
    }
    try{
     //  const tasks =  await Task.find({owner:userId})
       await req.user.populate({
            path : 'tasks',
            match ,
            options: {
                limit:parseInt(req.query.limit),//convert limit to integer
                skip: parseInt(req.query.skip),
                 sort//:{
                //     completed:-1
                //     //createdAt:-1// ascending is 1 and descending is -1
                // }
            } 
        }).execPopulate()
       
       res.send(req.user.tasks) 
       //res.send(tasks)
    }catch(e){
        res.status(500).send()
    }
})


router.post('/tasks',auth, async (req,res)=>{
   // const task=new Task(req.body)
   const task= new Task({
       ...req.body,//this copies all the properties from body to this object
    owner: req.user._id//from auth
   })

    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }

})

router.patch('/tasks/:id',auth, async(req,res)=>{
    const isvalidOperation=['description','completed']
    const requestArray= Object.keys(req.body)
    const check= requestArray.every((requestArrayElement)=>isvalidOperation.includes(requestArrayElement))
    if(!check){
        return res.status(400).send('error : invalid input')
    }
    try{
        const task= await Task.findOne({_id:req.params.id,owner:req.user.id})
       // const task= await Task.findById(req.params.id)
       if(!task){
        return res.status(404).send()
        }
        requestArray.forEach((requestArrayElement) =>   task[requestArrayElement]=req.body[requestArrayElement])
        await task.save()
        //const task= await Task.findByIdAndUpdate(req.params.id,req.body ,{new:true,runValidators:true,})
       
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
        const valueToDelete= await Task.findOneAndDelete({_id:req.params.id,owner:req.user.id})
        if(!valueToDelete){
            return res.status(404).send()
        }
        res.send(valueToDelete)
    }catch(e){
        res.status(500).send(e)
    }
})



module.exports=router