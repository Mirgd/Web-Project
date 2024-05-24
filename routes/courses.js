const express = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Add a new course
router.post('/', auth, async (req, res) => {
    const { title, description, credits, url } = req.body;
    try {
        const newCourse = new Course({ title, description, credits, url });
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Update a course
router.put('/:id', auth, async (req, res) => {
    const { title, description, credits, url } = req.body;
    try {
        let course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        course.title = title || course.title;
        course.description = description || course.description;
        course.credits = credits || course.credits;
        course.url = url || course.url;

        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Delete a course
router.delete('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        await course.remove();
        res.json({ msg: 'Course removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
