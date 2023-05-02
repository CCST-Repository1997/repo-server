const mongoose = require('mongoose');

//User Models
const AdminModel = require('../../Model/Roles/AdminModel')
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

//Models
const SectionModel = require('../../Model/Dean/SectionModel')

//Routes Controllers
const createSection = async(req, res) => {
  //
  const { section } = req.body

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

    // Check if the section already exists in the database
    const existingSection = await SectionModel.findOne({ section });
    if (existingSection) {
        return res.status(400).json({ error: 'Section already exists' });
    }

    // Create a new section object
    const newSection = new SectionModel({ section });

    // Save the new section to the database
    await newSection.save();
    res.status(200).json({ message: 'Section added successfully' });

  } catch (error) {
      res.status(500).json({ error: 'Server Error' });
  }
}

const getAllSections = async(req, res) => {
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

    const advisers = await AdminModel.find({})
    // if no data found
    if(!advisers) {
      res.status(400).json({ error: "No Year and Section Found!"});
    }

    // get all Academic Years
    const sections = await SectionModel.find({})
    // if no data found
    if(!sections) {
        res.status(400).json({ error: "No sections Found!"});
    }

    // send to front end
    res.status(200).json({ advisers, sections });
  
  //catch error
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Section' });
  }
}

// Delete a sections 
const deleteSection = async(req, res) => {
  //Section id
  const { id } = req.params;

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
     const section = await SectionModel.findOneAndDelete({ section: id });
 
     if(!section) {
         return res.status(400).json({error: "No Section Found!"})
     }
 
     // logs the Id found on the server!
     res.status(200).json(section);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Section' });
  }
}

module.exports = { createSection, getAllSections, deleteSection, };