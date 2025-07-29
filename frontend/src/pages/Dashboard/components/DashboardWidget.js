import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

import useWidgetData from '../../../hooks/useWidgetData';

import WidgetError from './WidgetError';
import WidgetEmpty from './WidgetEmpty';
import WidgetOptionsMenu from './WidgetOptionsMenu';
import ListSkeleton from './skeletons/ListSkeleton';
import ChartSkeleton from './skeletons/ChartSkeleton';
import KPISkeleton from './skeletons/KPISkeleton';

const SKELETON_MAP = {
  kpi: KPISkeleton,
  donut: ChartSkeleton,
  bar: ChartSkeleton,
  list: ListSkeleton,
};

const DashboardWidget = ({
  title,
  widgetId,
  skeletonType = 'list',
  children,
  onRemove = () => {},
  onExpand,
  isFocused = false,
}) => {
  const { data, isLoading, error } = useWidgetData(widgetId);

  const renderContent = () => {
    if (isLoading) {
      const SkeletonComponent = SKELETON_MAP[skeletonType] || ListSkeleton;
      return <SkeletonComponent type={skeletonType} />;
    }
    if (error) {
      // In a real app, we might want a retry mechanism here.
      return <WidgetError onRetry={() => window.location.reload()} />;
    }
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <WidgetEmpty />;
    }
    // Clone the child component and pass the fetched data to it.
    return React.cloneElement(children, { data, isFocused });
  };

  return (
    <motion.div
      layout
      animate={{ opacity: 1, y: 0 }}
      className={`dashboard-widget ${isFocused ? 'is-focused' : ''}`}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      whileHover={!isFocused ? { scale: 1.02, y: -5, zIndex: 10 } : {}}
    >
      <div className='widget-header'>
        <div className='widget-header-left'>
          {!isFocused && <i className='bx bx-move drag-handle-icon'></i>}
          <h3>{title}</h3>
        </div>
        {!isFocused && (
          <div className='widget-header-right'>
            <WidgetOptionsMenu onExpand={onExpand} onRemove={onRemove} />
          </div>
        )}
      </div>
      <div className='widget-body'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={`${widgetId}-${isLoading}-${!!error}`}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

DashboardWidget.propTypes = {
  title: PropTypes.string.isRequired,
  widgetId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onRemove: PropTypes.func,
  onExpand: PropTypes.func,
  isFocused: PropTypes.bool,
  skeletonType: PropTypes.oneOf(['list', 'donut', 'bar', 'kpi']),
};

export default DashboardWidget;
