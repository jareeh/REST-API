'use strict';
const { User, Course } = require('./models');
const express = require('express');

// Construct a router instance.
const router = express.Router();

// TODO setup your api routes here
router.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});
  
router.post('/users', async (req, res) => {
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
    }

    if(errors.length > 0){
        res.status(400).json({ errors });
    } else {
        await User.create(user);
        res.location('/').status(201).end();
    }
});
  
router.get('/courses', async (req, res) => {
    const courses = await Course.findAll();
    res.json(courses);
});

router.get('/courses/:id', async (req, res) => {
    //returns course and user that owns the course for the provided course ID
    const course = await Course.findByPk(req.params.id);
    res.json(course)
});

router.post('/courses', async (req, res) => {
    const course = await Course.create(req.body)
    res.location('/').status(201).end();
});

router.put('/courses', async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.update(req.body);
    res.status(204).end();
});

router.delete('/courses', async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy();
    res.status(204).end();
})

module.exports = router;