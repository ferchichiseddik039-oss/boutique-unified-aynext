import React from 'react';
import { FaTools, FaClock } from 'react-icons/fa';
import { useSettings } from '../contexts/SettingsContext';

const MaintenanceMode = () => {
  const { isMaintenanceMode, getMaintenanceMessage, getShopInfo } = useSettings();

  if (!isMaintenanceMode()) {
    return null;
  }

  const shopInfo = getShopInfo();
  const message = getMaintenanceMessage();

  return (
    <div className="maintenance-mode">
      <div className="maintenance-container">
        <div className="maintenance-content">
          <div className="maintenance-icon">
            <FaTools />
          </div>
          
          <h1 className="maintenance-title">
            {shopInfo.nomBoutique || 'AYNEXT'}
          </h1>
          
          <h2 className="maintenance-subtitle">
            Site en maintenance
          </h2>
          
          <div className="maintenance-message">
            <FaClock className="clock-icon" />
            <p>{message}</p>
          </div>
          
          <div className="maintenance-info">
            <p>Nous travaillons pour améliorer votre expérience.</p>
            <p>Merci de votre patience !</p>
          </div>
          
          <div className="maintenance-contact">
            <p>Pour toute urgence, contactez-nous :</p>
            <p>
              <strong>Email :</strong> {shopInfo.email || 'contact@aynext.com'}
            </p>
            {shopInfo.telephone && (
              <p>
                <strong>Téléphone :</strong> {shopInfo.telephone}
              </p>
            )}
          </div>
        </div>
        
        <div className="maintenance-footer">
          <p>&copy; 2024 {shopInfo.nomBoutique || 'AYNEXT'}. Tous droits réservés.</p>
        </div>
      </div>
      
      <style jsx>{`
        .maintenance-mode {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .maintenance-container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .maintenance-icon {
          font-size: 4rem;
          color: #667eea;
          margin-bottom: 20px;
          animation: rotate 2s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .maintenance-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 10px 0;
        }
        
        .maintenance-subtitle {
          font-size: 1.5rem;
          color: #667eea;
          margin: 0 0 30px 0;
          font-weight: 600;
        }
        
        .maintenance-message {
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .clock-icon {
          color: #667eea;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .maintenance-message p {
          margin: 0;
          font-size: 1.1rem;
          color: #495057;
          line-height: 1.6;
        }
        
        .maintenance-info {
          margin: 30px 0;
          color: #6c757d;
          line-height: 1.6;
        }
        
        .maintenance-info p {
          margin: 10px 0;
        }
        
        .maintenance-contact {
          background: #e9ecef;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          text-align: left;
        }
        
        .maintenance-contact p {
          margin: 8px 0;
          color: #495057;
        }
        
        .maintenance-contact strong {
          color: #2c3e50;
        }
        
        .maintenance-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .maintenance-container {
            padding: 30px 20px;
            margin: 20px;
          }
          
          .maintenance-title {
            font-size: 2rem;
          }
          
          .maintenance-subtitle {
            font-size: 1.2rem;
          }
          
          .maintenance-icon {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceMode;
