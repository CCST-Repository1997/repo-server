// Users Model
const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel')
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

// 
const YearAndSectionModel = require('../../Model/Dean/YearAndSectionModel')
const mongoose = require('mongoose');

// CONTROLLERS
  // STUDENT
const getStudent = async(req, res) => {
  //Auth: student id taken
  const student_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( student_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // check if the id exist
    const student = await UserModel.findById(student_id);
    if(!student){
      return res.status(400).json({ error: 'Access unathorized!' });
    }

    // Find the adviser of the student
    const findAdviser = await AdminModel.findById(student.admin_id)
    if(!findAdviser){
      return res.status(400).json({ error: 'No Adviser Found!' });
    }

    // data to send
    res.status(200).json(
      [{ name:     student.name, 
        adviser:  findAdviser.name,
        section:  student.section,
        email:    student.email,
        group:    student.groupName,
        position: student.position,
        student_id: student.studentID,
        status:   'Student',
      }]
    );

  // catch error
  } catch (error) {
    return res.status(400).json({ error: 'No Student Account found!' });
  }
}

  //ADVISER
const getAdviser = async(req, res) => {
  //Auth: adviser id taken
  const adviser_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( adviser_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // check if the id exist
    const adviser = await AdminModel.findById(adviser_id);
    if(!adviser){
      return res.status(400).json({ error: 'Access unathorized!' });
    }

    // Find the active section of the adviser
    const findSection = await YearAndSectionModel.findById(adviser.yearAndSection_id)
    if(!findSection){
      return res.status(400).json({ error: 'No SectionFound!' });
    }

    // data to send
    res.status(200).json(
      [{ name:              adviser.name, 
        activeSection:      findSection.section,
        activeAcademicYear: findSection.academicYear,
        email:              adviser.email,
        totalPercent:       adviser.groupsTotalPercent,
        status:             'Adviser',
      }]
    );

  // catch error
  } catch (error) {
    return res.status(400).json({ error: 'No Adviser Account found!' });
  }
}

const getYearAndSection = async(req, res) => {
  //Auth: adviser id taken
  const adviser_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( adviser_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // check if the id exist
    const adviser = await AdminModel.findById(adviser_id);
    if(!adviser){
      return res.status(400).json({ error: 'Access unathorized!' });
    }

    // get the year and section based on the adviser
    const yearAndSection = await YearAndSectionModel.find({ admin_id: adviser._id})
    if(!yearAndSection){
      return res.status(400).json({ error: 'No year and section found!' });
    }

    //send
    res.status(200).json( yearAndSection );
    
  } catch (error) {
    return res.status(400).json({ error: 'Something went wrong please try again!' });

  }
}

const postYearAndSection = async(req, res) => {
  //Auth: adviser id taken
  const adviser_id = req.user._id

  // Year and Section id 
  const { id } = req.params

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( adviser_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // check if the id exist
    const adviser = await AdminModel.findById(adviser_id);
    if(!adviser){
      return res.status(400).json({ error: 'Access unathorized!' });
    }

    // check if the year and section id exist
    const checkYearAndSection = await YearAndSectionModel.findById(id)
    if(!checkYearAndSection){
      return res.status(400).json({ error: 'Please select your Year and Section' });
    }

    // Check the currently in use Year and section
    if(adviser.yearAndSection_id === id){
      return res.status(400).json({ error: 'This Year and Section is currently in use!' });
    }

    //update the currently in use of yearAndSection_id for the adviser
    const updateYearAndSection = await AdminModel.updateOne(
      // the student id
      { _id: adviser_id }, 
      //data to update
      { $set: { yearAndSection_id: id }}
  );

  console.log('Update: ', updateYearAndSection)
  // catch the error
  if(!updateYearAndSection){
    return res.status(400).json({ error: 'Your activation didnt save please try again!' });
  }

  //send
  res.status(200).json( updateYearAndSection );

  // error
  } catch (error) {
    return res.status(400).json({ error: 'Something went wrong please try again!' });
  }
}

  // DEAN
const getDean = async(req, res) => {
  //Auth: dean id taken
  const dean_id = req.user._id

  try {
    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( dean_id )) {
      return res.status(400).json({error: "Access denied: No User Found!"})
    }

    // check if the id exist
    const dean = await SuperAdminModel.findById(dean_id);
    if(!dean){
      return res.status(400).json({ error: 'Access unathorized!' });
    }

    // if the authorization is superadmin
    if(dean.authorization !== 'superadmin'){
      return res.status(400).json({ error: 'Access unathorized!' });
    }

    // data to send
    res.status(200).json(
      [{ name:     dean.name, 
        email:    dean.email,
        status:   'Dean',
      }]
    );

  // catch error
  } catch (error) {
    res.status(400).json({ error: 'Your Account is not found!' });
  }
}


module.exports = { getStudent, getAdviser, postYearAndSection, getYearAndSection, getDean };