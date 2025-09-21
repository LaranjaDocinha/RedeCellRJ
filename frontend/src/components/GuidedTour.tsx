
import React, { useEffect, useState } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface GuidedTourProps {
  tourKey: string;
  steps: any[];
}

const GuidedTour: React.FC<GuidedTourProps> = ({ tourKey, steps }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [tourStarted, setTourStarted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return; // Only show tour if authenticated

    const hasTourBeenShown = localStorage.getItem(tourKey);

    if (!hasTourBeenShown && !tourStarted) {
      const intro = introJs();
      intro.setOptions({
        steps: steps,
        showBullets: false,
        showProgress: true,
        exitOnOverlayClick: false,
        disableInteraction: true,
        tooltipClass: 'custom-introjs-tooltip',
        highlightClass: 'custom-introjs-highlight',
      });

      // Ensure elements are rendered before starting the tour
      const checkElements = setInterval(() => {
        const allElementsExist = steps.every(step => {
          if (step.element) {
            return document.querySelector(step.element);
          }
          return true; // If no element specified, assume it's always there
        });

        if (allElementsExist) {
          clearInterval(checkElements);
          intro.start();
          setTourStarted(true);
          localStorage.setItem(tourKey, 'true');
        }
      }, 500);

      intro.onexit(() => {
        setTourStarted(false);
      });

      intro.oncomplete(() => {
        setTourStarted(false);
      });

      return () => clearInterval(checkElements);
    }
  }, [isAuthenticated, tourKey, steps, tourStarted, location.pathname]); // Rerun effect if path changes

  return null; // This component doesn't render anything directly
};

export default GuidedTour;
