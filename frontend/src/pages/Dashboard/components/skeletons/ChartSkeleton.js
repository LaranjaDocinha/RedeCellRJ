import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './Skeletons.scss';

const ChartSkeleton = ({ type = 'donut' }) => {
  return (
    <div className='skeleton-container chart-skeleton'>
      {type === 'donut' && <Skeleton circle height={180} width={180} />}
      {type === 'bar' && (
        <div className='bar-chart-skeleton'>
          <Skeleton height={180} width={40} />
          <Skeleton height={120} width={40} />
          <Skeleton height={160} width={40} />
          <Skeleton height={100} width={40} />
        </div>
      )}
    </div>
  );
};

export default ChartSkeleton;
