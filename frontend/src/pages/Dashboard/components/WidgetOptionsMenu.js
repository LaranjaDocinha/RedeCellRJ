import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WidgetOptionsMenu.scss';

const WidgetOptionsMenu = ({ onRemove = () => {}, onExpand = () => {}, onExport = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const createHandler = (action) => () => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="widget-options-menu" ref={menuRef}>
      <button className="widget-options-btn" onClick={() => setIsOpen(!isOpen)}>
        <i className="ri-more-2-fill"></i>
      </button>
      {isOpen && (
        <div className="options-dropdown">
          <ul>
            <li onClick={createHandler(onExpand)}>
              <i className="ri-fullscreen-line"></i> Expandir
            </li>
            <li onClick={createHandler(onExport)}>
              <i className="ri-download-2-line"></i> Exportar
            </li>
            <li className="separator"></li>
            <li onClick={createHandler(onRemove)} className="danger">
              <i className="ri-delete-bin-line"></i> Remover
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

WidgetOptionsMenu.propTypes = {
  onRemove: PropTypes.func,
  onExpand: PropTypes.func,
  onExport: PropTypes.func,
};

export default WidgetOptionsMenu;
