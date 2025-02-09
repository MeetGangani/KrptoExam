import asyncHandler from 'express-async-handler';
import FileRequest from '../models/fileRequestModel.js';
import ExamResponse from '../models/examResponseModel.js';
import { decryptFromIPFS } from '../utils/encryptionUtils.js';
import sendEmail from '../utils/emailUtils.js';
import axios from 'axios';

// Get available exams for students
const getAvailableExams = asyncHandler(async (req, res) => {
  try {
    // Find all approved exams that the student hasn't attempted yet
    const attemptedExams = await ExamResponse.find({ 
      student: req.user._id 
    }).select('exam');

    const attemptedExamIds = attemptedExams.map(response => response.exam);

    const availableExams = await FileRequest.find({
      status: 'approved',
      _id: { $nin: attemptedExamIds }
    }).select('examName timeLimit totalQuestions ipfsHash').lean();

    res.json(availableExams);
  } catch (error) {
    console.error('Error fetching available exams:', error);
    res.status(500);
    throw new Error('Failed to fetch available exams');
  }
});

// Start exam with IPFS hash
const startExam = asyncHandler(async (req, res) => {
  const { ipfsHash } = req.body;

  try {
    // Find the exam using IPFS hash
    const exam = await FileRequest.findOne({
      ipfsHash: ipfsHash,
      status: 'approved'
    });

    if (!exam) {
      res.status(404);
      throw new Error('Exam not found or not approved');
    }

    // Check if student has already attempted this exam
    const existingAttempt = await ExamResponse.findOne({
      exam: exam._id,
      student: req.user._id
    });

    if (existingAttempt) {
      res.status(400);
      throw new Error('You have already attempted this exam');
    }

    try {
      console.log('Fetching exam data from IPFS...');
      // Fetch encrypted data from IPFS
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      
      if (!response.data || !response.data.iv || !response.data.encryptedData) {
        throw new Error('Invalid data format from IPFS');
      }

      console.log('Decrypting exam data...');
      // Decrypt the exam data using the stored IPFS encryption key
      const decryptedData = decryptFromIPFS(response.data, exam.ipfsEncryptionKey);
      
      if (!decryptedData || !decryptedData.questions) {
        throw new Error('Invalid exam data structure');
      }

      // Validate questions format
      if (!Array.isArray(decryptedData.questions)) {
        throw new Error('Invalid questions format');
      }

      console.log('Preparing exam data for student...');
      // Return exam data without correct answers
      const sanitizedQuestions = decryptedData.questions.map(q => ({
        text: q.question,
        options: q.options
      }));

      res.json({
        _id: exam._id,
        examName: exam.examName,
        timeLimit: exam.timeLimit,
        totalQuestions: exam.totalQuestions,
        questions: sanitizedQuestions
      });

    } catch (error) {
      console.error('Exam start error:', error);
      res.status(500);
      throw new Error('Failed to start exam: ' + error.message);
    }

  } catch (error) {
    console.error('Start exam error:', error);
    res.status(error.status || 500);
    throw new Error(`Failed to start exam: ${error.message}`);
  }
});

// Submit exam
const submitExam = asyncHandler(async (req, res) => {
  const { examId, answers } = req.body;

  try {
    console.log('Submitting exam:', { examId, answers });
    
    const exam = await FileRequest.findById(examId);
    if (!exam) {
      res.status(404);
      throw new Error('Exam not found');
    }

    // Get the decrypted exam data to check answers
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${exam.ipfsHash}`);
    const decryptedData = decryptFromIPFS(response.data, exam.ipfsEncryptionKey);

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = decryptedData.questions.length;

    // Check each answer
    Object.entries(answers).forEach(([questionIndex, studentAnswer]) => {
      const question = decryptedData.questions[parseInt(questionIndex)];
      const correctAnswer = question.correctAnswer;
      
      console.log(`Question ${parseInt(questionIndex) + 1}:`, {
        studentAnswer,
        correctAnswer,
        isCorrect: studentAnswer === correctAnswer
      });

      if (studentAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;

    console.log('Score calculation:', {
      correctAnswers,
      totalQuestions,
      score
    });

    // Create and save exam response
    const examResponse = await ExamResponse.create({
      student: req.user._id,
      exam: examId,
      answers,
      score,
      correctAnswers,
      totalQuestions,
      submittedAt: Date.now()
    });

    console.log('Created exam response:', examResponse);

    // Return response
    const completeResponse = {
      message: 'Exam submitted successfully',
      examResponse: {
        _id: examResponse._id,
        exam: {
          _id: exam._id,
          examName: exam.examName,
          resultsReleased: exam.resultsReleased || false
        },
        score,
        correctAnswers,
        totalQuestions,
        submittedAt: examResponse.submittedAt
      }
    };

    console.log('Sending response:', completeResponse);
    res.json(completeResponse);

  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500);
    throw new Error('Failed to submit exam');
  }
});

// Release results
const releaseResults = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await FileRequest.findOne({
      _id: examId,
      institute: req.user._id
    });

    if (!exam) {
      res.status(404);
      throw new Error('Exam not found');
    }

    exam.resultsReleased = true;
    await exam.save();

    // Get all responses for this exam with student details
    const responses = await ExamResponse.find({ exam: examId })
      .populate('student', 'email name');

    // Send email notifications
    for (const response of responses) {
      if (response.student && response.student.email) {
        try {
          await sendEmail({
            to: response.student.email,
            subject: `Exam Results Available - ${exam.examName}`,
            text: `
              Your results for ${exam.examName} are now available.
              
              Score: ${response.score.toFixed(2)}%
              Correct Answers: ${response.correctAnswers} out of ${response.totalQuestions}
              
              You can view your detailed results on the student dashboard.
            `
          });
        } catch (emailError) {
          console.error('Email notification error:', emailError);
        }
      }
    }

    res.json({ 
      message: 'Results released successfully',
      examId: exam._id
    });

  } catch (error) {
    console.error('Release results error:', error);
    res.status(500);
    throw new Error('Failed to release results');
  }
});

// Get my results (for student)
const getMyResults = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching results for student:', req.user._id);
    
    const results = await ExamResponse.find({ 
      student: req.user._id 
    })
    .populate({
      path: 'exam',
      select: 'examName resultsReleased'
    })
    .select('score correctAnswers totalQuestions submittedAt')
    .sort('-submittedAt')
    .lean();

    console.log('Raw results from DB:', results);

    const formattedResults = results.map(result => ({
      _id: result._id,
      exam: {
        examName: result.exam?.examName || 'N/A',
        resultsReleased: result.exam?.resultsReleased || false
      },
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      submittedAt: result.submittedAt
    }));

    console.log('Formatted results:', formattedResults);
    res.json(formattedResults);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500);
    throw new Error('Failed to fetch exam results');
  }
});

// Get exam results (for institute)
const getExamResults = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await FileRequest.findOne({
      _id: examId,
      institute: req.user._id
    });

    if (!exam) {
      res.status(404);
      throw new Error('Exam not found');
    }

    const results = await ExamResponse.find({ exam: examId })
      .populate('student', 'name email')
      .sort('-submittedAt')
      .select('score correctAnswers totalQuestions submittedAt');

    res.json(results);
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500);
    throw new Error('Failed to fetch exam results');
  }
});

export {
  getAvailableExams,
  startExam,
  submitExam,
  releaseResults,
  getMyResults,
  getExamResults
}; 