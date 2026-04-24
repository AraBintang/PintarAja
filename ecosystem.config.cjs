module.exports = {
  apps: [
    {
      name: 'pintaraja-worker',
      script: 'php',
      args: 'artisan queue:work --tries=3 --timeout=300',
      cwd: '/var/www/apipintaraja',
      autorestart: true,
      watch: false,
    }
  ]
}