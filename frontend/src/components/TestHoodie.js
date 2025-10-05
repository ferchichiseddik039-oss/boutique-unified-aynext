import React, { useState } from 'react';

const TestHoodie = () => {
  const [color, setColor] = useState('#FFFFFF');

  const changeColor = (newColor) => {
    setColor(newColor);
    const hoodieElement = document.getElementById('test-hoodie');
    if (hoodieElement) {
      hoodieElement.style.filter = `hue-rotate(${getHueFromColor(newColor)}deg) saturate(${getSaturationFromColor(newColor)}%) brightness(${getBrightnessFromColor(newColor)}%)`;
    }
  };

  const getHueFromColor = (color) => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return hsl.h;
  };

  const getSaturationFromColor = (color) => {
    const rgb = hexToRgb(color);
    if (!rgb) return 100;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return hsl.s;
  };

  const getBrightnessFromColor = (color) => {
    const rgb = hexToRgb(color);
    if (!rgb) return 100;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return hsl.l;
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
      <h1>Test Capuche</h1>
      
      <div style={{ position: 'relative', width: '400px', margin: '0 auto' }}>
        <div 
          id="test-hoodie"
          style={{ 
            width: '100%',
            height: '400px',
            position: 'relative',
            backgroundImage: `url('/hoodie-base.jpg')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        >
          {/* Couche de couleur */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: color,
              mixBlendMode: 'multiply',
              opacity: 0.7
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          Choisir couleur :
          <input 
            type="color" 
            value={color}
            onChange={(e) => changeColor(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => changeColor('#FF0000')} style={{ margin: '5px', padding: '10px', background: '#FF0000', color: 'white', border: 'none', borderRadius: '5px' }}>Rouge</button>
        <button onClick={() => changeColor('#0000FF')} style={{ margin: '5px', padding: '10px', background: '#0000FF', color: 'white', border: 'none', borderRadius: '5px' }}>Bleu</button>
        <button onClick={() => changeColor('#00FF00')} style={{ margin: '5px', padding: '10px', background: '#00FF00', color: 'white', border: 'none', borderRadius: '5px' }}>Vert</button>
        <button onClick={() => changeColor('#FFFFFF')} style={{ margin: '5px', padding: '10px', background: '#FFFFFF', color: 'black', border: '1px solid #ccc', borderRadius: '5px' }}>Blanc</button>
      </div>
    </div>
  );
};

export default TestHoodie;
