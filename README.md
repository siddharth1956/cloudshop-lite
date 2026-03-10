# CloudShop Lite

Multi-service Kubernetes application — Course Final Project (400 pts)

## Services
| Service  | Language  | Port |
|----------|-----------|------|
| API      | Node.js   | 3000 |
| Frontend | Nginx     | 80   |
| Worker   | Python    | —    |
| Redis    | Redis     | 6379 |

## Quick Start (Local)
```bash
# Build images
docker build -t cloudshop-api:latest ./api
docker build -t cloudshop-frontend:latest ./frontend
docker build -t cloudshop-worker:latest ./worker

# Deploy locally
kubectl apply -f k8s-manifests/

# Access the app
kubectl port-forward svc/cloudshop-frontend 8080:80
open http://localhost:8080
```

## AWS EKS Deployment
See `docs/aws-deployment.md` for full instructions.

## Helm
```bash
helm install   cloudshop ./helm/cloudshop --namespace cloudshop --create-namespace
helm upgrade   cloudshop ./helm/cloudshop --set image.api.tag=v2
helm rollback  cloudshop 1
helm history   cloudshop
```
