module.exports = {
  apps: [
    {
      name: 'project-satu-worker',
      script: 'php',
      args: 'artisan queue:work --tries=3 --timeout=300',
      cwd: '/var/www/project-satu',
      autorestart: true,
      watch: false,
    }
  ]
}