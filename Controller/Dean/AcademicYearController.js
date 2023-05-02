const mongoose = require('mongoose');

// User Models
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

// Models
const AcademicYearModel = require('../../Model/Dean/AcademicYearModel')


// Get all sections for the registration of student and adviser
const getAllAcademicYears = async(req, res) => {

  try {
    
    // get all Academic Years
    const AcademicYears = await AcademicYearModel.find({})

    // if no data found
    if(!AcademicYears) {
        res.status(400).json({ error: "No AcademicYears Found!"});
    }

    // send to front end
    res.status(200).json(AcademicYears);
  
  //catch error
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Academic Years' });
  }
}

// For DEAN Access
const createAcademicYear = async(req, res) => {
  const { academicYear } = req.body

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

    // check the academicYear it has a value
    if(!academicYear) {
      return res.status(400).json({ error: 'AcademicYear is required' });
    }

    // Check if the AcademicYear already exists in the database
    const existingAcademicYear = await AcademicYearModel.findOne({ academicYear });
    if (existingAcademicYear) {
        return res.status(400).json({ error: 'AcademicYear already exists' });
    }

    // Create a new AcademicYear object
    const AY = await AcademicYearModel.create({ academicYear });
    
    if(!AY){
      return res.status(500).json({ error: 'Academic year failed to save. Please try' });
    }

    res.status(201).json({ message: 'AcademicYear added successfully' });

  } catch (error) {
      res.status(500).json({ error: 'Server Error' });
  }
}

// Delete a sections 
const deleteAcademicYear = async(req, res) => {
  // Academic Year id
  const {id} = req.params;

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
 
     // Find "id" if there is the same "ObjectId" in Database and Delete the data
     const academicYear = await AcademicYearModel.findOneAndDelete({ academicYear: id });
 
     if(!academicYear) {
         return res.status(400).json({error: "No Academic Year Found!"})
     }
 
     // logs the Id found on the server!
     res.status(200).json(academicYear);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Academic Years' });
  }
}


module.exports = { createAcademicYear, getAllAcademicYears, deleteAcademicYear };