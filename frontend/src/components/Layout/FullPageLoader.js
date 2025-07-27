import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../../assets/lottie/loading-animation.json'; // Você precisará de um arquivo JSON de animação Lottie
import './FullPageLoader.scss';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const FullPageLoader = () => {
  return (
    <div className="full-page-loader">
      <Lottie 
        options={defaultOptions}
        height={120}
        width={120}
      />
      <p className="mt-3">Carregando...</p>
    </div>
  );
};

export default FullPageLoader;
