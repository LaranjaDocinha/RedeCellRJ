import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './Skeletons.scss';

const KPISkeleton = ({ cards = 4 }) => {
  return (
    <div className="kpi-skeleton-container">
      {Array(cards).fill(0).map((_, index) => (
        <div className="kpi-skeleton-card" key={index}>
          <Skeleton circle width={48} height={48} />
          <div className="skeleton-text">
            <Skeleton width={100} />
            <Skeleton width={60} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPISkeleton;
