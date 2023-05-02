const mongoose = require('mongoose');

// User model
const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel')

// Model
const CommentsModel = require('../../Model/Progress/CommentsModel');



//POST a new Comment
const createComments = async (req, res) => {
    const {id} = req.params;
    const { comment, chapter, progress_id } = req.body; 

    //admin_id or student taken
    const user_id = req.user._id 

    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( user_id )) {
        return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
    }

    // find the student
    const user = await UserModel.findById({ _id: user_id })

    // save for adviser comment
    if(!user) {
        const admin = await AdminModel.findById({ _id: user_id })
        try {
            // create the data send to the database
            const comments = await CommentsModel.create({ 
                comment, 
                group_id: id, 
                progress_id: progress_id,
                username: admin.name, 
                userStatus: admin.authorization, 
                chapter: chapter });

            return res.status(200).json(comments);
        } catch (error) {
            //log if there is any error
            return res.status(400).json({ error: error.message});
        }
    }   
    
    // save for student comment
    try {
        // create the data send to the database
        const comments = await CommentsModel.create({ 
            comment, 
            group_id: id, 
            progress_id: progress_id,
            username: user.name, 
            userStatus: user.authorization, 
            chapter: chapter });

        res.status(200).json(comments);
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}

//GET all Comments
const getComments = async (req, res) => {
    //group_id
    const {id} = req.params;

    //admin id or student id taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // logs all the Id inside workoutModel
        const comment = await CommentsModel.find({group_id: id});

        res.status(200).json(comment);
    } catch (error) {
        //log if there is any error
        return res.status(400).json({ error: error.message});
    }
}

//DELETE a single comment
const deleteComment = async (req, res) => {
    const { id } = req.params;

    //admin id or student id taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }
         // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( id )) {
            return res.status(400).json({error: "No Comment Found!"})
        }

        // Find "id" if there is the same "ObjectId" in Database and Delete the data
        const comment = await CommentsModel.findOne({ _id: id });

        // student deleting his comment
        if(comment.userStatus === 'student'){
            const isStudent = await UserModel.findById( user_id )
            if(isStudent){
                const deletedComment = await CommentsModel.findOneAndDelete({ _id: id });

                // logs the Id found on the server!
                return res.status(200).json(deletedComment);
            } if (!isStudent){
                // send the error
                return res.status(401).json({error: "Deletion of the comment failed. Unauthorized Access!"})
            } else {
                // send the error
                return res.status(404).json({error: "No Comment Found!"})
            }
        }

        // adviser deleting his student or his comment
        if(comment.userStatus === 'admin'){
            const isAdviser = await AdminModel.findById( user_id )
            if(isAdviser){
                const deletedComment = await CommentsModel.findOneAndDelete({ _id: id });

                // logs the Id found on the server!
                return res.status(200).json(deletedComment);
            } if (!isAdviser){
                // send the error
                return res.status(401).json({error: "Deletion of the comment failed. Unauthorized Access!"})
            } else {
                // send the error
                return res.status(404).json({error: "No Comment Found!"})
            }
        }

        if(!comment) {
            return res.status(400).json({error: "No Comment Found!"})
        }

    // catch error
    } catch (error) {
        //log if there is any error
        return res.status(400).json({ error: error.message});
    }
 }


module.exports = {createComments, getComments, deleteComment};