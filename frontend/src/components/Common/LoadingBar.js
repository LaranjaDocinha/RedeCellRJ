
import React, { useEffect, useState } from 'react';
import './LoadingBar.scss';

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (visible) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 200);
    } else {
      setProgress(0);
    }

    return () => {
      clearInterval(timer);
    };
  }, [visible]);

  // Exemplo de como você pode controlar a visibilidade da barra de carregamento
  // Em uma aplicação real, você usaria um contexto ou Redux para isso.
  // Por exemplo, um interceptor Axios para mostrar/esconder a barra.
  // Para demonstração, vamos usar um setTimeout.
  useEffect(() => {
    const showTimeout = setTimeout(() => setVisible(true), 1000);
    const hideTimeout = setTimeout(() => setVisible(false), 5000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="loading-bar-container">
      <div className="loading-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default LoadingBar;
