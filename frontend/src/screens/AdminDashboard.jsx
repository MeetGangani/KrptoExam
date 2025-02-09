import { useState, useEffect } from 'react';
import { Table, Button, Badge, Container, Row, Col, Card, Alert, Modal, Form, Spinner, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import AdminUserCreate from './AdminUserCreate';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  useEffect(() => {
    Promise.all([fetchRequests(), fetchStats()])
      .finally(() => setLoading(false));
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/admin/requests');
      setRequests(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch requests');
      setRequests([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch statistics');
      setStats(null);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setAdminComment('Approved by admin');
    setShowModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setShowModal(true);
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedRequest) return;

    setActionLoading(true);
    setProcessingStatus('Initiating process...');

    try {
      setProcessingStatus('Encrypting and uploading to IPFS...');
      
      const response = await axios.put(`/api/admin/requests/${selectedRequest._id}`, {
        status,
        adminComment
      });

      setProcessingStatus('Finalizing...');
      
      // Update the local state
      setRequests(requests.map(req => 
        req._id === selectedRequest._id 
          ? { ...req, status: response.data.status }
          : req
      ));

      // Refresh stats
      await fetchStats();
      
      setShowModal(false);
      setSelectedRequest(null);
      setAdminComment('');
      setError(null);

    } catch (error) {
      console.error('Error updating status:', error);
      setError(`Failed to ${status} request: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(false);
      setProcessingStatus('');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  if (loading) {
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
      
      <Tabs defaultActiveKey="dashboard" className="mb-3">
        <Tab eventKey="dashboard" title="Dashboard">
          {/* Stats Section */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>Total Requests</Card.Title>
                  <h2>{stats?.totalRequests || 0}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>Pending Requests</Card.Title>
                  <h2>{stats?.pendingRequests || 0}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>Approved Requests</Card.Title>
                  <h2>{stats?.approvedRequests || 0}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Requests Table */}
          <h2>File Requests</h2>
          {requests.length === 0 ? (
            <Alert variant="info">No requests found.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Institute</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.fileName}</td>
                    <td>{request.institute?.name}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleApprove(request)}
                            disabled={actionLoading}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(request)}
                            disabled={actionLoading}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        <Tab eventKey="users" title="Manage Users">
          <AdminUserCreate />
        </Tab>
      </Tabs>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => !actionLoading && setShowModal(false)}>
        <Modal.Header closeButton={!actionLoading}>
          <Modal.Title>
            {selectedRequest?.status === 'pending' ? 'Approve' : 'Reject'} Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group>
            <Form.Label>Admin Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              disabled={actionLoading}
              required
            />
          </Form.Group>

          {actionLoading && processingStatus && (
            <Alert variant="info" className="mt-3">
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                className="me-2"
              />
              {processingStatus}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant={selectedRequest?.status === 'pending' ? 'success' : 'danger'}
            onClick={() => handleStatusUpdate(selectedRequest?.status === 'pending' ? 'approved' : 'rejected')}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              selectedRequest?.status === 'pending' ? 'Approve' : 'Reject'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
