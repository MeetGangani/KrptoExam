import { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Card, Tab, Tabs, Table, Badge, Spinner, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const StudentDashboard = () => {
  const [availableExams, setAvailableExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('start');
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    fetchExams();
    fetchResults();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exams/available');
      setAvailableExams(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to fetch available exams');
    }
  };

  const fetchResults = async () => {
    try {
      const response = await axios.get('/api/exams/my-results');
      setExamResults(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to fetch exam results');
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (e) => {
    e.preventDefault();
    if (!ipfsHash.trim()) {
      setError('Please enter an IPFS hash');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting exam with IPFS hash:', ipfsHash.trim());
      const response = await axios.post('/api/exams/start', { 
        ipfsHash: ipfsHash.trim() 
      });

      if (!response.data || !response.data.questions) {
        throw new Error('Invalid exam data received');
      }

      console.log('Exam data received successfully');
      setCurrentExam(response.data);
      setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
      setAnswers({});
      setActiveTab('exam');
      setIpfsHash(''); // Clear the input

      // Start the timer
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            submitExam(); // Auto-submit when time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Cleanup timer on unmount or exam completion
      return () => clearInterval(timer);

    } catch (error) {
      console.error('Start exam error:', error);
      setError(error.response?.data?.message || 'Failed to start exam. Please check the IPFS hash and try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async () => {
    try {
      setExamSubmitting(true);
      const response = await axios.post('/api/exams/submit', {
        examId: currentExam._id,
        answers
      });
      
      console.log('Submit response:', response.data);
      
      // Update the results immediately with the new submission
      if (response.data.examResponse) {
        setExamResults(prevResults => [
          {
            ...response.data.examResponse,
            exam: {
              examName: currentExam.examName,
              resultsReleased: false
            }
          },
          ...prevResults
        ]);
      }
      
      setCurrentExam(null);
      setAnswers({});
      setActiveTab('results');
      setError(null);
    } catch (error) {
      console.error('Submit exam error:', error);
      setError(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setExamSubmitting(false);
    }
  };

  const renderAvailableExams = () => (
    <div>
      <h2>Available Exams</h2>
      {availableExams.length === 0 ? (
        <Alert variant="info">No exams available at the moment.</Alert>
      ) : (
        <div className="d-grid gap-3">
          {availableExams.map((exam) => (
            <Card key={exam._id}>
              <Card.Body>
                <Card.Title>{exam.examName}</Card.Title>
                <Card.Text>
                  Total Questions: {exam.totalQuestions}<br />
                  Time Limit: {exam.timeLimit} minutes
                </Card.Text>
                <Button 
                  variant="primary" 
                  onClick={() => startExam(exam._id)}
                  disabled={loading}
                >
                  Start Exam
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderExam = () => {
    if (!currentExam || !currentExam.questions) return null;

    const currentQuestion = currentExam.questions[currentQuestionIndex];
    const totalQuestions = currentExam.questions.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    return (
      <div>
        <h2>{currentExam.examName}</h2>
        <Alert variant={timeLeft < 300 ? 'warning' : 'info'}>
          Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </Alert>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>
              {Object.keys(answers).length} of {totalQuestions} answered
            </span>
          </div>
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              aria-valuenow={currentQuestionIndex + 1}
              aria-valuemin="0"
              aria-valuemax={totalQuestions}
            />
          </div>
        </div>

        <Card className="mb-3">
          <Card.Body>
            <Card.Title>
              <strong>Question {currentQuestionIndex + 1}:</strong> {currentQuestion.text}
            </Card.Title>
            <Form>
              {currentQuestion.options.map((option, optionIndex) => (
                <Form.Check
                  key={optionIndex}
                  type="radio"
                  id={`q${currentQuestionIndex}-o${optionIndex}`}
                  name={`question-${currentQuestionIndex}`}
                  label={`${String.fromCharCode(65 + optionIndex)}. ${option}`}
                  onChange={() => {
                    const adjustedIndex = optionIndex + 1;
                    setAnswers({ ...answers, [currentQuestionIndex]: adjustedIndex });
                  }}
                  checked={answers[currentQuestionIndex] === optionIndex + 1}
                  disabled={examSubmitting}
                  className="mb-2"
                />
              ))}
            </Form>
          </Card.Body>
        </Card>

        {/* Navigation and Submit Buttons */}
        <div className="d-flex justify-content-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={isFirstQuestion || examSubmitting}
          >
            Previous
          </Button>

          <div>
            {isLastQuestion ? (
              <Button
                variant="primary"
                onClick={submitExam}
                disabled={examSubmitting || Object.keys(answers).length !== totalQuestions}
              >
                {examSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Submitting...
                  </>
                ) : (
                  'Submit Exam'
                )}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={examSubmitting}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation Pills */}
        <div className="mt-4">
          <div className="d-flex flex-wrap gap-2">
            {currentExam.questions.map((_, index) => (
              <Button
                key={index}
                variant={answers[index] ? 'success' : 'outline-secondary'}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                disabled={examSubmitting}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResultsTab = () => (
    <div>
      <h2>My Results</h2>
      {examResults.length === 0 ? (
        <Alert variant="info">No exam results available.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Score</th>
              <th>Correct Answers</th>
              <th>Status</th>
              <th>Submission Date</th>
            </tr>
          </thead>
          <tbody>
            {examResults.map((result) => (
              <tr key={result._id}>
                <td>{result.exam?.examName || 'N/A'}</td>
                <td>
                  {result.exam?.resultsReleased ? (
                    `${result.score?.toFixed(2) || '0.00'}%`
                  ) : (
                    <Badge bg="warning">Pending</Badge>
                  )}
                </td>
                <td>
                  {result.exam?.resultsReleased ? (
                    `${result.correctAnswers} / ${result.totalQuestions}`
                  ) : (
                    <Badge bg="warning">Pending</Badge>
                  )}
                </td>
                <td>
                  <Badge bg={result.exam?.resultsReleased ? 'success' : 'warning'}>
                    {result.exam?.resultsReleased ? 'Released' : 'Pending'}
                  </Badge>
                </td>
                <td>{new Date(result.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );

  const renderStartExam = () => (
    <div>
      <h2>Start New Exam</h2>
      <Card className="mt-4">
        <Card.Body>
          <Form onSubmit={startExam}>
            <Form.Group className="mb-3">
              <Form.Label>Enter Exam IPFS Hash</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Enter the IPFS hash provided by your institute"
                  value={ipfsHash}
                  onChange={(e) => setIpfsHash(e.target.value)}
                  disabled={loading}
                  required
                />
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={loading || !ipfsHash.trim()}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Loading...
                    </>
                  ) : (
                    'Start Exam'
                  )}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Contact your institute if you haven't received an IPFS hash.
              </Form.Text>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );

  if (loading && !currentExam) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="start" title="Start Exam">
          {renderStartExam()}
        </Tab>
        {currentExam && (
          <Tab eventKey="exam" title="Current Exam">
            {renderExam()}
          </Tab>
        )}
        <Tab eventKey="results" title="My Results">
          {renderResultsTab()}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default StudentDashboard;
