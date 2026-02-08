import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface WhatsAppPreviewProps {
  content: string;
  variables?: Record<string, string>;
}

const PreviewContainer = styled(motion.div)`
  background-color: #e5ddd5;
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 360px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
    pointer-events: none;
  }
`;

const MessageBubble = styled(motion.div)`
  background-color: #dcf8c6;
  border-radius: 8px;
  padding: 8px 10px;
  position: relative;
  align-self: flex-end;
  max-width: 85%;
  margin-top: 10px;
  box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
  font-size: 14.2px;
  line-height: 19px;
  color: #303030;

  &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 10px 10px;
    border-color: transparent transparent transparent #dcf8c6;
  }
`;

const TimeStamp = styled.span`
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
  display: block;
  text-align: right;
  margin-top: 4px;
`;

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({ content, variables = {} }) => {
  let previewText = content;

  // Replace variables for preview
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    previewText = previewText.replace(regex, value);
  });

  // Highlight remaining variables (those not replaced)
  const parts = previewText.split(/({{.*?}})/g);

  return (
    <PreviewContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <MessageBubble>
        {parts.map((part, index) => {
          if (part.startsWith('{{') && part.endsWith('}}')) {
            return (
              <span key={index} style={{ color: '#009688', fontWeight: 400 }}>
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
        <TimeStamp>10:42</TimeStamp>
      </MessageBubble>
    </PreviewContainer>
  );
};

