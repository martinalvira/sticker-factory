exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const adminKey = event.headers['x-admin-key'];
  const ADMIN_KEY = process.env.ADMIN_KEY || 'sf-admin-2024';
  if (adminKey !== ADMIN_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Cloudinary no configurado. Revisá las variables de entorno.' }) };
  }

  try {
    const { image, folder } = JSON.parse(event.body);

    const formData = new URLSearchParams();
    formData.append('file', image);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', (folder || 'sticker-factory').replace(/\//g, '-'));

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await res.json();

    if (result.error) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: result.error.message }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: result.secure_url, publicId: result.public_id })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error subiendo imagen: ' + err.message }) };
  }
};
