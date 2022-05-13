let config = {
  SERVER_URL: 'http://localhost:8080',
  SERVER_API_URL: 'http://localhost:8080/api',
  SERVER_PROXY_URL: 'http://localhost:8080/proxy',
};

switch (window.location.hostname) {
  case 'dev.satyrn.io':
    config = {
      ...config,
      SERVER_URL: 'https://dev.satyrn.io',
      SERVER_API_URL: 'https://dev.satyrn.io/api',
      SERVER_PROXY_URL: 'https://dev.satyrn.io/proxy',
    };
    break;
  case 'pp.satyrn.io':
    config = {
      ...config,
      SERVER_URL: 'https://pp.satyrn.io',
      SERVER_API_URL: 'https://pp.satyrn.io/api',
      SERVER_PROXY_URL: 'https://pp.satyrn.io/proxy',
    };
    break;
  case 'satyrn.io':
    config = {
      ...config,
      SERVER_URL: 'https://satyrn.io',
      SERVER_API_URL: 'https://satyrn.io/api',
      SERVER_PROXY_URL: 'https://satyrn.io/proxy',
    };
    break;
}

export default config;
