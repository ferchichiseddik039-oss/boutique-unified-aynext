import React, { useState, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/SimpleHoodieDesigner.css';

const SimpleHoodieDesigner = ({ onClose }) => {
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(100);
  const fileInputRef = useRef(null);

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedLogo(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setUploadedLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getHoodieStyle = () => {
    // Convertir la couleur hex en valeurs RGB
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculer la teinte pour hue-rotate
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue = 0;
    
    if (max !== min) {
      const d = max - min;
      if (max === r) hue = ((g - b) / d) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
    }
    
    const hueDegrees = Math.round(hue * 60);
    
    return {
      filter: `hue-rotate(${hueDegrees}deg) saturate(1.2) brightness(1.1)`
    };
  };

  return (
    <div className="simple-hoodie-designer">
      <button onClick={onClose} className="close-btn">
        <FaTimes />
      </button>
      
      <h1>Personnalise ta capuche</h1>
      
      <div className="hoodie-container">
        <div 
          className="hoodie"
          style={{
            ...getHoodieStyle(),
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Cdefs%3E%3Cstyle%3E.hoodie-body%7Bfill:%23ffffff%3Bstroke:%23e0e0e0%3Bstroke-width:2%7D.hoodie-hood%7Bfill:%23ffffff%3Bstroke:%23e0e0e0%3Bstroke-width:2%7D.hoodie-pocket%7Bfill:%23ffffff%3Bstroke:%23e0e0e0%3Bstroke-width:2%7D.hoodie-sleeve%7Bfill:%23ffffff%3Bstroke:%23e0e0e0%3Bstroke-width:2%7D%3C/style%3E%3C/defs%3E%3C!-- Corps principal --%3E%3Crect x='120' y='200' width='160' height='200' rx='10' class='hoodie-body'/%3E%3C!-- Capuche --%3E%3Cpath d='M120 200 Q200 150 280 200 L280 220 Q200 170 120 220 Z' class='hoodie-hood'/%3E%3C!-- Poche kangourou --%3E%3Crect x='140' y='350' width='120' height='40' rx='5' class='hoodie-pocket'/%3E%3C!-- Manche gauche --%3E%3Crect x='80' y='220' width='40' height='120' rx='20' class='hoodie-sleeve'/%3E%3C!-- Manche droite --%3E%3Crect x='280' y='220' width='40' height='120' rx='20' class='hoodie-sleeve'/%3E%3C!-- Cordons --%3E%3Cline x1='180' y1='200' x2='180' y2='250' stroke='%23ffffff' stroke-width='3'/%3E%3Cline x1='220' y1='200' x2='220' y2='250' stroke='%23ffffff' stroke-width='3'/%3E%3C!-- Embouts des cordons --%3E%3Ccircle cx='180' cy='250' r='3' fill='%23333'/%3E%3Ccircle cx='220' cy='250' r='3' fill='%23333'/%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '100%',
            height: '400px'
          }}
        />
        {uploadedLogo && (
          <img 
            id="logo" 
            src={uploadedLogo} 
            alt="Logo" 
            className="logo"
            style={{
              width: `${logoSize}px`,
              height: `${logoSize}px`
            }}
          />
        )}
      </div>

      <div className="controls">
        <label>Choisir couleur :
          <input 
            type="color" 
            id="colorPicker" 
            value={selectedColor}
            onChange={handleColorChange}
          />
        </label>
        
        <label>Ajouter logo :
          <input 
            type="file" 
            id="logoUploader" 
            accept="image/*"
            onChange={handleLogoUpload}
            ref={fileInputRef}
          />
        </label>
      </div>
    </div>
  );
};

export default SimpleHoodieDesigner;
