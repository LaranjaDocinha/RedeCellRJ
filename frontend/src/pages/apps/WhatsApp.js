import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Input, Button, ListGroup, ListGroupItem } from 'reactstrap';
import axios from 'axios';
import io from 'socket.io-client'; // Import socket.io-client

const WhatsAppIntegration = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();

    // Establish Socket.IO connection
    const socket = io('http://localhost:5000'); // Connect to your backend Socket.IO server

    socket.on('connect', () => {
      // console.log('Connected to Socket.IO server');
    });

    socket.on('new_whatsapp_message', (message) => {
      // console.log('New WhatsApp message received:', message);
      // If the new message belongs to the currently selected conversation, update messages
      if (selectedConversation && message.conversation_id === selectedConversation.conversation_id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      // Also, re-fetch conversations to update last message timestamp or unread count
      fetchConversations();
    });

    socket.on('disconnect', () => {
      // console.log('Disconnected from Socket.IO server');
    });

    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, [selectedConversation]); // Re-run effect if selectedConversation changes to update message listener

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/whatsapp/conversations');
      setConversations(response.data.conversations);
    } catch (err) {
      setError('Failed to fetch conversations.');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/whatsapp/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
    } catch (err) {
      setError('Failed to fetch messages.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conversation_id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Assuming 'to' is the customer_id for now. In a real app, it would be the customer's phone number.
      const customerId = selectedConversation.customer_id; 
      await axios.post('/api/whatsapp/messages/send', { to: customerId, message: newMessage });
      setNewMessage('');
      // Messages will be updated via Socket.IO event, no need to re-fetch here
    } catch (err) {
      setError('Failed to send message.');
      console.error('Error sending message:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h2 className="mb-4">Integração WhatsApp</h2>
          <p className="text-muted">Gerencie suas conversas e campanhas do WhatsApp.</p>
        </Col>
      </Row>
      <Row className="mt-4">
        {/* Conversations List */}
        <Col md="4">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Conversas Recentes</CardTitle>
              <ListGroup flush>
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <ListGroupItem
                      key={conv.conversation_id}
                      action
                      active={selectedConversation && selectedConversation.conversation_id === conv.conversation_id}
                      onClick={() => handleConversationSelect(conv)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {/* Display customer name or ID */}
                      {conv.customer_id || 'Unknown Customer'}
                      <span className="badge bg-primary rounded-pill">{/* Unread count */}</span>
                    </ListGroupItem>
                  ))
                ) : (
                  <ListGroupItem>Nenhuma conversa encontrada.</ListGroupItem>
                )}
              </ListGroup>
            </CardBody>
          </Card>
        </Col>

        {/* Chat Window and Customer Details */}
        <Col md="8">
          <Card>
            <CardBody className="d-flex flex-column" style={{ height: '600px' }}>
              {selectedConversation ? (
                <>
                  <CardTitle tag="h5" className="border-bottom pb-2">
                    Conversa com {selectedConversation.customer_id || 'Unknown Customer'}
                  </CardTitle>
                  {/* Customer Details Placeholder */}
                  <div className="mb-3 p-2 bg-light rounded">
                    <h6>Detalhes do Cliente:</h6>
                    <p>ID: {selectedConversation.customer_id}</p>
                    <p>Última Mensagem: {new Date(selectedConversation.last_message_timestamp).toLocaleString()}</p>
                    {/* Add more customer details here, fetched from your customer API */}
                  </div>

                  {/* Messages Display */}
                  <div className="flex-grow-1 overflow-auto mb-3 p-2 border rounded">
                    {messages.length > 0 ? (
                      messages.map((msg) => (
                        <div key={msg.message_id} className={`d-flex ${msg.direction === 'outbound' ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                          <div className={`p-2 rounded ${msg.direction === 'outbound' ? 'bg-primary text-white' : 'bg-light border'}`}>
                            <p className="mb-0">{msg.message_content}</p>
                            <small className="text-muted" style={{ fontSize: '0.75em' }}>{new Date(msg.timestamp).toLocaleString()}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted">Nenhuma mensagem nesta conversa.</p>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="mt-auto d-flex">
                    <Input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      className="me-2"
                    />
                    <Button color="primary" onClick={handleSendMessage}>Enviar</Button>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted">Selecione uma conversa para começar.</p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WhatsAppIntegration;
