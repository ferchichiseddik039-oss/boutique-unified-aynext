import React from 'react';

const AynextLogo = ({ size = 'w-12 h-12', className = '' }) => {
  return (
    <div className={`${size} ${className} relative`}>
      <img
        src="/logo-aynext.png"
        alt="AYNEXT Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default AynextLogo;
