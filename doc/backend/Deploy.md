# Backend Deployment# Backend Deployment






















Use GET /health for uptime monitoring.## Health endpointIf deploying behind Nginx, proxy /api to the Node server and enable WebSocket upgrades.## Reverse proxy (optional)```pm2 start src/server.js --name agrisense-backendnpm install --productioncd backend```Example with PM2:## Run with a process manager- Store secrets in the hosting provider environment variables- Configure MongoDB Atlas network access and IP allow list- Set FRONTEND_URL to your deployed frontend domain- Set NODE_ENV=production## Production checklist
## Production checklist
- Set NODE_ENV=production
- Set FRONTEND_URL to your deployed frontend domain
- Configure MongoDB Atlas network access and IP allow list
- Store secrets in the hosting provider environment variables

## Run with a process manager
Example with PM2:

```
cd backend
npm install --production
pm2 start src/server.js --name agrisense-backend
```

## Reverse proxy (optional)
If deploying behind Nginx, proxy /api to the Node server and enable WebSocket upgrades.

## Health endpoint
Use GET /health for uptime monitoring.
