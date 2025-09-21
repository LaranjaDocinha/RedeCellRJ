
import React from 'react';
import { LoadingContainer, Spinner, LoadingText } from './Loading.styled';

const Loading: React.FC = () => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>Loading...</LoadingText>
    </LoadingContainer>
  );
};

export default Loading;

