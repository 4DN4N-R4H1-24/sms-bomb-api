const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  const { phone, count = 10, key } = req.body;
  
  // Auth
  if (key !== 'uca.boy') return res.status(403).json({ error: '❌ Invalid key' });
  
  // Phone validation
  if (!phone || !/^\+?\d{10,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) 
    return res.status(400).json({ error: '❌ Invalid phone' });
  
  const num = parseInt(count);
  if (isNaN(num) || num < 1 || num > 100) 
    return res.status(400).json({ error: '❌ Count 1-100' });

  // Fire SMS
  const promises = Array(num).fill().map(async () => {
    try {
      await axios.post('https://textbelt.com/text', {
        phone: phone,
        message: `🔥 BOMB ${Date.now()}${Math.random().toString(36).substr(2)}`,
        key: 'textbelt'
      });
      return true;
    } catch (e) {
      return false;
    }
  });

  const results = await Promise.all(promises);
  const success = results.filter(Boolean).length;

  res.json({ 
    status: '✅ SUCCESS', 
    sent: success,
    total: num,
    id: `bom1::${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message: `💣 ${success}/${num} SMS delivered!`
  });
};
