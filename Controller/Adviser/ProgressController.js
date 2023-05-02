const mongoose = require('mongoose');
const path = require("path")
const fs = require('fs');

// User Models
const AdminModel = require('../../Model/Roles/AdminModel')
const StudentModel = require('../../Model/Roles/UserModel')
const ProgressModel = require('../../Model/Adviser/ProgressModel')

// Models
const GroupsModel = require('../../Model/Groups/GroupsModel');
const CommentModel = require('../../Model/Progress/CommentsModel')

// Task Model with files
const TaskModel = require('../../Model/Progress/CreateTaskModel')
const StudentTaskFileModel = require('../../Model/FileUpload/StudentTaskModel')
const AdviserTaskFileModel = require('../../Model/FileUpload/FileUploadModel')
const ManuscriptModel = require('../../Model/FileUpload/ManuscriptModel')

// get the student group
const getMyGroup = async(req, res) => {
  //can be adviser or student id taken
  const user_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( user_id )) {
      return res.status(400).json("Access denied: No User Found!")
    }

    // Check if the user is a adviser or student
    const student = await StudentModel.findById( user_id )
    if(!student){
      return res.status(400).json({ error: "Unauthorized access. You are not a member of this group!"}); 
    }

    // get all Academic Years
    const findGroup = await GroupsModel.findById(student.group_id)
    // if no data found
    if(!findGroup) {
      return res.status(400).json({ error: "No groups found. You dont belong to any group!"}); 
    }

    const findManu = await ManuscriptModel.find({group_id: student.group_id})
    
     // send to front end
     return res.status(200).json({findGroup, findManu});


  //catch error
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Academic Years' });
  }
}


// ADVISER: 
const createProgress = async(req, res) => {
  const { progress, group_id } = req.body

  //adviser id taken
  const adviser_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( adviser_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // check the progress it has a value
    if(!progress) {
      return res.status(400).json({ error: 'Progress name is required' });
    }

    // Check if the user is a adviser
    const adviser = await AdminModel.findOne({ _id: adviser_id }); 
    if(!adviser || !adviser.authorization === 'admin'){
      return res.status(400).json({ error: "Unauthorized Access!"});
    }

    // Save the new Progress to the database
    const newProgress = await ProgressModel.create({ 
      progress, 
      admin_id: adviser_id, 
      group_id, 
      percent: 0  });

    if(!newProgress) {
      return res.status(400).json({ error: 'Progress is not saved. Please try again' });
    }

    res.status(200).json({ message: 'New progress is added successfully', newProgress });

  } catch (error) {
      res.status(500).json({ error: 'Something went wrong while saving the progress. Please try again!' });
  }
}

// Get all sections for the registration of student and adviser
const getProgress = async(req, res) => {
  //can be adviser or student id taken
  const user_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( user_id )) {
      return res.status(400).json("Access denied: No User Found!")
    }

    // Check if the user is a adviser or student
    const adviser = await AdminModel.findOne({ _id: user_id }); 
    const student = await StudentModel.findById( user_id )
    if( adviser || student ){
      // get all Academic Years
      const progress = await ProgressModel.find({})

      // if no data found
      if(!progress) {
          return res.status(400).json({ error: "No Progress Found!"});
      }

      // send to front end
      return res.status(200).json(progress);
      
    // intruder error  
    } else{
      return res.status(400).json({ error: "Unauthorized Access!"});
    }

  //catch error
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Academic Years' });
  }
}

