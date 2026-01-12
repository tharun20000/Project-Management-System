import styled, { keyframes } from "styled-components";

// --- Magic Card (Rotating Gradient Border) ---
const rot = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const MagicCard = styled.div`
  width: 100%;
  position: relative;
  border-radius: 20px;
  background: ${({ theme }) => theme.bgLighter};
  padding: 2px; /* The border thickness */
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(133, 76, 230, 0.2);
  }

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      transparent, 
      ${({ theme }) => theme.primary}, 
      transparent 30%
    );
    animation: ${rot} 4s linear infinite;
    z-index: 0;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 2px;
    background: ${({ theme }) => theme.bgLighter};
    border-radius: 18px;
    z-index: 1;
  }
`;

export const MagicCardContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// --- Galaxy Button ---
const shine = keyframes`
  0% { left: -100px; }
  20% { left: 100%; }
  100% { left: 100%; }
`;

export const GalaxyButton = styled.button`
  position: relative;
  padding: 16px 32px;
  border-radius: 16px;
  border: none;
  color: white;
  cursor: pointer;
  background: linear-gradient(90deg, #854CE6, #6A38C2);
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(133, 76, 230, 0.3);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100px;
    width: 50px;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    transform: skewX(-30deg);
    animation: ${shine} 4s infinite;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 30px rgba(133, 76, 230, 0.5);
  }

  &:active {
    transform: scale(0.98);
  }
`;

// --- Premium Loader ---
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const PremiumLoader = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(133, 76, 230, 0.3);
  border-radius: 50%;
  border-top-color: #854CE6;
  animation: ${spin} 1s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(133, 76, 230, 0.5);
`;

// --- Premium Progress Bar ---
export const PremiumProgress = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.bg}; /* Or a slightly lighter/darker shade */
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ value }) => value}%;
    background: linear-gradient(90deg, #854CE6, #C77DFF);
    border-radius: 10px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px rgba(133, 76, 230, 0.4);
  }
`;
