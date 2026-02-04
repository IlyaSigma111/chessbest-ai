import React from 'react';
import { Color, PieceType } from '../types';

interface PieceIconProps {
  type: PieceType;
  color: Color;
  className?: string;
}

const PieceIcon: React.FC<PieceIconProps> = ({ type, color, className }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#FFFFFF' : '#334155'; // White or Slate-700
  const stroke = isWhite ? '#334155' : '#FFFFFF'; // Dark stroke for white, White stroke for black
  
  const getPath = () => {
    switch (type) {
      case 'p':
        return (
          <g>
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
          </g>
        );
      case 'r':
        return (
          <g>
             <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" style={{strokeLinecap: 'round', strokeLinejoin: 'round'}} />
             <path d="M34 14l-3 3H14l-3-3"/>
             <path d="M31 17v12.5c0 2.481-1.519 4.5-3.4 4.5H17.4c-1.881 0-3.4-2.019-3.4-4.5V17"/>
             <path d="M12 32h21"/>
          </g>
        );
      case 'n':
        return (
          <g>
             {/* Base: Standard rectangular slab */}
             <path 
               d="M9 36 h27 v3 h-27 z" 
               style={{strokeLinecap: 'round', strokeLinejoin: 'round'}} 
             />
             
             {/* Body: Classic Staunton silhouette */}
             {/* Starts bottom right, goes up the back (mane), ears, nose, jaw, chest, bottom left */}
             <path 
               d="M 29.5 36 
                  C 31.5 26, 30 16, 26 10 
                  L 23 7 
                  L 20.5 9 
                  Q 15 9, 13 14 
                  L 12.5 17 
                  C 12.5 19, 14 20.5, 16 20.5 
                  C 17 20.5, 17.5 20, 18 19 
                  C 18 22, 16 26, 14.5 36 
                  Z"
               style={{strokeLinejoin: 'round'}} 
             />
             
             {/* Eye: Correctly placed near the forehead/nose bridge */}
             <circle cx="17.5" cy="13.5" r="1.5" style={{fill: stroke, stroke: 'none'}} />
             
             {/* Mane Detail: Adds depth to the neck */}
             <path d="M 23 12 C 25 16, 25 22, 23.5 28" style={{fill: 'none', stroke: stroke, strokeWidth: 1.5, strokeLinecap: 'round'}} />
          </g>
        );
      case 'b':
         return (
           <g>
             <g style={{ strokeLinecap: 'round', strokeLinejoin:'round'}}>
                <path d="M9 36c3.39-.97 9.11-1.45 13.5-1.45 4.39 0 10.11.48 13.5 1.45V32H9v4zm0-4h27v-3H9v3z"/>
                <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
                <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
             </g>
             <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" style={{fill: 'none', stroke: stroke, strokeLinejoin:'round'}} />
           </g>
         );
      case 'q':
        return (
          <g>
            <g style={{ strokeLinecap: 'round', strokeLinejoin:'round'}}>
               <circle cx="6" cy="12" r="2" transform="translate(0,0)" />
               <circle cx="14" cy="9" r="2" transform="translate(0,0)" />
               <circle cx="22.5" cy="8" r="2" transform="translate(0,0)" />
               <circle cx="31" cy="9" r="2" transform="translate(0,0)" />
               <circle cx="39" cy="12" r="2" transform="translate(0,0)" />
               <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z"/>
               <path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 3 2.5 3 2.5H30.5s2 0 3-2.5c1-2 2.5-2 2.5-4-8.5 1.5-18.5 1.5-27 0z"/>
               <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/>
            </g>
          </g>
        );
      case 'k':
         return (
           <g>
              <g style={{ strokeLinecap: 'round', strokeLinejoin:'round'}}>
                <path d="M22.5 11.63V6M20 8h5"/>
                <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
                <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 5.5-5 5.5l-6-2.5-5.5 2.5-5.5-2.5-6 2.5s-1-6.5-5-5.5c-3 6 6 10.5 6 10.5v7z"/>
                <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/>
              </g>
           </g>
         );
      default:
        return null;
    }
  };

  return (
    <svg 
      viewBox="0 0 45 45" 
      className={`w-full h-full drop-shadow-md ${className}`}
      style={{ filter: isWhite ? 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' : 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))' }}
    >
      <g style={{ fill: fill, stroke: stroke, strokeWidth: 1.5, strokeLinejoin: 'round' }}>
        {getPath()}
      </g>
    </svg>
  );
};

export default PieceIcon;