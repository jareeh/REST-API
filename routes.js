'use strict';
const { User, Course } = require('./models');
const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateUser } = require('./middleware/auth-user');
const { asyncHandler } = require('./middleware/asyncHandler');

// Construct a router instance.
const router = express.Router();

// TODO setup your api routes here
router.get('/users', authenticateUser, async (req, res) => {
    const user = await User.findByPk(req.currentUser.id, {
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt']
        }
    });
    res.json(user);
});

//POST add a new user route, with route AND sequelize validation/error handling
router.post('/users', asyncHandler(async (req, res) => {
    try{
        const user = req.body;
        const errors = [];
    
        if(!user.firstName){
            errors.push('Please provide a first name');
        }
    
        if(!user.lastName){
            errors.push('Please provide a last name');
        }
    
        if(!user.emailAddress){
            errors.push('Please provide an email address');
        }
    
        if(!user.password){
            errors.push('Please provide a password');
        } else {
            user.password = bcrypt.hashSync(user.password, 10);
        }
    
        if(errors.length > 0){
            res.status(400).json({ errors });
        } else {
            await User.create(user);
            res.location('/').status(201).end();
        }
    } catch(error){
        console.log("Error: ", error.name)
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            const errors = error.errors.map(err => err.message)
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));
  
//GET all courses route
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    });
    res.json(courses);
}));

//returns course and user that owns the course for the provided course ID
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt']
        }
    });
    res.json(course)
}));

//POST add a new course route
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    const course = req.body;
    const errors = [];

    if(!course.title){
        errors.push('Please provide a course title');
    }

    if(!course.description){
        errors.push('Please provide a course description');
    }

    if(errors.length > 0){
        res.status(400).json({ errors });
    } else {
        const newCourse = await Course.create(course);
        res.location(`/courses/${newCourse.id}`).status(201).end();
    }
}));

//PUT update a course route
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const updatedCourse = req.body;
    const errors = [];
    let isOwner;
    
    if(!updatedCourse.title){
        errors.push('Please provide a course title');
    }
    
    if(!updatedCourse.description){
        errors.push('Please provide a course description');
    }
    
    if(errors.length > 0){
        res.status(400).json({ errors });
    } else {
        const course = await Course.findByPk(req.params.id);
            if(req.currentUser.id === course.userId){
                await course.update(updatedCourse);
                res.status(201).end();
            } else {
                res.status(403).json({ error: 'You must own this course to modify it' })
            }
    }
}));

//DELETE a course route
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
        if(req.currentUser.id === course.userId){
            await course.destroy();
            res.status(204).end();
    } else {
        res.status(403).json({ error: 'You must own this course to delete it' })
    }
}));

module.exports = router;