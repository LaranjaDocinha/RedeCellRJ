
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const LanguageButton = styled.button<{ active?: boolean }>`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.onSurface};
  cursor: pointer;
  font-size: 0.9rem;
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  opacity: ${({ active }) => (active ? 1 : 0.6)};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};

  &:hover {
    opacity: 1;
  }
`;

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <LanguageButton active={i18n.language === 'en'} onClick={() => changeLanguage('en')}>
        EN
      </LanguageButton>
      <LanguageButton active={i18n.language === 'pt'} onClick={() => changeLanguage('pt')}>
        PT
      </LanguageButton>
    </div>
  );
};

export default LanguageSwitcher;
