import React, { useState } from 'react';
import { useForm } from 'react-hook-form'; // Assuming react-hook-form is used for forms
import './NpsSurveyPage.scss'; // For page-specific styling

const NpsSurveyPage = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [submissionStatus, setSubmissionStatus] = useState(''); // 'success', 'error', ''

    const onSubmit = async (data) => {
        console.log('NPS Survey submitted:', data);
        // In a real application, you'd send this data to your backend API
        // For now, simulate an API call
        try {
            // const response = await fetch('/api/nps-surveys', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(data),
            // });
            // if (response.ok) {
            //     setSubmissionStatus('success');
            //     reset();
            // } else {
            //     setSubmissionStatus('error');
            // }
            setSubmissionStatus('success'); // Simulate success
            reset();
        } catch (error) {
            console.error('Error submitting NPS survey:', error);
            setSubmissionStatus('error');
        }
    };

    return (
        <div className="nps-survey-page">
            <div className="survey-container">
                <h1>Pesquisa de Satisfação (NPS)</h1>
                <p>Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa a um amigo ou colega?</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group score-selection">
                        {[...Array(11).keys()].map(score => (
                            <label key={score} className="score-option">
                                <input
                                    type="radio"
                                    value={score}
                                    {...register('score', { required: 'Por favor, selecione uma pontuação.' })}
                                />
                                <span>{score}</span>
                            </label>
                        ))}
                        {errors.score && <span className="error-message">{errors.score.message}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="feedback_text">Você gostaria de adicionar algum comentário?</label>
                        <textarea
                            id="feedback_text"
                            rows="4"
                            {...register('feedback_text')}
                            placeholder="Seu feedback é muito importante para nós..."
                        ></textarea>
                    </div>

                    {/* Hidden fields for customer_id and source (would be passed via props or context in a real app) */}
                    <input type="hidden" {...register('customer_id')} value="1" /> {/* Dummy customer ID */}
                    <input type="hidden" {...register('source')} value="Web" /> {/* Dummy source */}

                    <button type="submit" className="btn btn-primary">Enviar Resposta</button>

                    {submissionStatus === 'success' && (
                        <p className="submission-message success">Obrigado pelo seu feedback!</p>
                    )}
                    {submissionStatus === 'error' && (
                        <p className="submission-message error">Ocorreu um erro ao enviar sua resposta. Por favor, tente novamente.</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default NpsSurveyPage;
