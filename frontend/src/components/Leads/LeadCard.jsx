import React from 'react';
import PropTypes from 'prop-types';
import './LeadCard.scss';

const LeadCard = ({ lead, onClick }) => {
    const { name, email, phone, source, status } = lead;

    return (
        <div className="lead-card" onClick={() => onClick(lead)} onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(lead); }} role="button" tabIndex="0">
            <div className="lead-card-header">
                <h3>{name}</h3>
                <span className={`lead-status status-${status.toLowerCase().replace(/\s/g, '-')}`}>{status}</span>
            </div>
            <div className="lead-card-body">
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Telefone:</strong> {phone}</p>
                <p><strong>Origem:</strong> {source}</p>
            </div>
            <div className="lead-card-footer">
                {/* Add actions like Edit, Convert, Delete here */}
                <button className="btn btn-sm btn-primary">Ver Detalhes</button>
            </div>
        </div>
    );
};

LeadCard.propTypes = {
    lead: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string,
        phone: PropTypes.string,
        source: PropTypes.string,
        status: PropTypes.string,
        notes: PropTypes.string,
        created_at: PropTypes.string,
        updated_at: PropTypes.string,
    }).isRequired,
    onClick: PropTypes.func,
};

LeadCard.defaultProps = {
    onClick: () => {},
};

export default LeadCard;
