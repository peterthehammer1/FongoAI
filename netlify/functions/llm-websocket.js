// Note: Netlify Functions don't support WebSockets directly
// This is a placeholder that will need to be replaced with a different solution
// Consider using Vercel, Railway, or Render for WebSocket support

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  return {
    statusCode: 501,
    headers,
    body: JSON.stringify({ 
      error: 'WebSocket not supported on Netlify Functions',
      message: 'Please use Vercel, Railway, or Render for WebSocket support'
    }),
  };
};
