import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

import animationData from '../../assets/lottie/loading-animation.json'; // Você precisará de um arquivo JSON de animação Lottie
import './FullPageLoader.scss';

const FullPageLoader = () => {
  return (
    <div className='full-page-loader'>
      <Player autoplay loop src={animationData} style={{ height: '120px', width: '120px' }} />
      <p className='mt-3'>Carregando...</p>
    </div>
  );
};

export default FullPageLoader;
