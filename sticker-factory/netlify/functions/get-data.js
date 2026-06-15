const path = require('path');
const fs = require('fs');

const JSONBIN_KEY = process.env.JSONBIN_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

const BASE_DATA = {
  brands: [
    {id:'honda', name:'Honda', models:['Wave S','XR','CB','XL','Pop']},
    {id:'yamaha', name:'Yamaha', models:['FZ','YBR','Crypton','MT-03','R3']},
    {id:'zanella', name:'Zanella', models:['ZB 110','RX 150','Max 70','Due 110']},
    {id:'cfmoto', name:'CFMOTO', models:['250NK','300NK','650MT']}
  ],
  kits: [
    {id:'ws2026',brandId:'honda',model:'Wave S',name:'Diseño 2026',type:'Kit de gráficos',
     features:['Kit de calcos símil original','Vinilo de corte','Fondo transparente'],
     description:'Vinilo de corte de alta durabilidad, resistente UV, lluvia y lavados.',
     images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80']},
    {id:'ws2021',brandId:'honda',model:'Wave S',name:'Diseño 2021',type:'Kit de gráficos',
     features:['Kit de calcos símil original','Vinilo de corte','Fondo transparente'],
     description:'Diseño fiel al original de fábrica del modelo 2021.',
     images:['https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80']}
  ],
  colorSeries: {
    A:{name:'COMUNES',price:1000,colors:[
      {code:'A01',hex:'#FFDE00'},{code:'A06',hex:'#CC0000'},{code:'A11',hex:'#6600CC'},
      {code:'A14',hex:'#0044CC'},{code:'A22',hex:'#FFFFFF'},{code:'A25',hex:'#111111'},
      {code:'A26',hex:'#000000'}
    ]},
    B:{name:'ESPECIALES 1',price:1100,colors:[
      {code:'B01',hex:'#FF4500'},{code:'B02',hex:'#00AAFF'}
    ]},
    C:{name:'ESPECIALES 2',price:1200,colors:[
      {code:'C01',hex:'#FF0000'},{code:'C02',hex:'#0044FF'}
    ]},
    D:{name:'REFLECTIVOS',price:1300,colors:[
      {code:'D01',hex:'#FF1493'},{code:'D02',hex:'#FFFF00'}
    ]}
  },
  site: {}
};

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
        const saved = json.record || {};
        const merged = {
          brands: (saved.brands && saved.brands.length > 0) ? saved.brands : BASE_DATA.brands,
          kits: (saved.kits && saved.kits.length > 0) ? saved.kits : BASE_DATA.kits,
          colorSeries: (saved.colorSeries && Object.keys(saved.colorSeries).length > 0) ? saved.colorSeries : BASE_DATA.colorSeries,
          site: { ...BASE_DATA.site, ...saved.site }
        };
        return { statusCode: 200, headers, body: JSON.stringify(merged) };
      }
    }
  } catch (e) {
    console.log('JSONBin error:', e.message);
  }

  return { statusCode: 200, headers, body: JSON.stringify(BASE_DATA) };
};
