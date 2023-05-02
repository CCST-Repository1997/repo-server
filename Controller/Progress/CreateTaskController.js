const mongoose = require('mongoose');

//User and Admin Model
const CreateTaskModel = require('../../Model/Progress/CreateTaskModel')
const AdminModel = require('../../Model/Roles/AdminModel');

//POST a new group
const createTask = async (req, res) => {
    const { taskName, description, chapter, group_id, progress_id } = req.body; 
    const checkboxStatus = false;

    //admin_id taken
    const user_id = req.user._id 

    try{
        // check if the data has a value
        if(!taskName || !description || !chapter || !group_id || !progress_id){
            return res.status(400).json({ 
                error: "All field must be filled. Please check the input if you have a name for your task and its description" });
        }

        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking for adviser
        const adviserIsloggedIn = await AdminModel.findById( user_id )
        if(!adviserIsloggedIn || !adviserIsloggedIn.authorization === 'admin'){
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // create the data send to the database
        const task = await CreateTaskModel.create({
            taskName, 
            description,
            chapter,
            group_id,
            checkboxStatus,
            progress_id
        });

        if(!task){
            return res.status(400).json({ 
                error: "The task is not saved. Please try again!" });
        }

        res.status(200).json(task);

    // catch error
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: `System back-end error! ${error.message}`});
    }
}

//GET all task
const getTask = async (req, res) => {
    const { id } = req.params;
    
    // adviser id or student id taken
    const user_id = req.user._id;

    try {
        // validate if its an ObjectId
        if( !mongoose.Types.ObjectId.isValid(id) ) {
            return res.status(400).json({error: "You dont have a group. Please ask your adviser for further assistance"})
        }

        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }
        
        // logs all the Id that has that group_id
        const task = await CreateTaskModel.find({ group_id: id });
        if(!task){
            return res.status(400).json({ 
                error: "No task found! Please create a task first" });
        }

        res.status(200).json(task);
        
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }


    
}

//DELETE a single workout
const deleteTask = async (req, res) => {
    const { id } = req.params;

   //admin_id taken
   const user_id = req.user._id 

   try{
       // validate if its an ObjectId
       if(!mongoose.Types.ObjectId.isValid( user_id )) {
           return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
       }

       // Authorization checking for adviser
       const adviserIsloggedIn = await AdminModel.findById( user_id )
       if(!adviserIsloggedIn || !adviserIsloggedIn.authorization === 'admin'){
           return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
       }
            
        // validate if its an ObjectId
        if( !mongoose.Types.ObjectId.isValid(id) ) {
            return res.status(400).json({error: "No Task Found to be deleted!"})
        }
    
        // Find "id" if there is the same "ObjectId" in Database and Delete the data
        const task = await CreateTaskModel.findOneAndDelete({_id: id});
        if(!task) {
            return res.status(400).json({error: "The task deletion failed. Please try again!"})
        }
    
        // logs the Id found on the server!
        res.status(200).json(task);

    // catch error
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message });
    }
 }

 // ADVISER TASK PAGE: The update button for 'done' and 'undone'
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { checkboxStatus } = req.body;

    //admin_id taken
   const user_id = req.user._id 


   try{
       // validate if its an ObjectId for adviser
       if(!mongoose.Types.ObjectId.isValid( user_id )) {
           return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
       }

       // Authorization checking for adviser
       const adviserIsloggedIn = await AdminModel.findById( user_id )
       if(!adviserIsloggedIn || !adviserIsloggedIn.authorization === 'admin'){
           return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
       }

        // validate if its an ObjectId for task id
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({error: "No Task Found!"})
        }

        // Update the checkboxStatus of the 'Task'
        const updatetask = await CreateTaskModel.findOneAndUpdate({ _id: id}, 
            {$set: {checkboxStatus: checkboxStatus} });

        // catch the error if the update failed
        if(!updatetask) {
            return res.status(400).json({error: "The update failed! Please try again!"})
        }

        res.status(200).json({ updatetask });
 
    // catch error
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message });
    }
}


module.exports = {createTask, getTask, deleteTask, updateTask};