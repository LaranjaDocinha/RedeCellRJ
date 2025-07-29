import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useScrollDirection } from '../../../hooks/useScrollDirection';
import { useTheme } from '../../../context/ThemeContext';
import './FloatingActionButton.scss';

const predefinedColors = [
  '#556ee6', // Primary
  '#34c38f', // Success
  '#f1b44c', // Warning
  '#f46a6a', // Danger
  '#50a5f1', // Info
  '#FF6F00', // Custom Orange
];

const FloatingActionButton = ({ availableWidgets, onAddWidget, onResetLayout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const scrollDirection = useScrollDirection();
  const { theme, toggleTheme, setPrimaryColor } = useTheme();

  const isDisabled = availableWidgets.length === 0;

  useEffect(() => {
    if (scrollDirection === 'down') {
      setIsOpen(false);
    }
  }, [scrollDirection]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleColorChange = (color) => {
    setPrimaryColor(color);
    toast.success('Cor do tema alterada!');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    const newTheme = theme === 'light' ? 'Escuro' : 'Claro';
    toast.success(`Tema alterado para ${newTheme}`);
  };

  return (
    <motion.div
      ref={menuRef}
      animate={{ y: scrollDirection === 'down' ? 150 : 0 }}
      className='fab-container'
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate='visible'
            className='fab-menu'
            exit='hidden'
            initial='hidden'
            variants={menuVariants}
          >
            {/* Theme Toggle */}
            <motion.div className='fab-menu-item' variants={itemVariants}>
              <span className='fab-label'>Mudar Tema</span>
              <button onClick={handleThemeToggle}>
                <i className={theme === 'light' ? 'bx bx-moon' : 'bx bx-sun'}></i>
              </button>
            </motion.div>

            {/* Color Picker */}
            <motion.div className='fab-menu-item' variants={itemVariants}>
              <span className='fab-label'>Cor do Tema</span>
              <button>
                <i className='bx bx-palette'></i>
              </button>
              <div className='fab-submenu'>
                <div className='color-picker'>
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className='color-swatch'
                      style={{ backgroundColor: color }}
                      tabIndex={0}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Reset Layout Button */}
            <motion.div className='fab-menu-item' variants={itemVariants}>
              <span className='fab-label'>Resetar Layout</span>
              <button
                onClick={() => {
                  onResetLayout();
                  setIsOpen(false);
                }}
              >
                <i className='bx bx-reset'></i>
              </button>
            </motion.div>

            {/* Add Widget Submenu */}
            <motion.div className='fab-menu-item' variants={itemVariants}>
              <span className='fab-label'>Adicionar Widget</span>
              <button
                disabled={isDisabled}
                title={isDisabled ? 'Todos os widgets já estão no dashboard' : 'Adicionar widget'}
              >
                <i className='bx bx-plus'></i>
              </button>
              {!isDisabled && (
                <div className='fab-submenu'>
                  <ul>
                    {availableWidgets.map((widget) => (
                      <button
                        key={widget.id}
                        className='widget-item-button'
                        tabIndex={0}
                        onClick={() => {
                          onAddWidget(widget.id);
                          setIsOpen(false);
                        }}
                      >
                        {widget.title}
                      </button>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className='fab-main-button'
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.i
          animate={{ rotate: isOpen ? 360 : 0 }}
          className={isOpen ? 'bx bx-x' : 'bx bxs-magic-wand'}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </motion.div>
  );
};

FloatingActionButton.propTypes = {
  availableWidgets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onAddWidget: PropTypes.func.isRequired,
  onResetLayout: PropTypes.func.isRequired,
};

export default FloatingActionButton;
