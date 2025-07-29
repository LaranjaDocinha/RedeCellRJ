import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const WidgetSkeleton = (props) => {
  // O react-loading-skeleton já se adapta bem a temas claros/escuros.
  return <Skeleton {...props} />;
};

export default WidgetSkeleton;
