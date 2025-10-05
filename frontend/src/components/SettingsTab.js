import React, { useState, useEffect } from 'react';
import { FaSave, FaUndo, FaInfo, FaTruck, FaCreditCard, FaGlobe, FaUpload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../config/axios';

const SettingsTab = ({ onRefresh }) => {
  const [settings, setSettings] = useState({
    informationsGenerales: {
      nomBoutique: 'AYNEXT',
      description: 'Boutique de vêtements tendance',
      email: 'contact@aynext.com',
      telephone: '+216 XX XXX XXX',
      adresse: {
        rue: 'Rue de la Mode',
        ville: 'Tunis',
        codePostal: '1000',
        pays: 'Tunisie'
      },
      logo: ''
    },
    livraison: {
      fraisLivraison: 5.9,
      fraisLivraisonGratuite: 100,
      delaiLivraison: '3-5 jours ouvrables',
      zonesLivraison: [],
      livraisonGratuite: true
    },
    paiement: {
      methodesActives: ['carte', 'paypal', 'virement', 'especes'],
      informationsPaiement: {
        carte: {
          active: true,
          nom: 'Carte bancaire',
          description: 'Visa, Mastercard, American Express'
        },
        paypal: {
          active: true,
          nom: 'PayPal',
          description: 'Paiement sécurisé via PayPal'
        },
        virement: {
          active: true,
          nom: 'Virement bancaire',
          description: 'Virement bancaire direct'
        },
        especes: {
          active: true,
          nom: 'Espèces à la livraison',
          description: 'Paiement en espèces lors de la livraison'
        }
      }
    },
    general: {
      devise: 'TND',
      langue: 'fr',
      fuseauHoraire: 'Africa/Tunis',
      maintenance: {
        active: false,
        message: 'Site en maintenance. Revenez bientôt !'
      }
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZone, setNewZone] = useState({ nom: '', frais: 0, delai: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      const settingsData = response.data;
      
      // Forcer seulement le nom de la boutique à "AYNEXT" (l'email reste modifiable)
      if (settingsData.informationsGenerales) {
        settingsData.informationsGenerales.nomBoutique = 'AYNEXT';
      }
      
      setSettings(settingsData);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section = null) => {
    try {
      setSaving(true);
      
      if (section) {
        // Sauvegarder une section spécifique
        console.log(`💾 Sauvegarde section ${section}:`, settings[section]);
        // Test avec route simple d'abord
        if (section === 'livraison') {
          console.log('🧪 Test avec route simple...');
          const testResponse = await api.put('/settings/test', settings[section]);
          console.log('✅ Test réussi:', testResponse.data);
        }
        await api.put(`/api/settings/${section}`, settings[section]);
        toast.success(`Paramètres ${section} mis à jour avec succès`);
      } else {
        // Sauvegarder tous les paramètres
        // S'assurer que le nom de la boutique reste "AYNEXT" (l'email reste modifiable)
        const settingsToSave = {
          ...settings,
          informationsGenerales: {
            ...settings.informationsGenerales,
            nomBoutique: 'AYNEXT'
          }
        };
        await api.put('/settings', settingsToSave);
        toast.success('Paramètres mis à jour avec succès');
      }
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      toast.error(`Erreur lors de la sauvegarde: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      try {
        setSaving(true);
        await api.post('/settings/reset');
        await fetchSettings();
        toast.success('Paramètres réinitialisés avec succès');
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        toast.error('Erreur lors de la réinitialisation des paramètres');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleInputChange = (section, field, value) => {
    // Empêcher la modification du nom de la boutique
    if (section === 'informationsGenerales' && field === 'nomBoutique') {
      return; // Ne pas permettre la modification
    }
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handlePaymentMethodToggle = (method) => {
    setSettings(prev => ({
      ...prev,
      paiement: {
        ...prev.paiement,
        methodesActives: (prev.paiement?.methodesActives || []).includes(method)
          ? (prev.paiement?.methodesActives || []).filter(m => m !== method)
          : [...(prev.paiement?.methodesActives || []), method]
      }
    }));
  };

  const addDeliveryZone = () => {
    if (newZone.nom && newZone.frais >= 0 && newZone.delai) {
      setSettings(prev => ({
        ...prev,
        livraison: {
          ...prev.livraison,
          zonesLivraison: [...(prev.livraison?.zonesLivraison || []), { ...newZone }]
        }
      }));
      setNewZone({ nom: '', frais: 0, delai: '' });
      setShowZoneModal(false);
    }
  };

  const removeDeliveryZone = (index) => {
    setSettings(prev => ({
      ...prev,
        livraison: {
          ...prev.livraison,
          zonesLivraison: (prev.livraison?.zonesLivraison || []).filter((_, i) => i !== index)
        }
    }));
  };

  if (loading) {
    return (
      <div className="settings-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-tab">
      <div className="settings-header">
        <h1>Paramètres de la boutique</h1>
        <p>Configurez les paramètres de votre boutique en ligne</p>
        <div className="settings-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={saving}
          >
            <FaUndo /> Réinitialiser
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => handleSave()}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Sauvegarde...' : 'Sauvegarder tout'}
          </button>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="settings-nav">
            <button 
              className={`nav-item ${activeSection === 'general' ? 'active' : ''}`}
              onClick={() => setActiveSection('general')}
            >
              <FaInfo /> Informations générales
            </button>
            <button 
              className={`nav-item ${activeSection === 'livraison' ? 'active' : ''}`}
              onClick={() => setActiveSection('livraison')}
            >
              <FaTruck /> Livraison
            </button>
            <button 
              className={`nav-item ${activeSection === 'paiement' ? 'active' : ''}`}
              onClick={() => setActiveSection('paiement')}
            >
              <FaCreditCard /> Paiement
            </button>
          </div>
        </div>

        <div className="settings-content">
          {/* Informations générales */}
          {activeSection === 'general' && (
            <div className="settings-section">
              <h2>Informations générales</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>Nom de la boutique</label>
                  <input
                    type="text"
                    value="AYNEXT"
                    readOnly
                    className="readonly-field"
                    style={{
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      cursor: 'not-allowed',
                      border: '1px solid #dee2e6'
                    }}
                  />
                  <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                    Le nom de la boutique ne peut pas être modifié
                  </small>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={settings.informationsGenerales?.description || ''}
                    onChange={(e) => handleInputChange('informationsGenerales', 'description', e.target.value)}
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={settings.informationsGenerales?.email || ''}
                      onChange={(e) => handleInputChange('informationsGenerales', 'email', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="text"
                      value={settings.informationsGenerales?.telephone || ''}
                      onChange={(e) => handleInputChange('informationsGenerales', 'telephone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Adresse</label>
                  <div className="address-fields">
                    <input
                      type="text"
                      placeholder="Rue"
                      value={settings.informationsGenerales?.adresse?.rue || ''}
                      onChange={(e) => handleNestedInputChange('informationsGenerales', 'adresse', 'rue', e.target.value)}
                    />
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Ville"
                        value={settings.informationsGenerales?.adresse?.ville || ''}
                        onChange={(e) => handleNestedInputChange('informationsGenerales', 'adresse', 'ville', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Code postal"
                        value={settings.informationsGenerales?.adresse?.codePostal || ''}
                        onChange={(e) => handleNestedInputChange('informationsGenerales', 'adresse', 'codePostal', e.target.value)}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Pays"
                      value={settings.informationsGenerales?.adresse?.pays || ''}
                      onChange={(e) => handleNestedInputChange('informationsGenerales', 'adresse', 'pays', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Devise</label>
                  <select
                    value={settings.general?.devise || 'TND'}
                    onChange={(e) => handleInputChange('general', 'devise', e.target.value)}
                  >
                    <option value="TND">TND (Dinar tunisien)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar américain)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Langue</label>
                  <select
                    value={settings.general?.langue || 'fr'}
                    onChange={(e) => handleInputChange('general', 'langue', e.target.value)}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.general?.maintenance?.active || false}
                      onChange={(e) => handleNestedInputChange('general', 'maintenance', 'active', e.target.checked)}
                    />
                    Mode maintenance
                  </label>
                  {settings.general?.maintenance?.active && (
                    <textarea
                      placeholder="Message de maintenance"
                      value={settings.general?.maintenance?.message || ''}
                      onChange={(e) => handleNestedInputChange('general', 'maintenance', 'message', e.target.value)}
                      rows="2"
                    />
                  )}
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => handleSave('general')}
                  disabled={saving}
                >
                  <FaSave /> Sauvegarder les informations générales
                </button>
              </div>
            </div>
          )}

          {/* Livraison */}
          {activeSection === 'livraison' && (
            <div className="settings-section">
              <h2>Paramètres de livraison</h2>
              <div className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Frais de livraison (TND)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={settings.livraison?.fraisLivraison || 5.9}
                      onChange={(e) => handleInputChange('livraison', 'fraisLivraison', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Seuil livraison gratuite (TND)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={settings.livraison?.fraisLivraisonGratuite || 100}
                      onChange={(e) => handleInputChange('livraison', 'fraisLivraisonGratuite', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Délai de livraison</label>
                  <input
                    type="text"
                    value={settings.livraison?.delaiLivraison || '3-5 jours ouvrables'}
                    onChange={(e) => handleInputChange('livraison', 'delaiLivraison', e.target.value)}
                    placeholder="ex: 3-5 jours ouvrables"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.livraison?.livraisonGratuite || true}
                      onChange={(e) => handleInputChange('livraison', 'livraisonGratuite', e.target.checked)}
                    />
                    Proposer la livraison gratuite
                  </label>
                </div>

                <div className="form-group">
                  <label>Zones de livraison</label>
                  <div className="zones-list">
                    {(settings.livraison?.zonesLivraison || []).map((zone, index) => (
                      <div key={index} className="zone-item">
                        <div className="zone-info">
                          <strong>{zone.nom}</strong>
                          <span>{zone.frais} TND - {zone.delai}</span>
                        </div>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => removeDeliveryZone(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowZoneModal(true)}
                    >
                      Ajouter une zone
                    </button>
                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => handleSave('livraison')}
                  disabled={saving}
                >
                  <FaSave /> Sauvegarder les paramètres de livraison
                </button>
              </div>
            </div>
          )}

          {/* Paiement */}
          {activeSection === 'paiement' && (
            <div className="settings-section">
              <h2>Méthodes de paiement</h2>
              <div className="settings-form">
                <div className="payment-methods">
                  {Object.entries(settings.paiement?.informationsPaiement || {}).map(([key, method]) => (
                    <div key={key} className="payment-method-card">
                      <div className="method-header">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={(settings.paiement?.methodesActives || []).includes(key)}
                            onChange={() => handlePaymentMethodToggle(key)}
                          />
                          <strong>{method?.nom || key}</strong>
                        </label>
                      </div>
                      <div className="method-details">
                        <input
                          type="text"
                          value={method?.nom || ''}
                          onChange={(e) => handleNestedInputChange('paiement', 'informationsPaiement', key, { ...method, nom: e.target.value })}
                          placeholder="Nom de la méthode"
                        />
                        <textarea
                          value={method?.description || ''}
                          onChange={(e) => handleNestedInputChange('paiement', 'informationsPaiement', key, { ...method, description: e.target.value })}
                          placeholder="Description"
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => handleSave('paiement')}
                  disabled={saving}
                >
                  <FaSave /> Sauvegarder les méthodes de paiement
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal pour ajouter une zone de livraison */}
      {showZoneModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Ajouter une zone de livraison</h3>
              <button onClick={() => setShowZoneModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom de la zone</label>
                <input
                  type="text"
                  value={newZone.nom}
                  onChange={(e) => setNewZone({ ...newZone, nom: e.target.value })}
                  placeholder="ex: Tunis Centre"
                />
              </div>
              <div className="form-group">
                <label>Frais (TND)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newZone.frais}
                  onChange={(e) => setNewZone({ ...newZone, frais: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Délai</label>
                <input
                  type="text"
                  value={newZone.delai}
                  onChange={(e) => setNewZone({ ...newZone, delai: e.target.value })}
                  placeholder="ex: 2-3 jours"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowZoneModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-primary"
                onClick={addDeliveryZone}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
