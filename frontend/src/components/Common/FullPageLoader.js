import React from 'react';
import Lottie from 'react-lottie';

import animationData from '../../assets/lottie/loading-animation.json';
import './FullPageLoader.scss';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

const FullPageLoader = () => {
  return (
    <div className='full-page-loader'>
      <Lottie height={200} options={defaultOptions} width={200} />
      <p>Carregando...</p>
    </div>
  );
};

export default FullPageLoader;