// Delete a sections 
const deleteProgress = async(req, res) => {
  // progress id taken
  const { id } = req.params;

  // group id taken
  const { group_id } = req.body

  //adviser id taken
  const adviser_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( adviser_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // Check if the user is a adviser
    const adviser = await AdminModel.findOne({ _id: adviser_id }); 
    if(!adviser || !adviser.authorization === 'admin'){
        return res.status(400).json({ error: "Unauthorized Access!"});
    }
 
    // DATA CONNECTED TO THE PROGRESS THAT WILL BE DELETED
    // 1) Task infos
    const deleteTaskInfos = await TaskModel.deleteMany({ progress_id: id })
    if(!deleteTaskInfos){
        return res.status(400).json({error: `All task deletion under this group failed. Please try again!`})
    }

    // 2) Task files
        // STUDENT
        const deleteStudentTaskFile = await StudentTaskFileModel.deleteMany({ progress_id: id })
        if(!deleteStudentTaskFile){
            return res.status(400).json({error: `All task files deletion under this group of the student failed. Please try again!`})
        }

        //ADVISER
        const deleteAdviserTaskFile = await AdviserTaskFileModel.deleteMany({ progress_id: id })
        if(!deleteAdviserTaskFile){
            return res.status(400).json({error: `All task files deletion under this group of your group advisee failed. Please try again!`})
        } 

    // 3) Comments
    const deleteComments = await CommentModel.deleteMany({ progress_id: id })
    if(!deleteComments){
        return res.status(400).json({error: `All comments deletion under this group failed. Please try again!`})
    }

    // 4) Progress
    const deleteProgress = await ProgressModel.findByIdAndDelete( id )
    if(!deleteProgress){
        return res.status(400).json({error: `All progress deletion under this group failed. Please try again!`})
    }


     // logs the Id found on the server!
     res.status(200).json('Deletion is successful including the following connected to the progress:student and adviser task file, task details and comments  ');

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Update the percent per progress
const updatePercent = async(req, res) => {
  // Academic Year id
  const { id } = req.params

  // new percent value
  const { percent } = req.body

  //adviser id taken
  const adviser_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( adviser_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // Check if the user is a adviser
    const adviser = await AdminModel.findOne({ _id: adviser_id }); 
    if(!adviser || !adviser.authorization === 'admin'){
        return res.status(400).json({ error: "Unauthorized Access!"});
    }

  const updatedPercent = await ProgressModel.findByIdAndUpdate( id, 
    { percent: percent }, { new: true } )
  
  if(!updatedPercent){
    return res.status(500).json({ error: 'Failed to save the percent' });
  }

  // GROUPS PERCENT
  const findGroup = await ProgressModel.findById( id );

  const findAllProgress = await ProgressModel.find({ group_id: findGroup.group_id });
  if(!findAllProgress){
    return res.status(400).json({ error: "No group found!"})
  }
  // compute the average of the findAllProgress
  const totalPercent = findAllProgress.reduce((sum, progress) => {
    return sum + parseInt(progress.percent);
  }, 0);
  const averagePercent = totalPercent / findAllProgress.length;
  const groupAverage =  Math.round(averagePercent);

  // save the total average of the group
  const group = await GroupsModel.findByIdAndUpdate({ _id: findGroup.group_id }, 
    { totalAveragePercent: groupAverage }, { new: true });
  
  if(!group) {
    return res.status(400).json({ error: "groups progress is not saved"})
  }

  // ADMIN HANDLED GROUPS PERCENT
  //adviser id taken
  const admin_id = req.user._id

  // get the total percent for all admin groups
  const allGroups = await GroupsModel.find({ admin_id: admin_id });
  const totalGroupPercent = allGroups.reduce((sum, group) => {
    return sum + parseInt(group.totalAveragePercent);
  }, 0);

  const averageGroupPercent = totalGroupPercent / allGroups.length;
  const groupTotalAverage =  Math.round(averageGroupPercent);

  // update the groupsTotalPercent for the logged in admin
  const admin = await AdminModel.findByIdAndUpdate( admin_id, 
    { groupsTotalPercent: groupTotalAverage}, { new: true })

  if(!admin) {
    return res.status(400).json({ error: "Adviser groups progress is not saved"})
  }

  res.status(200).json({ msg: "Your progress percent is succesfuly saved!", admin,});
    
  //catch error
  } catch (error) {
    res.status(500).json({ error: 'Something is wrong happend please try again!' });
  }
}

module.exports = { getMyGroup, getProgress, createProgress, deleteProgress, updatePercent };