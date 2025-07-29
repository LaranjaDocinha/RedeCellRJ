import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { motion } from 'framer-motion';

const RecentActivityFeed = ({ activities }) => {
  return (
    <Card className='dashboard-activity-card'>
      <CardBody>
        <CardTitle className='h5'>Atividade Recente</CardTitle>
        <div className='activity-feed' style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
        </div>
      </CardBody>
    </Card>
  );
};

export default RecentActivityFeed;
