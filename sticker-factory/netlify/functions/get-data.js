const path = require('path');
const fs = require('fs');
const JSONBIN_KEY = process.env.JSONBIN_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    if (JSONBIN_KEY && JSONBIN_BIN_ID) {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_KEY }
      });
      if (res.ok) {
        const json = await res.json();
        return { statusCode: 200, headers, body: JSON.stringify(json.record) };
      }
    }
  } catch (e) {
    console.log('JSONBin error:', e.message);
  }

  try {
    const dataPath = path.join(__dirname, '../../public/data.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return { statusCode: 200, headers, body: data };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No se pudo leer datos' }) };
  }
};
