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
      'https://frontend-vercel-2dhm5wym8-seddik-s-projects-c94a56ab.vercel.app/hoodie-real.png',
      'https://frontend-vercel-2dhm5wym8-seddik-s-projects-c94a56ab.vercel.app/hoodie-base.png'
    ],
    couleurs: ['Noir', 'Blanc', 'Gris'],
    tailles: ['S', 'M', 'L', 'XL'],
    categorie: 'Hoodies',
    marque: 'AYNEXT',
    enStock: true
  },
  {
    _id: 'product-2',
    nom: 'Hoodie AYNEXT Premium Blanc',
    prix: 89.99,
    description: 'Hoodie blanc premium avec logo AYNEXT personnalisable',
    images: [
      'https://frontend-vercel-2dhm5wym8-seddik-s-projects-c94a56ab.vercel.app/hoodie-white.jpg',
      'https://frontend-vercel-2dhm5wym8-seddik-s-projects-c94a56ab.vercel.app/hoodie-simple.svg'
    ],
    couleurs: ['Blanc', 'Noir'],
    tailles: ['S', 'M', 'L', 'XL'],
    categorie: 'Hoodies',
    marque: 'AYNEXT',
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
    
    let products;
    if (mongoConnected) {
      console.log('🗄️ Récupération depuis MongoDB...');
      products = await Product.find();
      console.log('📦 Produits trouvés:', products.length);
      console.log('📋 Premier produit:', products[0] ? products[0].nom : 'Aucun produit');
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

// Stats endpoint (pour le dashboard admin)
app.get('/api/stats', async (req, res) => {
  try {
    console.log('🔍 API /api/stats appelée');
    console.log('📊 mongoConnected:', mongoConnected);
    
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
