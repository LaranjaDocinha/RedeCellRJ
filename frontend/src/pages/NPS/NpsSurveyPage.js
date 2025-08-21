import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { motion, AnimatePresence } from 'framer-motion';
import NPSScoreSelector from '../../components/NPS/NPSScoreSelector';
import FeedbackTextArea from '../../components/NPS/FeedbackTextArea';
import ThankYouMessage from '../../components/NPS/ThankYouMessage';
import { toast } from 'react-toastify';
import './NpsSurveyPage.scss'; // Assuming a SCSS file for styling

const NpsSurveyPage = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0: score, 1: feedback, 2: thank you
  const [score, setScore] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScoreSelect = (selectedScore) => {
    setScore(selectedScore);
    setCurrentStep(1); // Move to feedback step
  };

  const handleSubmitFeedback = async () => {
    if (score === null) {
      toast.error('Por favor, selecione uma pontuação.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real application, you'd get customer_id, source, related_sale_id, related_repair_id
      // from URL parameters or other context. For this example, we'll use dummy data.
      const payload = {
        customer_id: 1, // Dummy customer ID
        score: score,
        feedback_text: feedbackText,
        source: 'web_survey',
        related_sale_id: null,
        related_repair_id: null,
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/nps-surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to submit NPS survey');
      }

      setCurrentStep(2); // Move to thank you step
    } catch (err) {
      console.error('Error submitting NPS survey:', err);
      setError(err.message);
      toast.error(`Erro ao enviar pesquisa: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <NPSScoreSelector
            onSelectScore={handleScoreSelect}
            selectedScore={score}
          />
        );
      case 1:
        return (
          <>
            <FeedbackTextArea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Gostaríamos de saber mais sobre sua experiência (opcional)..."
              animationDelay={0.1}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mt-4"
            >
              <Button
                color="primary"
                onClick={handleSubmitFeedback}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Feedback'}
              </Button>
            </motion.div>
          </>
        );
      case 2:
        return (
          <ThankYouMessage
            message="Sua opinião é muito importante para nós e nos ajuda a melhorar continuamente!"
            animationDelay={0.1}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container fluid className="nps-survey-page d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </Col>
      </Row>
    </Container>
  );
};

export default NpsSurveyPage;