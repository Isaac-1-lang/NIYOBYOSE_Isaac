const express = require('express');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3200;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request body validation middleware
const validateStudentInput = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: 'Request body is missing'
    });
  }

  const { name, grade } = req.body;

  if (!name || !grade) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both name and grade'
    });
  }

  if (typeof grade !== 'number' || grade < 0 || grade > 100) {
    return res.status(400).json({
      success: false,
      message: 'Grade must be a number between 0 and 100'
    });
  }

  next();
};

// In-memory storage for students
const students = [];

/**
 * Student class representing a student entity
 */
class Student {
  constructor(name, grade) {
    this.id = uuidv4();
    this.name = name;
    this.grade = grade;
    this.createdAt = new Date();
  }

  /**
   * Update student details
   * @param {string} name - Student's name
   * @param {number} grade - Student's grade
   */
  updateDetails(name, grade) {
    this.name = name;
    this.grade = grade;
    this.updatedAt = new Date();
  }
}

/**
 * Get all students
 * @route GET /students
 */
const getAllStudents = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

/**
 * Get a single student by ID
 * @route GET /students/:id
 */
const getStudentById = async (req, res) => {
  try {
    const student = students.find(s => s.id === req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

/**
 * Create a new student
 * @route POST /students
 */
const createStudent = async (req, res) => {
  try {
    const { name, grade } = req.body;
    const student = new Student(name, grade);
    students.push(student);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    });
  }
};

/**
 * Update a student
 * @route PUT /students/:id
 */
const updateStudent = async (req, res) => {
  try {
    const { name, grade } = req.body;
    const studentIndex = students.findIndex(s => s.id === req.params.id);

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Input validation
    if (!name && !grade) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update'
      });
    }

    if (grade && (typeof grade !== 'number' || grade < 0 || grade > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Grade must be a number between 0 and 100'
      });
    }

    const student = students[studentIndex];
    student.updateDetails(name || student.name, grade || student.grade);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    });
  }
};

/**
 * Delete a student
 * @route DELETE /students/:id
 */
const deleteStudent = async (req, res) => {
  try {
    const studentIndex = students.findIndex(s => s.id === req.params.id);

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    students.splice(studentIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
};

// Routes
app.get('/students', getAllStudents);
app.get('/students/:id', getStudentById);
app.post('/students', validateStudentInput, createStudent);
app.put('/students/:id', validateStudentInput, updateStudent);
app.delete('/students/:id', deleteStudent);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


