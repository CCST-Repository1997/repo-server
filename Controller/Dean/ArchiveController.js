const mongoose = require('mongoose');

// User Models
const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel');
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

// Models
const ManuscriptModel = require('../../Model/FileUpload/ManuscriptModel')


// Archive the adviser and its students
const archiveAdviser = async (req, res) => {
    const { adminId } = req.params 

    //dean id taken
    const dean_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( dean_id )) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }

        // Check if the user is a dean
        const dean = await SuperAdminModel.findOne({ _id: dean_id }); 

        if(!dean.authorization === 'superadmin'){
            return res.status(400).json({ error: "Unauthorized Access!"});
        }

        // Find the adviser
        const adviser = await AdminModel.findOne({ _id: adminId });
        if (!adviser) {
            return res.status(400).json({ error: "Adviser not found!" });
        }

        // Archive the adviser
        const adviserIsArchived = await AdminModel.updateOne({ _id: adminId }, { $set: { isArchived: true } });

        // to archive the Manuscript Files
        const manuscriptFile = await ManuscriptModel.find({ admin_id: adminId })
        if(manuscriptFile){
        await ManuscriptModel.updateMany({ admin_id: adminId }, { $set: { isArchived: true } });
        }

        // Find the student
        const student = await UserModel.find({ admin_id: adminId });
        if (student) {
            // Archive the student
            await UserModel.updateMany({ admin_id: adminId }, { $set: { isArchived: true } })
        }

        res.status(200).json({ message: 'Adviser account is successfuly archived. Also all the associated groups and manuscripts handled by this Adviser are all Archived', 
            adviserIsArchived });
  } catch (error) {
      res.status(500).json({ error: 'Error happens while archiving the adviser account' });
  }
}

// Unarchive the adviser and its students
const unarchiveAdviser = async (req, res) => {
    const { adminId } = req.params 

    //dean id taken
    const dean_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( dean_id )) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }

        // Check if the user is a dean
        const dean = await SuperAdminModel.findOne({ _id: dean_id }); 
        
        if(!dean.authorization === 'superadmin'){
        return res.status(400).json({ error: "Unauthorized Access!"});
        }

        // Find the adviser
        const adviser = await AdminModel.findOne({ _id: adminId });
        if (!adviser) {
            return res.status(400).json({ error: "Adviser not found!" });
        }

        // Archive the adviser
        const adviserIsArchived = await AdminModel.updateOne({ _id: adminId }, 
            { $set: { isArchived: false } });

        // to archive the Manuscript Files
        const manuscriptFile = await ManuscriptModel.find({ admin_id: adminId })
        if(manuscriptFile){
        await ManuscriptModel.updateMany({ admin_id: adminId }, { $set: { isArchived: false } });
        }

        // Find the student
        const student = await UserModel.find({ admin_id: adminId });
        if (student) {
            // Archive the student
            await UserModel.updateMany({ admin_id: adminId }, { $set: { isArchived: false } })
        }

        res.status(200).json({ message: 'Adviser account is successfuly removed from archived list. Also all the associated groups and manuscripts handled by this Adviser are all unarchived!',
            adviserIsArchived });
  } catch (error) {
      res.status(500).json({ error: 'Error happens while unarchiving the adviser account' });
  }
}

// Get all the archived adviser
const getArchiveAdvisers = async (req, res) => {
   //dean id taken
   const dean_id = req.user._id

   try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( dean_id )) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }

        // Check if the user is a dean
        const dean = await SuperAdminModel.findOne({ _id: dean_id }); 
        if(!dean.authorization === 'superadmin'){
            return res.status(400).json({ error: "Unauthorized Access!"});
        }

        // Find all advisers that have isArchived set to true
        const archivedAdvisers = await AdminModel.find({ isArchived: true });
        if (!archivedAdvisers) {
            return res.status(404).json({ error: 'No archived advisers found' });
        }

        res.status(200).json({ archivedAdvisers });
  } catch (error) {
      res.status(500).json({ error: 'Error happens while requesting all archived accounts of adviser' });
  }

};

module.exports = { archiveAdviser, unarchiveAdviser, getArchiveAdvisers };