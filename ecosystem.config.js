module.exports = {
  apps: [{
    name: 'nucleusai',
    script: 'index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/nucleusai-error.log',
    out_file: '/var/log/pm2/nucleusai-out.log',
    log_file: '/var/log/pm2/nucleusai.log',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
