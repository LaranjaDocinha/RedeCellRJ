import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './Skeletons.scss';

const ListSkeleton = ({ rows = 4 }) => {
  return (
    <div className='skeleton-container'>
      {Array(rows)
        .fill(0)
        .map((_, index) => (
          <div key={index} className='list-skeleton-item'>
            <Skeleton circle height={40} width={40} />
            <div className='skeleton-text'>
              <Skeleton width={`80%`} />
              <Skeleton width={`50%`} />
            </div>
          </div>
        ))}
    </div>
  );
};

export default ListSkeleton;
