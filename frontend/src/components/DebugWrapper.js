import React from 'react';

// Composant de débogage pour détecter les objets rendus
const DebugWrapper = ({ children, name = 'Unknown' }) => {
  // Vérifier si children contient des objets
  const checkForObjects = (element) => {
    if (React.isValidElement(element)) {
      // Vérifier les props
      if (element.props && element.props.children) {
        if (typeof element.props.children === 'object' && !Array.isArray(element.props.children)) {
          console.error(`🚨 OBJET DÉTECTÉ dans ${name}:`, element.props.children);
          return true;
        }
        if (Array.isArray(element.props.children)) {
          return element.props.children.some(child => checkForObjects(child));
        }
      }
    }
    return false;
  };

  // Temporairement désactivé pour le débogage du panier
  // React.useEffect(() => {
  //   checkForObjects(children);
  // }, [children]);

  return children;
};

export default DebugWrapper;
