import styled, { keyframes } from 'styled-components';

const borderBeam = keyframes`
  0%, 100% {
    offset-distance: 0%;
  }
  50% {
    offset-distance: 100%;
  }
`;

export const BorderBeam = styled.div<{ $size?: number; $duration?: number; $color?: string }>`
  pointer-events: none;
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: inherit;
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
  mask-image: linear-gradient(transparent, transparent), linear-gradient(#000, #000);

  &::after {
    content: "";
    position: absolute;
    aspect-ratio: 1;
    width: ${({ $size }) => $size || 100}px;
    offset-path: rect(0 auto auto 0 round ${({ $size }) => $size || 100}px);
    background: linear-gradient(to right, ${({ $color, theme }) => $color || theme.palette.primary.main}, transparent);
    animation: ${borderBeam} ${({ $duration }) => $duration || 3}s infinite linear;
  }
`;

/**
 * Nota: O efeito real de "Border Beam" em CSS moderno usa 'offset-path'.
 * Esta é uma implementação aproximada para navegadores modernos.
 */
export const BorderBeamContainer = styled.div`
  position: relative;
  border-radius: inherit;
`;
