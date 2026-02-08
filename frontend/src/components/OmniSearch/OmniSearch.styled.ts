import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const fadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.96); }
  100% { opacity: 1; transform: scale(1); }
`;

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
`;

export const Container = styled(motion.div)`
  width: 100%;
  max-width: 850px; /* Wider for Split View */
  background: ${({ theme }) => theme.colors?.surface || '#ffffff'};
  border-radius: 12px;
  box-shadow: 0 16px 70px rgba(0, 0, 0, 0.25);
  border: 1px solid ${({ theme }) => theme.colors?.border || 'rgba(0,0,0,0.1)'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.2s ease-out;
  position: relative;
  max-height: 600px;

  [cmdk-root] {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || 'rgba(0,0,0,0.06)'};
  flex-shrink: 0;
`;

export const SearchIconWrapper = styled.div`
  color: ${({ theme }) => theme.colors?.textSecondary || '#888'};
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 18px;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.colors?.textSecondary || '#aaa'};
  }
`;

export const ShortcutHint = styled.span`
  background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
  color: ${({ theme }) => theme.colors?.textSecondary || '#888'};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
`;

export const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  height: 500px; /* Fixed height for split view stability */
`;

export const ListColumn = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  border-right: 1px solid ${({ theme }) => theme.colors?.border || 'rgba(0,0,0,0.06)'};
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.border || '#e0e0e0'};
    border-radius: 3px;
  }
`;

export const PreviewColumn = styled.div`
  width: 320px;
  background: ${({ theme }) => theme.colors?.background || '#f9fafb'};
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
`;

export const GroupTitle = styled.div`
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.textSecondary || '#888'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
`;

export const Item = styled(motion.div)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.1s ease;
  background: ${({ $active, theme }) => 
    $active ? (theme.colors?.primaryLight || 'rgba(0, 123, 255, 0.08)') : 'transparent'};
  color: ${({ $active, theme }) => 
    $active ? (theme.colors?.primary || '#007bff') : (theme.colors?.text || '#333')};
  margin-bottom: 2px;
  
  /* CMDK attributes styling hook */
  &[data-selected='true'] {
    background: ${({ theme }) => theme.colors?.primary || '#007bff'};
    color: #fff;

    svg {
      color: #fff;
    }
  }
`;

export const ItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
`;

export const IconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: inherit;
  opacity: 0.7;
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ItemTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ItemSubtitle = styled.span`
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ActionPanel = styled.div`
  padding: 10px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || 'rgba(0,0,0,0.06)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors?.surface || '#fff'};
  font-size: 11px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  flex-shrink: 0;
`;

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ActionKey = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  kbd {
    background: ${({ theme }) => theme.colors?.background || '#f3f4f6'};
    border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
    border-radius: 4px;
    padding: 2px 5px;
    min-width: 18px;
    text-align: center;
    box-shadow: 0 1px 1px rgba(0,0,0,0.05);
    font-family: monospace;
    font-weight: 600;
    font-size: 10px;
  }
`;

export const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors?.textSecondary || '#888'};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

/* Preview Components */
export const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
`;

export const PreviewImage = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors?.surface || '#fff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${({ theme }) => theme.colors?.primary || '#007bff'};
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

export const PreviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
  margin: 0;
  line-height: 1.3;
`;

export const PreviewSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  margin: 4px 0 0 0;
`;

export const PreviewSection = styled.div`
  margin-top: 12px;
`;

export const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.textSecondary || '#999'};
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors?.surface || '#fff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const InfoLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#888'};
`;

export const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#333'};
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Tag = styled.span<{ $color?: string }>`
  background: ${({ $color, theme }) => $color ? `${$color}20` : (theme.colors?.background || '#eee')};
  color: ${({ $color, theme }) => $color || (theme.colors?.text || '#555')};
  border: 1px solid ${({ $color, theme }) => $color ? `${$color}40` : 'transparent'};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;
