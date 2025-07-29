import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  height: 100%;
`;

const ActivityFeedWrapper = styled.div`
  height: calc(100% - 40px); // Subtrai a altura do título
  overflow-y: auto;
`;

const RecentActivityFeed = ({ activities }) => {
  return (
    <StyledCard className='dashboard-activity-card'>
      <CardBody>
        <CardTitle className='h5'>Atividade Recente</CardTitle>
        <ActivityFeedWrapper className='activity-feed'>
          {activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id || index}
                animate={{ opacity: 1, y: 0 }}
                className='activity-item mb-3 pb-3 border-bottom'
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <p className='mb-1'>
                  <span className='fw-bold'>{activity.user}</span> {activity.description}
                </p>
                <small className='text-muted'>
                  {new Date(activity.timestamp).toLocaleString()}
                </small>
              </motion.div>
            ))
          ) : (
            <div className='text-center text-muted py-4'>Nenhuma atividade recente.</div>
          )}
        </ActivityFeedWrapper>
      </CardBody>
    </StyledCard>
  );
};

export default RecentActivityFeed;
