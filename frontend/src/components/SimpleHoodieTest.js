import React, { useState } from 'react';

const SimpleHoodieTest = () => {
  const [color, setColor] = useState('#FF0000');

  const changeColor = (newColor) => {
    setColor(newColor);
    const hoodieElement = document.getElementById('simple-hoodie');
    if (hoodieElement) {
      const rgb = hexToRgb(newColor);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hoodieElement.style.filter = `hue-rotate(${hsl.h}deg) saturate(${hsl.s}%) brightness(${hsl.l}%) contrast(1.2)`;
      }
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  return (
    <div style={{ padding: '20px', background: '#222', color: 'white', textAlign: 'center' }}>
      <h1>Test Simple Capuche</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <img 
          id="simple-hoodie"
          src="/hoodie-realistic.svg" 
          alt="Hoodie" 
          style={{ 
            width: '300px',
            height: 'auto',
            border: '2px solid white',
            borderRadius: '10px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          Choisir couleur :
          <input 
            type="color" 
            value={color}
            onChange={(e) => changeColor(e.target.value)}
            style={{ marginLeft: '10px', width: '50px', height: '30px' }}
          />
        </label>
      </div>

      <div>
        <button onClick={() => changeColor('#FF0000')} style={{ margin: '5px', padding: '10px', background: '#FF0000', color: 'white', border: 'none', borderRadius: '5px' }}>Rouge</button>
        <button onClick={() => changeColor('#0000FF')} style={{ margin: '5px', padding: '10px', background: '#0000FF', color: 'white', border: 'none', borderRadius: '5px' }}>Bleu</button>
        <button onClick={() => changeColor('#00FF00')} style={{ margin: '5px', padding: '10px', background: '#00FF00', color: 'white', border: 'none', borderRadius: '5px' }}>Vert</button>
        <button onClick={() => changeColor('#FFFFFF')} style={{ margin: '5px', padding: '10px', background: '#FFFFFF', color: 'black', border: '1px solid #ccc', borderRadius: '5px' }}>Blanc</button>
        <button onClick={() => changeColor('#000000')} style={{ margin: '5px', padding: '10px', background: '#000000', color: 'white', border: 'none', borderRadius: '5px' }}>Noir</button>
      </div>
    </div>
  );
};

export default SimpleHoodieTest;
