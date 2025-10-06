// Script pour corriger les appels API dans le frontend
const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend', 'src');

// Fonctions de remplacement
const replacements = [
  // Admin.js
  {
    file: 'pages/Admin.js',
    old: `const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });`,
    new: `const statsResponse = await api.get('/api/admin/stats');`
  },
  {
    file: 'pages/Admin.js',
    old: `const response = await fetch(\`/api/users/admin/tous?\${params}\`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });`,
    new: `const response = await api.get(\`/api/users/admin/tous?\${params}\`);`
  },
  // OrdersContext.js
  {
    file: 'contexts/OrdersContext.js',
    old: `const response = await fetch('/api/orders', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });`,
    new: `const response = await api.get('/api/orders');`
  },
  // Orders.js
  {
    file: 'pages/Orders.js',
    old: `fetch('/api/orders', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      })`,
    new: `api.get('/api/orders')`
  },
  // Profile.js
  {
    file: 'pages/Profile.js',
    old: `const ordersResponse = await fetch('/api/orders', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });`,
    new: `const ordersResponse = await api.get('/api/orders');`
  },
  // Cart.js
  {
    file: 'pages/Cart.js',
    old: `const response = await fetch('/api/orders', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });`,
    new: `const response = await api.get('/api/orders');`
  },
  // ProductDetail.js
  {
    file: 'pages/ProductDetail.js',
    old: `const response = await fetch(\`/api/products/\${id}\`);`,
    new: `const response = await api.get(\`/api/products/\${id}\`);`
  },
  {
    file: 'pages/ProductDetail.js',
    old: `const response = await fetch(\`/api/products?category=\${category}&brand=\${brand}&limit=4\`);`,
    new: `const response = await api.get(\`/api/products?category=\${category}&brand=\${brand}&limit=4\`);`
  },
  // AdminSetup.js
  {
    file: 'pages/AdminSetup.js',
    old: `const response = await fetch('/api/admin/check');`,
    new: `const response = await api.get('/api/admin/check');`
  },
  {
    file: 'pages/AdminSetup.js',
    old: `const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData)
      });`,
    new: `const response = await api.post('/api/admin/setup', adminData);`
  }
];

// Appliquer les remplacements
replacements.forEach(({ file, old, new: newText }) => {
  const filePath = path.join(frontendPath, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(old)) {
      content = content.replace(old, newText);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Corrigé: ${file}`);
    } else {
      console.log(`⚠️  Pattern non trouvé dans: ${file}`);
    }
  } else {
    console.log(`❌ Fichier non trouvé: ${file}`);
  }
});

console.log('🎉 Correction des appels API terminée !');
