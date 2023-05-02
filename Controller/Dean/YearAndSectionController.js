const mongoose = require('mongoose');

//Models
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')
const AdminModel = require('../../Model/Roles/AdminModel');
const YearAndSectionModel = require('../../Model/Dean/YearAndSectionModel')

//Routes Controllers
// Get all sections for the registration of student and adviser
const getAllYearAndSections = async(req, res) => {

  try {
    const yearAndSection = await YearAndSectionModel.find({})

    if(!yearAndSection || yearAndSection.length === 0) {
       return res.status(400).json({ error: "No Year and Sections Found!"});
    }

    const currentYear = new Date().getFullYear();
    const filteredData = yearAndSection.filter(
      (data) =>
        data.academicYear.split("-")[0] == currentYear ||
        data.academicYear.split("-")[1] == currentYear
    );

    res.status(200).json(filteredData);
    
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
}

// Create a new YearAndSection document
const createAdvisersYearAndSection = async (req, res) => {
  // Extract data from the request body
  const { academicYear, section, adviser, adviser_id } = req.body;

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
    
    // Check if the adviser already has the academic year
    const existingYearAndSection = await YearAndSectionModel.find({ admin_id: adviser_id });
    
    //Filter to find if the academicYear and section of that adviser exist
    const exists = existingYearAndSection.filter(item => item.academicYear === academicYear && item.section === section);

    //Check if both academicYEar and section exist
    if(exists.length > 0){
      // Send a 400 error response with a meaningful error message
     return res.status(400).json({ error: `${adviser} already has a section of ${section} for academic year ${academicYear}` });
    }

    // Save the new document to the database
    const newYearAndSection = await YearAndSectionModel.create({
      academicYear,
      section,
      adviser,
      admin_id: adviser_id,
    });

    if(!newYearAndSection){
      return res.status(400).json({ error: `Year and Section failed to save in database. Please try again!` });
    }

    // find the adviser account
    const adviserExist = await AdminModel.updateOne({ _id: adviser_id }, { $set: { yearAndSection_id: newYearAndSection._id} });
    if(!adviserExist){
      return res.status(400).json({ error: `Invalid adviser ID!` });
    }

    // Send a success response with the created document in JSON format
    res.status(200).json(newYearAndSection);
    
  } catch (error) {
    // Send a server error response with a custom error message
    res.status(500).json({ error: 'Failed to create YearAndSection document' });
  }
}

// Get all the YearAndSection Data
const getAdvisersYearAndSecrion = async (req, res) => {
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

    // get All the Year and section
    const yearAndSections = await YearAndSectionModel.find({})

    if(!yearAndSections) {
       return res.status(400).json({ error: "No Year and Section Found!"});
    }

    res.status(200).json(yearAndSections);
    
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }


  
}

// Delete a single YearAndSection Data
const deleteAdvisersYearAndSecrion = async (req, res) => {
  // Year and section id
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
     const yearAndSection = await YearAndSectionModel.findOneAndDelete({ _id: id });
 
     if(!yearAndSection) {
         return res.status(400).json({error: "No Section Found!"})
     }
 
     // logs the Id found on the server!
     res.status(200).json(yearAndSection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Section' });
  }
}

module.exports = { getAllYearAndSections, createAdvisersYearAndSection, 
                  getAdvisersYearAndSecrion, deleteAdvisersYearAndSecrion };