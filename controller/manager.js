const express = require('express')
const app = express()
const methodOverride = require('method-override');
app.use(methodOverride('_method'))
const router = express.Router();
const Manager = require('../models/manager')
const { isMLoggedIn, isSLoggedIn, requireSlogin, requireMlogin } = require('../middleware')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const passport = require('passport')
var cookieParser = require('cookie-parser');
const Event = require('../models/events');
const sendMail = require('../controller/mail.js');
const {cloudinary} = require('../cloudinary/index')
const Company = require('../models/companies')
module.exports.getRegister = function (req, res) {
    req.flash('success', 'Login or SignUp to continue')
    res.render('managerRegister')
}
module.exports.registration =  async function (req, res) {
    const { username, password, email } = req.body;
    const code = await bcrypt.hash(password, 12);
    const user = new Manager({
        username,
        password: code,
        email
    })
    await user.save()
        .catch(() => { req.flash('error',"Username or Email already registered");res.redirect('/manager/register') });
    req.session.user_id = user._id;
    res.redirect('/manager')
}
module.exports.login =  async function (req, res) {
    const { username, password } = req.body;
    const founduser = await Manager.findAndValidate(username, password)
                            .catch((err)=>{console.log(err); req.flash('error',"Invalid Credentials");res.redirect('/manager/register')});
    if (founduser) {
        req.session.user_id = founduser._id;
        res.redirect('/manager')
    }
    else {
        req.flash('error', 'Invalid Credentials')
        res.redirect('/manager/register')
    }
}
module.exports.home = async function (req, res) {
    const findUser = await Manager.find({ _id: req.session.user_id });
    const currentevents = findUser[0].activeEvents;
    const activeEvents = await Event.find({ _id: [...currentevents] });
    //const activeEvents =  Event.find( { _id : { $all: findUser[0].activeEvents } } )
    //console.log(activeEvents);
    console.log(activeEvents)
    res.render('manager', { activeEvents });
}
module.exports.edit = async function (req, res) {
    const EditEvent = req.body.Edit;
    const toeditEvent = await Event.find({ _id: EditEvent });
    const edit = toeditEvent[0];
    res.render('edit', { edit })
    //console.log(edit);
}
module.exports.getEvent =  function (req, res) {
    res.render('eventDetails')
}
module.exports.logout = function (req, res) {
    req.session.user_id = null;
    res.redirect('/')
}
module.exports.editEvent = async function (req, res) {
    const editedEvent = req.body;
    const id = editedEvent._id;
    const updateEvent = await Event.findByIdAndUpdate(id, editedEvent, { new: true })
    console.log(updateEvent);
    res.redirect('/manager');
}
module.exports.new = async function (req, res) {
    req.body.Manager_id=req.session.user_id;
    const newEvent = new Event(req.body);
    newEvent.Image.url = req.file.path
    await newEvent.save()
    // console.log(req.body, req.file)
    console.log(newEvent);
    await Manager.findByIdAndUpdate(req.session.user_id, { $push: { activeEvents: newEvent } })
    const eventadded = await Event.findById(req.session.user_id).populate('activeEvents');
    console.log(eventadded);
    res.redirect('/manager');
}
module.exports.profile = async function (req, res) {
    const user = await Manager.findById(req.session.user_id);
    console.log(user);
    res.render('mprofile', { user })
}
module.exports.delete = async function (req, res) {
    const { id } = await req.params;
    await (await Manager.findByIdAndUpdate(req.session.user_id, { $pull: { activeEvents: id } }))
    await Event.deleteOne({ _id: id });
    res.redirect('/manager')

}
module.exports.mail = function(req,res) {
    const {Name,Email,message} = req.body;
    console.log('Data :',req.body);
    sendMail(Email,Name,message); //to be added
    res.redirect('/manager/profile');
    
}
module.exports.about =  function (req, res) {
    res.render('mabout')
}
module.exports.getCompanies = async function(req, res){
    const {id} =req.params;
    const event = await Event.findById(id);
    const companies = event.InterestedCompanies;
    const company = await Company.find({_id : [...companies]});
    console.log(company)
    // res.render('companyName', {companies})
    res.render('companyName', {company})
}

module.exports.contact = async function(req,res){
    const {id} = req.params;
    console.log(id);
     const company = await Company.find({ _id : id});
     console.log(company);
     const {Email,Contact} = company[0];
     res.render('mcontact',{Email,Contact})
}