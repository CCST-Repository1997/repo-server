const mongoose = require('mongoose');

// User Models
const AdminModel = require('../../Model/Roles/AdminModel')
const UserModel = require('../../Model/Roles/UserModel')

// Models
const GroupsModel = require('../../Model/Groups/GroupsModel')
const ManuscriptModel = require('../../Model/FileUpload/ManuscriptModel')


const archiveGroup = async(req, res) => {
  const { group_id } = req.params 

    //adviser id taken
    const admin_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( admin_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // Find the adviser
    const adviser = await AdminModel.findOne({ _id: admin_id });
    if (!adviser) {
        return res.status(400).json({ error: "Unanthorized Access!" });
    }

    // Check if the group_id exist
    const group = await GroupsModel.findOne({ _id: group_id})
    if(!group){
      return res.status(400).json({ error: "No group found!" });
    }

    // to archive the Manuscript Files
    const manuscriptFile = await ManuscriptModel.find({ group_id: group_id })
    if(manuscriptFile){
      await ManuscriptModel.updateMany({ group_id: group_id }, { $set: { isArchived: true } });
    }

    // Archive the students with group_id
    const groupIsArchived = await GroupsModel.updateOne({ _id: group_id }, { $set: { isArchived: true } });

    // Archive the student
    await UserModel.updateMany({ group_id: group_id }, { $set: { isArchived: true } });

    //API response
    res.status(200).json({ message: `Students associated with ${groupIsArchived.name} and manuscript files are archived!`});
  } catch (error) {
      res.status(500).json({ error: 'Error while archiving the group!' });
  }

}

const unarchiveGroup = async(req, res) => {
  const { group_id } = req.params 

  //adviser id taken
  const admin_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( admin_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // Find the adviser
    const adviser = await AdminModel.findOne({ _id: admin_id });
    if (!adviser) {
        return res.status(400).json({ error: "Unanthorized Access!" });
    }

    // Check if the group_id exist
    const group = await GroupsModel.findOne({ _id: group_id})
    if(!group){
      return res.status(400).json({ error: "No group found!" });
    }

    // to archive the Manuscript Files
    const manuscriptFile = await ManuscriptModel.find({ group_id: group_id })
    if(manuscriptFile){
      await ManuscriptModel.updateMany({ group_id: group_id }, { $set: { isArchived: false } });
    }

    // Archive the students with group_id
    const groupIsArchived = await GroupsModel.updateOne({ _id: group_id }, { $set: { isArchived: false } });

    // Archive the student
    const studentIsArchived = await UserModel.updateMany({ group_id: group_id }, { $set: { isArchived: false } });

    //API response
    res.status(200).json({ message: `Students associated with ${groupIsArchived.name} adviser are archived`,
      groupIsArchived,  studentIsArchived });
  } catch (error) {
      res.status(500).json({ error: 'Error occurs while Unarchiving the group!' });
  }
}


module.exports = { archiveGroup, unarchiveGroup };