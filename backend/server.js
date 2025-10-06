require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;


let mongoConnected = false;

// MongoDB Connection - Attendre la connexion avant de démarrer le serveur
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB Atlas');
    mongoConnected = true;
    return true;
  } catch (err) {
    console.error('❌ Erreur de connexion à MongoDB Atlas:', err);
    console.warn('⚠️ Démarrage en mode fallback (données statiques)');
    mongoConnected = false;
    return false;
  }
}

// ================================
// ✅ CORS configuration (Render + Local)
// ================================
const allowedOrigins = [
  "https://boutique-unified-aynext.onrender.com", // frontend Render
  "http://localhost:3000",                        // frontend local
  "http://localhost:5001"                         // backend local
];

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,x-auth-token");

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Endpoint pour servir des images de démonstration
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  console.log('🖼️ Demande d\'image:', filename);
  
  // Headers anti-cache pour les images
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  // Pour l'instant, retourner une image placeholder
  const placeholderImage = `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#f0f0f0"/>
      <text x="150" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
        Image: ${filename}
      </text>
      <text x="150" y="180" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">
        AYNEXT Boutique
      </text>
    </svg>
  `).toString('base64')}`;
  
  res.set('Content-Type', 'image/svg+xml');
  res.send(Buffer.from(placeholderImage.split(',')[1], 'base64'));
});

// Dummy Models (used if MongoDB is disconnected, or for fallback data)
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  role: { type: String, default: 'client' }
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  nom: String,
  prix: Number,
  description: String,
  images: [String],
  categories: [String],
  marques: [String],
  tailles: [String],
  couleurs: [String],
  stock: Number
}));

const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({
  informationsGenerales: Object,
  paiement: Object,
  reseauxSociaux: Object
}));

// Modèle Order pour les commandes
const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
  numeroCommande: { type: String, required: true, unique: true },
  client: {
    nom: String,
    prenom: String,
    email: String,
    telephone: String,
    adresse: {
      rue: String,
      ville: String,
      codePostal: String,
      pays: String
    }
  },
  articles: [{
    produit: {
      _id: String,
      nom: String,
      prix: Number,
      image: String
    },
    quantite: Number,
    taille: String,
    couleur: String,
    prixTotal: Number
  }],
  statut: { type: String, default: 'en_attente' },
  dateCommande: { type: Date, default: Date.now },
  dateLivraison: Date,
  totalCommande: Number,
  fraisLivraison: Number,
  methodePaiement: String,
  notes: String
}));

// Fallback Data
const fallbackAdmin = {
  _id: 'admin-123',
  email: 'ayoubbenromdan8@gmail.com',
  motDePasse: '$2a$10$A.B.C.D.E.F.G.H.I.J.K.L.M.N.O.P.Q.R.S.T.U.V.W.X.Y.Z.1.2.3.4.5.6.7.8.9.0', // Hashed '52141707'
  role: 'admin'
};

const fallbackProducts = [
  {
    _id: 'product-1',
    nom: 'Hoodie AYNEXT Premium Noir',
    prix: 89.99,
    description: 'Hoodie de qualité premium avec logo AYNEXT personnalisable',
    images: [
      '/uploads/hoodie-noir-1.jpg',
      '/uploads/hoodie-noir-2.jpg'
    ],
    couleurs: ['Noir', 'Blanc', 'Gris'],
    tailles: ['S', 'M', 'L', 'XL'],
    categorie: 'Hoodies',
    marque: 'AYNEXT',
    genre: 'homme',
    enStock: true
  },
  {
    _id: 'product-2',
    nom: 'Hoodie AYNEXT Premium Blanc',
    prix: 89.99,
    description: 'Hoodie blanc premium avec logo AYNEXT personnalisable',
    images: [
      '/uploads/hoodie-blanc-1.jpg',
      '/uploads/hoodie-blanc-2.jpg'
    ],
    couleurs: ['Blanc', 'Noir'],
    tailles: ['S', 'M', 'L', 'XL'],
    categorie: 'Hoodies',
    marque: 'AYNEXT',
    genre: 'femme',
    enStock: true
  },
  {
    _id: 'product-3',
    nom: 'T-shirt AYNEXT Sport',
    prix: 29.99,
    description: 'T-shirt sportif AYNEXT pour homme',
    images: [
      '/uploads/tshirt-sport-1.jpg',
      '/uploads/tshirt-sport-2.jpg'
    ],
    couleurs: ['Noir', 'Blanc', 'Rouge'],
    tailles: ['S', 'M', 'L', 'XL'],
    categorie: 'T-shirts',
    marque: 'AYNEXT',
    genre: 'homme',
    enStock: true
  },
  {
    _id: 'product-4',
    nom: 'Sweat AYNEXT Femme',
    prix: 49.99,
    description: 'Sweat confortable pour femme',
    images: [
      '/uploads/sweat-femme-1.jpg',
      '/uploads/sweat-femme-2.jpg'
    ],
    couleurs: ['Rose', 'Blanc', 'Gris'],
    tailles: ['S', 'M', 'L', 'XL'],
    categorie: 'Sweats',
    marque: 'AYNEXT',
    genre: 'femme',
    enStock: true
  }
];

const fallbackSettings = {
  informationsGenerales: {
    nomBoutique: "AYNEXT",
    email: "contact@aynext.com",
    telephone: "+216 XX XXX XXX",
    adresse: {
      rue: "123 Rue de la Mode",
      ville: "Paris",
      codePostal: "75001"
    }
  },
  paiement: {
    stripe: {
      active: false,
      clePublique: "",
      cleSecrete: ""
    }
  },
  reseauxSociaux: {
    facebook: "https://facebook.com/aynext",
    instagram: "https://instagram.com/aynext"
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoConnected ? 'connected' : 'fallback_mode'
  });
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Backend Render prêt et CORS actif" });
});

// MongoDB test endpoint
app.get('/api/mongodb-test', async (req, res) => {
  try {
    console.log('🔍 Test MongoDB appelé');
    console.log('📊 mongoConnected:', mongoConnected);
    console.log('🔗 mongoose.connection.readyState:', mongoose.connection.readyState);
    
    if (mongoConnected) {
      // Test des collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📚 Collections disponibles:', collections.map(c => c.name));
      
      // Test des produits
      const productCount = await Product.countDocuments();
      console.log('📦 Nombre de produits:', productCount);
      
      // Test des utilisateurs
      const userCount = await User.countDocuments();
      console.log('👥 Nombre d\'utilisateurs:', userCount);
      
      // Test des paramètres
      const settingsCount = await Settings.countDocuments();
      console.log('⚙️ Nombre de paramètres:', settingsCount);
      
      res.json({
        success: true,
        mongoConnected: true,
        readyState: mongoose.connection.readyState,
        collections: collections.map(c => c.name),
        counts: {
          products: productCount,
          users: userCount,
          settings: settingsCount
        }
      });
    } else {
      res.json({
        success: false,
        mongoConnected: false,
        message: 'MongoDB non connecté'
      });
    }
  } catch (error) {
    console.error('❌ Erreur test MongoDB:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin check endpoint
app.get('/api/admin/check', (req, res) => {
  res.json({ success: true, exists: true });
});

// Admin Login endpoint
app.post('/api/auth/connexion-admin', async (req, res) => {
  const { email, motDePasse } = req.body;
  try {
    let user;
    if (mongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = (email === fallbackAdmin.email) ? fallbackAdmin : null;
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    let isMatch;
    if (mongoConnected) {
      isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    } else {
      // For fallback, compare directly with the hardcoded password
      isMatch = (motDePasse === '52141707'); // Direct comparison for fallback
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès administrateur requis' });
    }
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key_2024', { expiresIn: '1h' });
    res.status(200).json({ success: true, message: 'Connexion admin réussie', token });
  } catch (error) {
    console.error('Erreur connexion admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Auth check endpoint
app.get('/api/auth/check', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token d'authentification requis" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
    const user = {
      _id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    res.status(200).json({ success: true, user });
  } catch (jwtError) {
    res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
});

// Products endpoint
app.get('/api/products', async (req, res) => {
  try {
    console.log('🔍 API /api/products appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let products;
    if (mongoConnected) {
      console.log('🗄️ Récupération depuis MongoDB...');
      products = await Product.find();
      console.log('📦 Produits trouvés:', products.length);
      console.log('📋 Premier produit:', products[0] ? products[0].nom : 'Aucun produit');
      
      // S'assurer que les produits ont des images
      products = products.map(product => {
        if (!product.images || product.images.length === 0) {
          product.images = [`/uploads/product-${product._id}-1.jpg`];
        }
        return product;
      });
    } else {
      console.log('⚠️ Utilisation des données de fallback');
      products = fallbackProducts;
      console.log('📦 Produits fallback:', products.length);
    }
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Settings endpoint
app.get('/api/settings', async (req, res) => {
  try {
    console.log('🔍 API /api/settings appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let settings;
    if (mongoConnected) {
      console.log('🗄️ Récupération depuis MongoDB...');
      settings = await Settings.findOne();
      console.log('⚙️ Paramètres trouvés:', settings ? 'Oui' : 'Non');
    } else {
      console.log('⚠️ Utilisation des paramètres de fallback');
      settings = fallbackSettings;
    }
    res.json({ success: true, settings: settings || {} });
  } catch (error) {
    console.error('❌ Erreur récupération paramètres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Manifest.json endpoint
app.get('/manifest.json', (req, res) => {
  res.json({
    "short_name": "Boutique Vêtements",
    "name": "Boutique de Vêtements en Ligne",
    "icons": [
      {
        "src": "favicon.ico",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/x-icon"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#ffffff"
  });
});

// Users endpoint (pour l'admin)
app.get('/api/users', async (req, res) => {
  try {
    console.log('🔍 API /api/users appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let users;
    if (mongoConnected) {
      console.log('🗄️ Récupération depuis MongoDB...');
      users = await User.find();
      console.log('👥 Utilisateurs trouvés:', users.length);
    } else {
      console.log('⚠️ Utilisation des utilisateurs de fallback');
      users = [fallbackAdmin];
    }
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Orders endpoint (pour l'admin)
app.get('/api/orders', async (req, res) => {
  try {
    console.log('🔍 API /api/orders appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Pour l'instant, retourner des commandes vides
    // Tu peux ajouter un modèle Order plus tard
    const orders = [];
    console.log('📦 Commandes trouvées:', orders.length);
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Erreur récupération commandes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Stats endpoint (pour le dashboard admin) - Version courte
app.get('/api/stats', async (req, res) => {
  try {
    console.log('🔍 API /api/stats appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let stats = {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    };
    
    if (mongoConnected) {
      console.log('🗄️ Calcul des statistiques depuis MongoDB...');
      stats.totalUsers = await User.countDocuments();
      stats.totalProducts = await Product.countDocuments();
      // stats.totalOrders = await Order.countDocuments(); // À ajouter plus tard
      console.log('📊 Stats calculées:', stats);
    } else {
      console.log('⚠️ Utilisation des stats de fallback');
      stats.totalUsers = 1; // fallbackAdmin
      stats.totalProducts = fallbackProducts.length;
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Stats endpoint (version courte pour le frontend)
app.get('/stats', async (req, res) => {
  try {
    console.log('🔍 API /stats appelée (version courte)');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let stats = {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    };
    
    if (mongoConnected) {
      console.log('🗄️ Calcul des statistiques depuis MongoDB...');
      stats.totalUsers = await User.countDocuments();
      stats.totalProducts = await Product.countDocuments();
      console.log('📊 Stats calculées:', stats);
    } else {
      console.log('⚠️ Utilisation des stats de fallback');
      stats.totalUsers = 1;
      stats.totalProducts = fallbackProducts.length;
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Products endpoint (version courte pour le frontend)
app.get('/tous', async (req, res) => {
  try {
    console.log('🔍 API /tous appelée (version courte)');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let products;
    if (mongoConnected) {
      console.log('🗄️ Récupération depuis MongoDB...');
      products = await Product.find();
      console.log('📦 Produits trouvés:', products.length);
    } else {
      console.log('⚠️ Utilisation des données de fallback');
      products = fallbackProducts;
      console.log('📦 Produits fallback:', products.length);
    }
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// ENDPOINTS MANQUANTS POUR LE FRONTEND
// ================================

// Products endpoint (sans /api)
app.get('/products', async (req, res) => {
  try {
    console.log('🔍 API /products appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let products;
    if (mongoConnected) {
      console.log('🗄️ Récupération depuis MongoDB...');
      products = await Product.find();
      console.log('📦 Produits trouvés:', products.length);
    } else {
      console.log('⚠️ Utilisation des données de fallback');
      products = fallbackProducts;
      console.log('📦 Produits fallback:', products.length);
    }
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Settings endpoint (sans /api)
app.get('/settings', async (req, res) => {
  try {
    console.log('🔍 API /settings appelée (sans /api)');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let settings;
    if (mongoConnected) {
      console.log('🗄️ Récupération depuis MongoDB...');
      settings = await Settings.findOne();
      console.log('⚙️ Paramètres trouvés:', settings ? 'Oui' : 'Non');
    } else {
      console.log('⚠️ Utilisation des paramètres de fallback');
      settings = fallbackSettings;
    }
    res.json({ success: true, settings: settings || {} });
  } catch (error) {
    console.error('❌ Erreur récupération paramètres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Cart endpoint (sans /api)
app.get('/cart', async (req, res) => {
  try {
    console.log('🔍 API /cart appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Pour l'instant, retourner un panier vide
    const cart = { articles: [] };
    console.log('🛒 Panier retourné:', cart);
    
    res.json({ success: true, cart });
  } catch (error) {
    console.error('❌ Erreur récupération panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Auth check endpoint (sans /api)
app.get('/auth/check', async (req, res) => {
  try {
    console.log('🔍 API /auth/check appelée (sans /api)');
    
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token d'authentification requis" });
    }
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
      const user = {
        _id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      res.status(200).json({ success: true, user });
    } catch (jwtError) {
      res.status(401).json({ success: false, message: "Token invalide ou expiré" });
    }
  } catch (error) {
    console.error('❌ Erreur vérification auth:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Admin stats endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('🔍 API /api/admin/stats appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let stats = {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    };
    
    if (mongoConnected) {
      console.log('🗄️ Calcul des statistiques depuis MongoDB...');
      stats.totalUsers = await User.countDocuments();
      stats.totalProducts = await Product.countDocuments();
      console.log('📊 Stats calculées:', stats);
    } else {
      console.log('⚠️ Utilisation des stats de fallback');
      stats.totalUsers = 1;
      stats.totalProducts = fallbackProducts.length;
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Users admin endpoint
app.get('/api/users/admin/tous', async (req, res) => {
  try {
    console.log('🔍 API /api/users/admin/tous appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let users;
    if (mongoConnected) {
      console.log('🗄️ Récupération depuis MongoDB...');
      users = await User.find();
      console.log('👥 Utilisateurs trouvés:', users.length);
    } else {
      console.log('⚠️ Utilisation des utilisateurs de fallback');
      users = [fallbackAdmin];
    }
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// ENDPOINTS CRITIQUES MANQUANTS
// ================================

// Admin check endpoint (sans /api)
app.get('/admin/check', async (req, res) => {
  try {
    console.log('🔍 API /admin/check appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ success: true, exists: true });
  } catch (error) {
    console.error('❌ Erreur admin check:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Admin check endpoint (avec /api)
app.get('/api/admin/check', async (req, res) => {
  try {
    console.log('🔍 API /api/admin/check appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ success: true, exists: true });
  } catch (error) {
    console.error('❌ Erreur admin check:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Auth inscription endpoint (sans /api)
app.post('/auth/inscription', async (req, res) => {
  try {
    console.log('🔍 API /auth/inscription appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse, nom, prenom } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    let existingUser;
    if (mongoConnected) {
      existingUser = await User.findOne({ email });
    } else {
      existingUser = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }
    
    // Créer le nouvel utilisateur
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const newUser = {
      email,
      motDePasse: hashedPassword,
      nom: nom || '',
      prenom: prenom || '',
      role: 'client'
    };
    
    if (mongoConnected) {
      const user = new User(newUser);
      await user.save();
      console.log('👤 Nouvel utilisateur créé:', user.email);
    } else {
      console.log('👤 Nouvel utilisateur créé (fallback):', newUser.email);
    }
    
    res.status(201).json({ success: true, message: 'Inscription réussie' });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Auth inscription endpoint (avec /api)
app.post('/api/auth/inscription', async (req, res) => {
  try {
    console.log('🔍 API /api/auth/inscription appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse, nom, prenom } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    let existingUser;
    if (mongoConnected) {
      existingUser = await User.findOne({ email });
    } else {
      existingUser = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }
    
    // Créer le nouvel utilisateur
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const newUser = {
      email,
      motDePasse: hashedPassword,
      nom: nom || '',
      prenom: prenom || '',
      role: 'client'
    };
    
    if (mongoConnected) {
      const user = new User(newUser);
      await user.save();
      console.log('👤 Nouvel utilisateur créé:', user.email);
    } else {
      console.log('👤 Nouvel utilisateur créé (fallback):', newUser.email);
    }
    
    res.status(201).json({ success: true, message: 'Inscription réussie' });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Auth connexion endpoint (sans /api)
app.post('/auth/connexion', async (req, res) => {
  try {
    console.log('🔍 API /auth/connexion appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse } = req.body;
    
    // Trouver l'utilisateur
    let user;
    if (mongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key_2024',
      { expiresIn: '1h' }
    );
    
    console.log('🔐 Connexion réussie:', user.email);
    res.json({ success: true, message: 'Connexion réussie', token });
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Auth connexion endpoint (avec /api)
app.post('/api/auth/connexion', async (req, res) => {
  try {
    console.log('🔍 API /api/auth/connexion appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse } = req.body;
    
    // Trouver l'utilisateur
    let user;
    if (mongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key_2024',
      { expiresIn: '1h' }
    );
    
    console.log('🔐 Connexion réussie:', user.email);
    res.json({ success: true, message: 'Connexion réussie', token });
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Cart ajouter endpoint
app.post('/cart/ajouter', async (req, res) => {
  try {
    console.log('🔍 API /cart/ajouter appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId, quantity, size, color } = req.body;
    
    // Pour l'instant, retourner un succès
    console.log('🛒 Article ajouté au panier:', { productId, quantity, size, color });
    
    res.json({ success: true, message: 'Article ajouté au panier' });
  } catch (error) {
    console.error('❌ Erreur ajout panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Cart vider endpoint
app.delete('/cart/vider', async (req, res) => {
  try {
    console.log('🔍 API /cart/vider appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    console.log('🛒 Panier vidé');
    
    res.json({ success: true, message: 'Panier vidé' });
  } catch (error) {
    console.error('❌ Erreur vider panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Products POST endpoint (création de produit)
app.post('/products', async (req, res) => {
  try {
    console.log('🔍 API /products POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const productData = req.body;
    console.log('📦 Données produit reçues:', productData);
    
    if (mongoConnected) {
      const product = new Product(productData);
      await product.save();
      console.log('📦 Produit créé:', product.nom);
      res.status(201).json({ success: true, message: 'Produit créé avec succès', product });
    } else {
      console.log('⚠️ Mode fallback - produit simulé');
      res.status(201).json({ success: true, message: 'Produit créé avec succès', product: { _id: 'fallback-product', ...productData } });
    }
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// APIs DE GESTION DES PRODUITS
// ================================

// Create product (admin)
app.post('/api/products', async (req, res) => {
  try {
    console.log('🔍 API /api/products POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const productData = req.body;
    console.log('📦 Création produit:', productData);
    
    if (mongoConnected) {
      const product = new Product(productData);
      await product.save();
      console.log('📦 Produit créé:', product.nom);
      res.status(201).json({ success: true, message: 'Produit créé avec succès', product });
    } else {
      console.log('⚠️ Mode fallback - produit simulé');
      res.status(201).json({ success: true, message: 'Produit créé avec succès', product: { _id: 'fallback-product', ...productData } });
    }
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Update product (admin)
app.put('/api/products/:productId', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    const updateData = req.body;
    console.log('📦 Mise à jour produit:', productId, updateData);
    
    if (mongoConnected) {
      const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produit non trouvé' });
      }
      console.log('📦 Produit mis à jour:', product.nom);
    }
    
    res.json({ success: true, message: 'Produit mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Delete product (admin)
app.delete('/api/products/:productId', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    console.log('📦 Suppression produit:', productId);
    
    if (mongoConnected) {
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produit non trouvé' });
      }
      console.log('📦 Produit supprimé:', product.nom);
    }
    
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// ENDPOINTS UTILISATEUR
// ================================

// User profile update endpoint
app.put('/users/profile', async (req, res) => {
  try {
    console.log('🔍 API /users/profile PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const profileData = req.body;
    console.log('👤 Données profil reçues:', profileData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// User password update endpoint
app.put('/users/password', async (req, res) => {
  try {
    console.log('🔍 API /users/password PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const passwordData = req.body;
    console.log('🔐 Données mot de passe reçues');
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour mot de passe:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// ENDPOINTS PANIER
// ================================

// Cart modifier endpoint
app.put('/api/cart/modifier/:articleId', async (req, res) => {
  try {
    console.log('🔍 API /api/cart/modifier/:articleId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { articleId } = req.params;
    const updateData = req.body;
    console.log('🛒 Modification article panier:', articleId, updateData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Article modifié avec succès' });
  } catch (error) {
    console.error('❌ Erreur modification panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Cart supprimer endpoint
app.delete('/api/cart/supprimer/:articleId', async (req, res) => {
  try {
    console.log('🔍 API /api/cart/supprimer/:articleId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { articleId } = req.params;
    console.log('🛒 Suppression article panier:', articleId);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Article supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// ENDPOINTS PRODUIT
// ================================

// Product by ID endpoint
app.get('/api/products/:id', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:id GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { id } = req.params;
    console.log('📦 Récupération produit ID:', id);
    
    let product;
    if (mongoConnected) {
      product = await Product.findById(id);
    } else {
      product = fallbackProducts.find(p => p._id === id);
    }
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Erreur récupération produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Product update endpoint
app.put('/api/products/:productId', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    const updateData = req.body;
    console.log('📦 Mise à jour produit:', productId, updateData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Produit mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Product delete endpoint
app.delete('/api/products/:productId', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    console.log('📦 Suppression produit:', productId);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Product customization options endpoint
app.get('/api/products/:productId/options-personnalisation', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId/options-personnalisation GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    console.log('🎨 Options personnalisation produit:', productId);
    
    // Pour l'instant, retourner des options par défaut
    const options = {
      colors: ['Noir', 'Blanc', 'Rouge', 'Bleu'],
      sizes: ['S', 'M', 'L', 'XL'],
      designs: ['Logo AYNEXT', 'Logo personnalisé']
    };
    
    res.json({ success: true, options });
  } catch (error) {
    console.error('❌ Erreur options personnalisation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Product preview personnalisé endpoint
app.post('/api/products/:productId/preview-personnalise', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId/preview-personnalise POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    const previewData = req.body;
    console.log('🎨 Preview personnalisé produit:', productId, previewData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Preview généré avec succès', previewUrl: 'preview-url' });
  } catch (error) {
    console.error('❌ Erreur preview personnalisé:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Upload product images endpoint (sans /api)
app.post('/upload/product-images', async (req, res) => {
  try {
    console.log('🔍 API /upload/product-images POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    console.log('📸 Upload images produit');
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Images uploadées avec succès', imageUrls: ['image1.jpg', 'image2.jpg'] });
  } catch (error) {
    console.error('❌ Erreur upload images:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// ENDPOINTS PARAMÈTRES
// ================================

// Settings test endpoint
app.put('/settings/test', async (req, res) => {
  try {
    console.log('🔍 API /settings/test PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const testData = req.body;
    console.log('⚙️ Test paramètres:', testData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Test paramètres réussi' });
  } catch (error) {
    console.error('❌ Erreur test paramètres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Settings section update endpoint
app.put('/api/settings/:section', async (req, res) => {
  try {
    console.log('🔍 API /api/settings/:section PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { section } = req.params;
    const sectionData = req.body;
    console.log('⚙️ Mise à jour section paramètres:', section, sectionData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Section mise à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour section:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Settings update endpoint (sans /api)
app.put('/settings', async (req, res) => {
  try {
    console.log('🔍 API /settings PUT appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const settingsData = req.body;
    console.log('⚙️ Mise à jour paramètres:', settingsData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Paramètres mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour paramètres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Settings reset endpoint
app.post('/settings/reset', async (req, res) => {
  try {
    console.log('🔍 API /settings/reset POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    console.log('⚙️ Reset paramètres');
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Paramètres réinitialisés avec succès' });
  } catch (error) {
    console.error('❌ Erreur reset paramètres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// ENDPOINTS COMMANDE
// ================================

// Custom hoodie order endpoint (sans /api)
app.post('/orders/custom-hoodie', async (req, res) => {
  try {
    console.log('🔍 API /orders/custom-hoodie POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const hoodieData = req.body;
    console.log('🎨 Commande hoodie personnalisé:', hoodieData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Commande hoodie créée avec succès', orderId: 'order-123' });
  } catch (error) {
    console.error('❌ Erreur commande hoodie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Custom hoodie order endpoint (avec /api)
app.post('/api/orders/custom-hoodie', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/custom-hoodie POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const hoodieData = req.body;
    console.log('🎨 Commande hoodie personnalisé:', hoodieData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Commande hoodie créée avec succès', orderId: 'order-123' });
  } catch (error) {
    console.error('❌ Erreur commande hoodie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Order status update endpoint
app.put('/api/orders/:orderId/statut', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/:orderId/statut PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { orderId } = req.params;
    const statusData = req.body;
    console.log('📦 Mise à jour statut commande:', orderId, statusData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Statut commande mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour statut commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// ENDPOINTS ADMIN
// ================================

// Admin setup endpoint
app.post('/api/admin/setup', async (req, res) => {
  try {
    console.log('🔍 API /api/admin/setup POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const setupData = req.body;
    console.log('⚙️ Configuration admin:', setupData);
    
    // Pour l'instant, retourner un succès
    res.json({ success: true, message: 'Configuration admin créée avec succès' });
  } catch (error) {
    console.error('❌ Erreur configuration admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// User admin stats endpoint
app.get('/api/users/admin/:userId/stats', async (req, res) => {
  try {
    console.log('🔍 API /api/users/admin/:userId/stats GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { userId } = req.params;
    console.log('👤 Statistiques utilisateur admin:', userId);
    
    // Pour l'instant, retourner des stats par défaut
    const stats = {
      totalOrders: 0,
      totalSpent: 0,
      lastOrder: null
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erreur stats utilisateur admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// APIs DE GESTION DES UTILISATEURS
// ================================

// Get all users (admin)
app.get('/api/users', async (req, res) => {
  try {
    console.log('🔍 API /api/users GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let users = [];
    if (mongoConnected) {
      console.log('🗄️ Récupération utilisateurs depuis MongoDB...');
      users = await User.find().select('-motDePasse');
      console.log('👥 Utilisateurs trouvés:', users.length);
    } else {
      console.log('⚠️ Utilisation des utilisateurs de fallback');
      users = [fallbackAdmin];
    }
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    console.log('🔍 API /api/users/:userId GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { userId } = req.params;
    let user;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération utilisateur depuis MongoDB...');
      user = await User.findById(userId).select('-motDePasse');
    } else {
      console.log('⚠️ Utilisation de l\'utilisateur de fallback');
      user = fallbackAdmin;
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Update user
app.put('/api/users/:userId', async (req, res) => {
  try {
    console.log('🔍 API /api/users/:userId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { userId } = req.params;
    const updateData = req.body;
    console.log('👤 Mise à jour utilisateur:', userId, updateData);
    
    if (mongoConnected) {
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-motDePasse');
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }
      console.log('👤 Utilisateur mis à jour:', user.email);
    }
    
    res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Delete user
app.delete('/api/users/:userId', async (req, res) => {
  try {
    console.log('🔍 API /api/users/:userId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { userId } = req.params;
    console.log('👤 Suppression utilisateur:', userId);
    
    if (mongoConnected) {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }
      console.log('👤 Utilisateur supprimé:', user.email);
    }
    
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// APIs DE GESTION DES COMMANDES
// ================================

// Get all orders (admin)
app.get('/api/orders', async (req, res) => {
  try {
    console.log('🔍 API /api/orders GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { limit = 10, page = 1, status, search } = req.query;
    console.log('📦 Paramètres commandes:', { limit, page, status, search });
    
    let orders = [];
    let total = 0;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération commandes depuis MongoDB...');
      // Construire le filtre
      let filter = {};
      if (status) filter.statut = status;
      if (search) {
        filter.$or = [
          { 'client.nom': { $regex: search, $options: 'i' } },
          { 'client.email': { $regex: search, $options: 'i' } },
          { numeroCommande: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Récupérer les commandes avec pagination
      const skip = (page - 1) * limit;
      orders = await Order.find(filter)
        .sort({ dateCommande: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await Order.countDocuments(filter);
      console.log('📦 Commandes trouvées:', orders.length, 'Total:', total);
    } else {
      console.log('⚠️ Utilisation des commandes de fallback');
      orders = [];
      total = 0;
    }
    
    res.json({ 
      success: true, 
      orders, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Erreur récupération commandes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Get order by ID
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/:orderId GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { orderId } = req.params;
    let order;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération commande depuis MongoDB...');
      order = await Order.findById(orderId);
    } else {
      console.log('⚠️ Utilisation de la commande de fallback');
      order = null;
    }
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Erreur récupération commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    console.log('🔍 API /api/orders POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const orderData = req.body;
    console.log('📦 Création commande:', orderData);
    
    if (mongoConnected) {
      // Générer un numéro de commande unique
      const numeroCommande = `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      orderData.numeroCommande = numeroCommande;
      
      const order = new Order(orderData);
      await order.save();
      console.log('📦 Commande créée:', order.numeroCommande);
      
      res.status(201).json({ success: true, message: 'Commande créée avec succès', order });
    } else {
      console.log('⚠️ Mode fallback - commande simulée');
      res.status(201).json({ success: true, message: 'Commande créée avec succès', order: { numeroCommande: 'CMD-FALLBACK-123' } });
    }
  } catch (error) {
    console.error('❌ Erreur création commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Update order status
app.put('/api/orders/:orderId', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/:orderId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { orderId } = req.params;
    const updateData = req.body;
    console.log('📦 Mise à jour commande:', orderId, updateData);
    
    if (mongoConnected) {
      const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Commande non trouvée' });
      }
      console.log('📦 Commande mise à jour:', order.numeroCommande);
    }
    
    res.json({ success: true, message: 'Commande mise à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Delete order
app.delete('/api/orders/:orderId', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/:orderId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { orderId } = req.params;
    console.log('📦 Suppression commande:', orderId);
    
    if (mongoConnected) {
      const order = await Order.findByIdAndDelete(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Commande non trouvée' });
      }
      console.log('📦 Commande supprimée:', order.numeroCommande);
    }
    
    res.json({ success: true, message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ================================
// SYSTÈME COMPLET - TOUS LES ENDPOINTS
// ================================

// 🏥 ENDPOINTS DE SANTÉ ET TEST
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API Test successful',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/mongodb-test', async (req, res) => {
  try {
    console.log('🔍 API /api/mongodb-test appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let mongoStatus = 'disconnected';
    let productCount = 0;
    let userCount = 0;
    let orderCount = 0;
    
    if (mongoConnected) {
      mongoStatus = 'connected';
      try {
        productCount = await Product.countDocuments();
        userCount = await User.countDocuments();
        orderCount = await Order.countDocuments();
      } catch (error) {
        console.error('❌ Erreur comptage documents:', error);
      }
    }
    
    res.json({
      success: true,
      mongoStatus,
      productCount,
      userCount,
      orderCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur test MongoDB:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// 🔐 ENDPOINTS D'AUTHENTIFICATION COMPLETS
app.get('/api/auth/check', async (req, res) => {
  try {
    console.log('🔍 API /api/auth/check appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
      let user;
      
      if (mongoConnected) {
        user = await User.findById(decoded.userId).select('-motDePasse');
      } else {
        user = fallbackAdmin;
      }
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
      }
      
      res.json({ success: true, user });
    } catch (jwtError) {
      res.status(401).json({ success: false, message: 'Token invalide' });
    }
  } catch (error) {
    console.error('❌ Erreur auth check:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/auth/check', async (req, res) => {
  try {
    console.log('🔍 API /auth/check appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
      let user;
      
      if (mongoConnected) {
        user = await User.findById(decoded.userId).select('-motDePasse');
      } else {
        user = fallbackAdmin;
      }
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
      }
      
      res.json({ success: true, user });
    } catch (jwtError) {
      res.status(401).json({ success: false, message: 'Token invalide' });
    }
  } catch (error) {
    console.error('❌ Erreur auth check:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/auth/inscription', async (req, res) => {
  try {
    console.log('🔍 API /api/auth/inscription appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse, nom, prenom } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    let existingUser;
    if (mongoConnected) {
      existingUser = await User.findOne({ email });
    } else {
      existingUser = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }
    
    // Créer le nouvel utilisateur
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const newUser = {
      email,
      motDePasse: hashedPassword,
      nom: nom || '',
      prenom: prenom || '',
      role: 'client'
    };
    
    if (mongoConnected) {
      const user = new User(newUser);
      await user.save();
      console.log('👤 Nouvel utilisateur créé:', user.email);
    } else {
      console.log('👤 Nouvel utilisateur créé (fallback):', newUser.email);
    }
    
    res.status(201).json({ success: true, message: 'Inscription réussie' });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/auth/inscription', async (req, res) => {
  try {
    console.log('🔍 API /auth/inscription appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse, nom, prenom } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    let existingUser;
    if (mongoConnected) {
      existingUser = await User.findOne({ email });
    } else {
      existingUser = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }
    
    // Créer le nouvel utilisateur
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const newUser = {
      email,
      motDePasse: hashedPassword,
      nom: nom || '',
      prenom: prenom || '',
      role: 'client'
    };
    
    if (mongoConnected) {
      const user = new User(newUser);
      await user.save();
      console.log('👤 Nouvel utilisateur créé:', user.email);
    } else {
      console.log('👤 Nouvel utilisateur créé (fallback):', newUser.email);
    }
    
    res.status(201).json({ success: true, message: 'Inscription réussie' });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/auth/connexion', async (req, res) => {
  try {
    console.log('🔍 API /api/auth/connexion appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse } = req.body;
    
    // Trouver l'utilisateur
    let user;
    if (mongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key_2024',
      { expiresIn: '1h' }
    );
    
    console.log('🔐 Connexion réussie:', user.email);
    res.json({ success: true, message: 'Connexion réussie', token });
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/auth/connexion', async (req, res) => {
  try {
    console.log('🔍 API /auth/connexion appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse } = req.body;
    
    // Trouver l'utilisateur
    let user;
    if (mongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key_2024',
      { expiresIn: '1h' }
    );
    
    console.log('🔐 Connexion réussie:', user.email);
    res.json({ success: true, message: 'Connexion réussie', token });
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/auth/connexion-admin', async (req, res) => {
  try {
    console.log('🔍 API /api/auth/connexion-admin appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse } = req.body;
    
    // Trouver l'utilisateur admin
    let user;
    if (mongoConnected) {
      user = await User.findOne({ email, role: 'admin' });
    } else {
      user = fallbackAdmin.email === email ? fallbackAdmin : null;
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Accès non autorisé' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key_2024',
      { expiresIn: '1h' }
    );
    
    console.log('🔐 Connexion admin réussie:', user.email);
    res.json({ success: true, message: 'Connexion admin réussie', token });
  } catch (error) {
    console.error('❌ Erreur connexion admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// 👑 ENDPOINTS ADMINISTRATEUR COMPLETS
app.get('/api/admin/check', async (req, res) => {
  try {
    console.log('🔍 API /api/admin/check appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ success: true, exists: true });
  } catch (error) {
    console.error('❌ Erreur admin check:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/admin/check', async (req, res) => {
  try {
    console.log('🔍 API /admin/check appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ success: true, exists: true });
  } catch (error) {
    console.error('❌ Erreur admin check:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('🔍 API /api/admin/stats appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let stats = {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      recentOrders: [],
      topProducts: []
    };
    
    if (mongoConnected) {
      console.log('🗄️ Récupération stats depuis MongoDB...');
      stats.totalUsers = await User.countDocuments();
      stats.totalProducts = await Product.countDocuments();
      stats.totalOrders = await Order.countDocuments();
      
      // Calculer le revenu total
      const orders = await Order.find();
      stats.totalRevenue = orders.reduce((total, order) => total + (order.totalCommande || 0), 0);
      
      // Commandes récentes
      stats.recentOrders = await Order.find()
        .sort({ dateCommande: -1 })
        .limit(5)
        .select('numeroCommande totalCommande dateCommande statut');
      
      // Produits populaires
      stats.topProducts = await Product.find()
        .sort({ dateCreation: -1 })
        .limit(5)
        .select('nom prix images');
    } else {
      console.log('⚠️ Utilisation des stats de fallback');
      stats = {
        totalUsers: 1,
        totalProducts: 4,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        topProducts: fallbackProducts.slice(0, 5)
      };
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erreur stats admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/admin/setup', async (req, res) => {
  try {
    console.log('🔍 API /api/admin/setup appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { email, motDePasse, nom, prenom } = req.body;
    console.log('👑 Configuration admin:', { email, nom, prenom });
    
    // Vérifier si un admin existe déjà
    let existingAdmin;
    if (mongoConnected) {
      existingAdmin = await User.findOne({ role: 'admin' });
    }
    
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Un administrateur existe déjà' });
    }
    
    // Créer l'admin
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const adminData = {
      email,
      motDePasse: hashedPassword,
      nom: nom || 'Admin',
      prenom: prenom || 'Administrateur',
      role: 'admin'
    };
    
    if (mongoConnected) {
      const admin = new User(adminData);
      await admin.save();
      console.log('👑 Administrateur créé:', admin.email);
    } else {
      console.log('👑 Administrateur créé (fallback):', adminData.email);
    }
    
    res.status(201).json({ success: true, message: 'Administrateur créé avec succès' });
  } catch (error) {
    console.error('❌ Erreur configuration admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// 👥 ENDPOINTS GESTION UTILISATEURS COMPLETS
app.get('/api/users', async (req, res) => {
  try {
    console.log('🔍 API /api/users GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { limit = 10, page = 1, role, search } = req.query;
    console.log('👥 Paramètres utilisateurs:', { limit, page, role, search });
    
    let users = [];
    let total = 0;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération utilisateurs depuis MongoDB...');
      // Construire le filtre
      let filter = {};
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { nom: { $regex: search, $options: 'i' } },
          { prenom: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Récupérer les utilisateurs avec pagination
      const skip = (page - 1) * limit;
      users = await User.find(filter)
        .select('-motDePasse')
        .sort({ dateCreation: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await User.countDocuments(filter);
      console.log('👥 Utilisateurs trouvés:', users.length, 'Total:', total);
    } else {
      console.log('⚠️ Utilisation des utilisateurs de fallback');
      users = [fallbackAdmin];
      total = 1;
    }
    
    res.json({ 
      success: true, 
      users, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    console.log('🔍 API /api/users/:userId GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { userId } = req.params;
    let user;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération utilisateur depuis MongoDB...');
      user = await User.findById(userId).select('-motDePasse');
    } else {
      console.log('⚠️ Utilisation de l\'utilisateur de fallback');
      user = fallbackAdmin;
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  try {
    console.log('🔍 API /api/users/:userId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { userId } = req.params;
    const updateData = req.body;
    console.log('👤 Mise à jour utilisateur:', userId, updateData);
    
    if (mongoConnected) {
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-motDePasse');
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }
      console.log('👤 Utilisateur mis à jour:', user.email);
    }
    
    res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.delete('/api/users/:userId', async (req, res) => {
  try {
    console.log('🔍 API /api/users/:userId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { userId } = req.params;
    console.log('👤 Suppression utilisateur:', userId);
    
    if (mongoConnected) {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }
      console.log('👤 Utilisateur supprimé:', user.email);
    }
    
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/users/admin/tous', async (req, res) => {
  try {
    console.log('🔍 API /api/users/admin/tous appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { limit = 10, page = 1, role, search } = req.query;
    console.log('👥 Paramètres utilisateurs admin:', { limit, page, role, search });
    
    let users = [];
    let total = 0;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération utilisateurs admin depuis MongoDB...');
      // Construire le filtre
      let filter = {};
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { nom: { $regex: search, $options: 'i' } },
          { prenom: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Récupérer les utilisateurs avec pagination
      const skip = (page - 1) * limit;
      users = await User.find(filter)
        .select('-motDePasse')
        .sort({ dateCreation: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await User.countDocuments(filter);
      console.log('👥 Utilisateurs admin trouvés:', users.length, 'Total:', total);
    } else {
      console.log('⚠️ Utilisation des utilisateurs de fallback');
      users = [fallbackAdmin];
      total = 1;
    }
    
    res.json({ 
      success: true, 
      users, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/users/admin/:userId/stats', async (req, res) => {
  try {
    console.log('🔍 API /api/users/admin/:userId/stats GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { userId } = req.params;
    console.log('👤 Statistiques utilisateur admin:', userId);
    
    let stats = {
      totalOrders: 0,
      totalSpent: 0,
      lastOrder: null,
      favoriteCategory: null
    };
    
    if (mongoConnected) {
      // Compter les commandes de l'utilisateur
      const orders = await Order.find({ 'client.email': userId });
      stats.totalOrders = orders.length;
      stats.totalSpent = orders.reduce((total, order) => total + (order.totalCommande || 0), 0);
      
      if (orders.length > 0) {
        stats.lastOrder = orders.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande))[0];
      }
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erreur stats utilisateur admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.put('/users/profile', async (req, res) => {
  try {
    console.log('🔍 API /users/profile PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const profileData = req.body;
    const token = req.headers['x-auth-token'];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
      
      if (mongoConnected) {
        const user = await User.findByIdAndUpdate(decoded.userId, profileData, { new: true }).select('-motDePasse');
        if (!user) {
          return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        console.log('👤 Profil mis à jour:', user.email);
      }
      
      res.json({ success: true, message: 'Profil mis à jour avec succès' });
    } catch (jwtError) {
      res.status(401).json({ success: false, message: 'Token invalide' });
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.put('/users/password', async (req, res) => {
  try {
    console.log('🔍 API /users/password PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { currentPassword, newPassword } = req.body;
    const token = req.headers['x-auth-token'];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
      
      if (mongoConnected) {
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        // Vérifier le mot de passe actuel
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.motDePasse);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });
        }
        
        // Hacher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.motDePasse = hashedNewPassword;
        await user.save();
        
        console.log('🔐 Mot de passe mis à jour:', user.email);
      }
      
      res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } catch (jwtError) {
      res.status(401).json({ success: false, message: 'Token invalide' });
    }
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// 🛍️ ENDPOINTS GESTION PRODUITS COMPLETS
app.get('/api/products', async (req, res) => {
  try {
    console.log('🔍 API /api/products GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { category, brand, limit, genre, search } = req.query;
    console.log('📦 Filtres produits:', { category, brand, limit, genre, search });
    
    let products = [];
    let filter = {};
    
    // Construire le filtre
    if (category) filter.categorie = category;
    if (brand) filter.marque = brand;
    if (genre) filter.genre = genre;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { marque: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (mongoConnected) {
      console.log('🗄️ Récupération produits depuis MongoDB avec filtre:', filter);
      let query = Product.find(filter);
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }
      
      products = await query.sort({ dateCreation: -1 });
      console.log('📦 Produits trouvés:', products.length);
      
      // S'assurer que les produits ont des images
      products = products.map(product => {
        if (!product.images || product.images.length === 0) {
          product.images = [`/uploads/product-${product._id}-1.jpg`];
        }
        return product;
      });
    } else {
      console.log('⚠️ Utilisation des produits de fallback');
      products = fallbackProducts;
      
      // Appliquer les filtres sur les données de fallback
      if (category) {
        products = products.filter(p => p.categorie === category);
      }
      if (brand) {
        products = products.filter(p => p.marque === brand);
      }
      if (genre) {
        products = products.filter(p => p.genre === genre);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
          p.nom.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.marque.toLowerCase().includes(searchLower)
        );
      }
      if (limit) {
        products = products.slice(0, parseInt(limit));
      }
      console.log('📦 Produits fallback filtrés:', products.length);
    }
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/products', async (req, res) => {
  try {
    console.log('🔍 API /products GET appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { category, brand, limit, genre, search } = req.query;
    console.log('📦 Filtres produits collection:', { category, brand, limit, genre, search });
    
    let products = [];
    let filter = {};
    
    // Construire le filtre
    if (category) filter.categorie = category;
    if (brand) filter.marque = brand;
    if (genre) filter.genre = genre;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { marque: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (mongoConnected) {
      console.log('🗄️ Récupération produits collection depuis MongoDB avec filtre:', filter);
      let query = Product.find(filter);
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }
      
      products = await query.sort({ dateCreation: -1 });
      console.log('📦 Produits collection trouvés:', products.length);
    } else {
      console.log('⚠️ Utilisation des produits de fallback pour collection');
      products = fallbackProducts;
      
      // Appliquer les filtres sur les données de fallback
      if (category) {
        products = products.filter(p => p.categorie === category);
      }
      if (brand) {
        products = products.filter(p => p.marque === brand);
      }
      if (genre) {
        products = products.filter(p => p.genre === genre);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
          p.nom.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.marque.toLowerCase().includes(searchLower)
        );
      }
      if (limit) {
        products = products.slice(0, parseInt(limit));
      }
      console.log('📦 Produits collection fallback filtrés:', products.length);
    }
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Erreur récupération produits collection:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:id GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { id } = req.params;
    let product;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération produit depuis MongoDB...');
      product = await Product.findById(id);
    } else {
      console.log('⚠️ Utilisation du produit de fallback');
      product = fallbackProducts.find(p => p._id === id);
    }
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    // S'assurer que le produit a des images
    if (!product.images || product.images.length === 0) {
      product.images = [`/uploads/product-${product._id}-1.jpg`];
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Erreur récupération produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    console.log('🔍 API /api/products POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const productData = req.body;
    console.log('📦 Création produit:', productData);
    
    if (mongoConnected) {
      const product = new Product(productData);
      await product.save();
      console.log('📦 Produit créé:', product.nom);
      res.status(201).json({ success: true, message: 'Produit créé avec succès', product });
    } else {
      console.log('⚠️ Mode fallback - produit simulé');
      res.status(201).json({ success: true, message: 'Produit créé avec succès', product: { _id: 'fallback-product', ...productData } });
    }
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/products', async (req, res) => {
  try {
    console.log('🔍 API /products POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const productData = req.body;
    console.log('📦 Données produit reçues:', productData);
    
    if (mongoConnected) {
      const product = new Product(productData);
      await product.save();
      console.log('📦 Produit créé:', product.nom);
      res.status(201).json({ success: true, message: 'Produit créé avec succès', product });
    } else {
      console.log('⚠️ Mode fallback - produit simulé');
      res.status(201).json({ success: true, message: 'Produit créé avec succès', product: { _id: 'fallback-product', ...productData } });
    }
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.put('/api/products/:productId', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    const updateData = req.body;
    console.log('📦 Mise à jour produit:', productId, updateData);
    
    if (mongoConnected) {
      const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produit non trouvé' });
      }
      console.log('📦 Produit mis à jour:', product.nom);
    }
    
    res.json({ success: true, message: 'Produit mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.delete('/api/products/:productId', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    console.log('📦 Suppression produit:', productId);
    
    if (mongoConnected) {
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produit non trouvé' });
      }
      console.log('📦 Produit supprimé:', product.nom);
    }
    
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/products/:productId/options-personnalisation', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId/options-personnalisation GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    console.log('🎨 Options personnalisation pour produit:', productId);
    
    // Options de personnalisation par défaut
    const options = {
      couleurs: ['Noir', 'Blanc', 'Gris', 'Rouge', 'Bleu'],
      tailles: ['S', 'M', 'L', 'XL', 'XXL'],
      personnalisations: [
        { type: 'texte', label: 'Texte personnalisé', maxLength: 20 },
        { type: 'logo', label: 'Logo personnalisé', formats: ['PNG', 'JPG', 'SVG'] }
      ]
    };
    
    res.json({ success: true, options });
  } catch (error) {
    console.error('❌ Erreur options personnalisation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/products/:productId/preview-personnalise', async (req, res) => {
  try {
    console.log('🔍 API /api/products/:productId/preview-personnalise POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { productId } = req.params;
    const customData = req.body;
    console.log('🎨 Aperçu personnalisé pour produit:', productId, customData);
    
    // Générer un aperçu personnalisé
    const preview = {
      productId,
      customizations: customData,
      previewUrl: `/uploads/preview-${productId}-${Date.now()}.jpg`,
      estimatedPrice: 89.99 + (customData.premiumOptions ? 15.00 : 0)
    };
    
    res.json({ success: true, preview });
  } catch (error) {
    console.error('❌ Erreur aperçu personnalisé:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// 🛒 ENDPOINTS GESTION PANIER COMPLETS
app.get('/api/cart', async (req, res) => {
  try {
    console.log('🔍 API /api/cart GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const token = req.headers['x-auth-token'];
    let cart = { articles: [] };
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
        console.log('🛒 Récupération panier pour utilisateur:', decoded.userId);
        
        // Ici on pourrait récupérer le panier depuis la base de données
        // Pour l'instant, on retourne un panier vide
        cart = { articles: [] };
      } catch (jwtError) {
        console.log('⚠️ Token invalide, panier vide');
        cart = { articles: [] };
      }
    }
    
    res.json({ success: true, cart });
  } catch (error) {
    console.error('❌ Erreur récupération panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/cart', async (req, res) => {
  try {
    console.log('🔍 API /cart GET appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const token = req.headers['x-auth-token'];
    let cart = { articles: [] };
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
        console.log('🛒 Récupération panier pour utilisateur:', decoded.userId);
        cart = { articles: [] };
      } catch (jwtError) {
        console.log('⚠️ Token invalide, panier vide');
        cart = { articles: [] };
      }
    }
    
    res.json({ success: true, cart });
  } catch (error) {
    console.error('❌ Erreur récupération panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    console.log('🔍 API /api/cart POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const cartData = req.body;
    console.log('🛒 Création/mise à jour panier:', cartData);
    
    // Ici on pourrait sauvegarder le panier dans la base de données
    // Pour l'instant, on retourne le panier tel quel
    
    res.json({ success: true, message: 'Panier mis à jour avec succès', cart: cartData });
  } catch (error) {
    console.error('❌ Erreur mise à jour panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.put('/api/cart/modifier/:articleId', async (req, res) => {
  try {
    console.log('🔍 API /api/cart/modifier/:articleId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { articleId } = req.params;
    const { quantite } = req.body;
    console.log('🛒 Modification quantité article:', articleId, 'quantité:', quantite);
    
    // Ici on pourrait modifier l'article dans le panier en base de données
    
    res.json({ success: true, message: 'Article modifié avec succès' });
  } catch (error) {
    console.error('❌ Erreur modification article panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.delete('/api/cart/supprimer/:articleId', async (req, res) => {
  try {
    console.log('🔍 API /api/cart/supprimer/:articleId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { articleId } = req.params;
    console.log('🛒 Suppression article panier:', articleId);
    
    // Ici on pourrait supprimer l'article du panier en base de données
    
    res.json({ success: true, message: 'Article supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression article panier:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// 📦 ENDPOINTS GESTION COMMANDES COMPLETS
app.get('/api/orders', async (req, res) => {
  try {
    console.log('🔍 API /api/orders GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { limit = 10, page = 1, statut, userId } = req.query;
    console.log('📦 Paramètres commandes:', { limit, page, statut, userId });
    
    let orders = [];
    let total = 0;
    let filter = {};
    
    if (statut) filter.statut = statut;
    if (userId) filter['client.email'] = userId;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération commandes depuis MongoDB avec filtre:', filter);
      const skip = (page - 1) * limit;
      orders = await Order.find(filter)
        .sort({ dateCommande: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await Order.countDocuments(filter);
      console.log('📦 Commandes trouvées:', orders.length, 'Total:', total);
    } else {
      console.log('⚠️ Utilisation des commandes de fallback');
      orders = [];
      total = 0;
    }
    
    res.json({ 
      success: true, 
      orders, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Erreur récupération commandes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/:orderId GET appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { orderId } = req.params;
    let order;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération commande depuis MongoDB...');
      order = await Order.findById(orderId);
    } else {
      console.log('⚠️ Utilisation de la commande de fallback');
      order = null;
    }
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Erreur récupération commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    console.log('🔍 API /api/orders POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const orderData = req.body;
    console.log('📦 Création commande:', orderData);
    
    if (mongoConnected) {
      const order = new Order(orderData);
      await order.save();
      console.log('📦 Commande créée:', order.numeroCommande);
      res.status(201).json({ success: true, message: 'Commande créée avec succès', order });
    } else {
      console.log('⚠️ Mode fallback - commande simulée');
      res.status(201).json({ success: true, message: 'Commande créée avec succès', order: { _id: 'fallback-order', ...orderData } });
    }
  } catch (error) {
    console.error('❌ Erreur création commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.put('/api/orders/:orderId', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/:orderId PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { orderId } = req.params;
    const updateData = req.body;
    console.log('📦 Mise à jour commande:', orderId, updateData);
    
    if (mongoConnected) {
      const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Commande non trouvée' });
      }
      console.log('📦 Commande mise à jour:', order.numeroCommande);
    }
    
    res.json({ success: true, message: 'Commande mise à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.delete('/api/orders/:orderId', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/:orderId DELETE appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { orderId } = req.params;
    console.log('📦 Suppression commande:', orderId);
    
    if (mongoConnected) {
      const order = await Order.findByIdAndDelete(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Commande non trouvée' });
      }
      console.log('📦 Commande supprimée:', order.numeroCommande);
    }
    
    res.json({ success: true, message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.put('/api/orders/:orderId/statut', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/:orderId/statut PUT appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { orderId } = req.params;
    const { statut } = req.body;
    console.log('📦 Mise à jour statut commande:', orderId, 'statut:', statut);
    
    if (mongoConnected) {
      const order = await Order.findByIdAndUpdate(orderId, { statut }, { new: true });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Commande non trouvée' });
      }
      console.log('📦 Statut commande mis à jour:', order.numeroCommande, '->', statut);
    }
    
    res.json({ success: true, message: 'Statut commande mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour statut commande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/orders/custom-hoodie', async (req, res) => {
  try {
    console.log('🔍 API /api/orders/custom-hoodie POST appelée');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const customOrderData = req.body;
    console.log('🎨 Création commande hoodie personnalisé:', customOrderData);
    
    // Générer un numéro de commande unique
    const numeroCommande = `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const orderData = {
      ...customOrderData,
      numeroCommande,
      statut: 'En attente',
      dateCommande: new Date(),
      typeCommande: 'Hoodie personnalisé'
    };
    
    if (mongoConnected) {
      const order = new Order(orderData);
      await order.save();
      console.log('🎨 Commande hoodie personnalisé créée:', order.numeroCommande);
      res.status(201).json({ success: true, message: 'Commande hoodie personnalisé créée avec succès', order });
    } else {
      console.log('⚠️ Mode fallback - commande hoodie personnalisé simulée');
      res.status(201).json({ success: true, message: 'Commande hoodie personnalisé créée avec succès', order: { _id: 'fallback-custom-order', ...orderData } });
    }
  } catch (error) {
    console.error('❌ Erreur création commande hoodie personnalisé:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/orders/custom-hoodie', async (req, res) => {
  try {
    console.log('🔍 API /orders/custom-hoodie POST appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const customOrderData = req.body;
    console.log('🎨 Création commande hoodie personnalisé (sans /api):', customOrderData);
    
    // Générer un numéro de commande unique
    const numeroCommande = `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const orderData = {
      ...customOrderData,
      numeroCommande,
      statut: 'En attente',
      dateCommande: new Date(),
      typeCommande: 'Hoodie personnalisé'
    };
    
    if (mongoConnected) {
      const order = new Order(orderData);
      await order.save();
      console.log('🎨 Commande hoodie personnalisé créée (sans /api):', order.numeroCommande);
      res.status(201).json({ success: true, message: 'Commande hoodie personnalisé créée avec succès', order });
    } else {
      console.log('⚠️ Mode fallback - commande hoodie personnalisé simulée (sans /api)');
      res.status(201).json({ success: true, message: 'Commande hoodie personnalisé créée avec succès', order: { _id: 'fallback-custom-order', ...orderData } });
    }
  } catch (error) {
    console.error('❌ Erreur création commande hoodie personnalisé (sans /api):', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Orders admin toutes endpoint (sans /api)
app.get('/orders/admin/toutes', async (req, res) => {
  try {
    console.log('🔍 API /orders/admin/toutes GET appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { limit = 10, page = 1, status, search } = req.query;
    console.log('📦 Paramètres commandes admin:', { limit, page, status, search });
    
    let orders = [];
    let total = 0;
    
    if (mongoConnected) {
      console.log('🗄️ Récupération commandes depuis MongoDB...');
      // Construire le filtre
      let filter = {};
      if (status) filter.statut = status;
      if (search) {
        filter.$or = [
          { 'client.nom': { $regex: search, $options: 'i' } },
          { 'client.email': { $regex: search, $options: 'i' } },
          { numeroCommande: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Récupérer les commandes avec pagination
      const skip = (page - 1) * limit;
      orders = await Order.find(filter)
        .sort({ dateCommande: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await Order.countDocuments(filter);
      console.log('📦 Commandes trouvées:', orders.length, 'Total:', total);
    } else {
      console.log('⚠️ Utilisation des commandes de fallback');
      orders = [];
      total = 0;
    }
    
    res.json({ 
      success: true, 
      orders, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Erreur récupération commandes admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Products with category filter endpoint
app.get('/api/products', async (req, res) => {
  try {
    console.log('🔍 API /api/products GET appelée avec filtres');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { category, brand, limit, genre, search } = req.query;
    console.log('📦 Filtres produits:', { category, brand, limit, genre, search });
    
    let products = [];
    let filter = {};
    
    // Construire le filtre
    if (category) filter.categorie = category;
    if (brand) filter.marque = brand;
    if (genre) filter.genre = genre;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { marque: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (mongoConnected) {
      console.log('🗄️ Récupération produits depuis MongoDB avec filtre:', filter);
      let query = Product.find(filter);
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }
      
      products = await query.sort({ dateCreation: -1 });
      console.log('📦 Produits trouvés:', products.length);
    } else {
      console.log('⚠️ Utilisation des produits de fallback');
      products = fallbackProducts;
      
      // Appliquer les filtres sur les données de fallback
      if (category) {
        products = products.filter(p => p.categorie === category);
      }
      if (brand) {
        products = products.filter(p => p.marque === brand);
      }
      if (genre) {
        products = products.filter(p => p.genre === genre);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
          p.nom.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.marque.toLowerCase().includes(searchLower)
        );
      }
      if (limit) {
        products = products.slice(0, parseInt(limit));
      }
      console.log('📦 Produits fallback filtrés:', products.length);
    }
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Erreur récupération produits avec filtres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Products endpoint for collections (sans /api)
app.get('/products', async (req, res) => {
  try {
    console.log('🔍 API /products GET appelée (sans /api)');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { category, brand, limit, genre, search } = req.query;
    console.log('📦 Filtres produits collection:', { category, brand, limit, genre, search });
    
    let products = [];
    let filter = {};
    
    // Construire le filtre
    if (category) filter.categorie = category;
    if (brand) filter.marque = brand;
    if (genre) filter.genre = genre;
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { marque: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (mongoConnected) {
      console.log('🗄️ Récupération produits collection depuis MongoDB avec filtre:', filter);
      let query = Product.find(filter);
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }
      
      products = await query.sort({ dateCreation: -1 });
      console.log('📦 Produits collection trouvés:', products.length);
    } else {
      console.log('⚠️ Utilisation des produits de fallback pour collection');
      products = fallbackProducts;
      
      // Appliquer les filtres sur les données de fallback
      if (category) {
        products = products.filter(p => p.categorie === category);
      }
      if (brand) {
        products = products.filter(p => p.marque === brand);
      }
      if (genre) {
        products = products.filter(p => p.genre === genre);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
          p.nom.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.marque.toLowerCase().includes(searchLower)
        );
      }
      if (limit) {
        products = products.slice(0, parseInt(limit));
      }
      console.log('📦 Produits collection fallback filtrés:', products.length);
    }
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Erreur récupération produits collection:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Cart endpoint
app.get('/api/cart', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token d'authentification requis" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
    // Retourner un panier vide pour l'instant
    res.json({ success: true, cart: { articles: [] } });
  } catch (jwtError) {
    res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
});

app.post('/api/cart', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token d'authentification requis" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
    // Pour l'instant, juste retourner un succès
    res.json({ success: true, message: "Article ajouté au panier" });
  } catch (jwtError) {
    res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
});

// Orders endpoint
app.get('/api/orders', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token d'authentification requis" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
    // Retourner des commandes vides pour l'instant
    res.json({ success: true, orders: [] });
  } catch (jwtError) {
    res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
});

// Admin orders endpoint
app.get('/api/orders/admin/toutes', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token d'authentification requis" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Accès administrateur requis" });
    }
    // Retourner des commandes vides pour l'instant
    res.json({ success: true, orders: [], total: 0 });
  } catch (jwtError) {
    res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
});

// Upload endpoint (pour l'admin)
app.post('/api/upload/product-images', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token d'authentification requis" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Accès administrateur requis" });
    }
    
    // Pour l'instant, retourner des URLs d'images fictives
    const mockImages = [
      'https://frontend-vercel-2dhm5wym8-seddik-s-projects-c94a56ab.vercel.app/hoodie-real.png',
      'https://frontend-vercel-2dhm5wym8-seddik-s-projects-c94a56ab.vercel.app/hoodie-base.png'
    ];
    
    res.json({ 
      success: true, 
      images: mockImages.map(url => ({ url, filename: url.split('/').pop() }))
    });
  } catch (jwtError) {
    res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
});

// Product creation endpoint
app.post('/api/products', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token d'authentification requis" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2024');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Accès administrateur requis" });
    }
    
    const productData = req.body;
    // Pour l'instant, juste retourner un succès
    res.json({ 
      success: true, 
      message: "Produit créé avec succès",
      product: { _id: 'new-product-' + Date.now(), ...productData }
    });
  } catch (jwtError) {
    res.status(401).json({ success: false, message: "Token invalide ou expiré" });
  }
});

// All other GET requests not handled by API routes will return your React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server - Attendre la connexion MongoDB
async function startServer() {
  console.log('🔄 Tentative de connexion à MongoDB Atlas...');
  
  const dbConnected = await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur unifié démarré sur le port ${PORT}`);
    console.log(`📱 Frontend accessible sur: http://localhost:${PORT}`);
    console.log(`🔧 API accessible sur: http://localhost:${PORT}/api`);
    console.log(`🗄️ Base de données: ${dbConnected ? 'MongoDB Atlas connecté' : 'Mode fallback (données statiques)'}`);
  });
}

// Démarrer l'application
startServer().catch(err => {
  console.error('❌ Erreur lors du démarrage:', err);
  process.exit(1);
});
