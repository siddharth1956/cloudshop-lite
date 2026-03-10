# AWS EKS Deployment Guide

## Prerequisites
- AWS CLI configured (`aws configure`)
- eksctl, kubectl, helm installed
- Docker Desktop running

## 1. Create EKS Cluster
```bash
eksctl create cluster \
  --name cloudshop \
  --region us-east-1 \
  --nodegroup-name workers \
  --node-type t3.small \
  --nodes 2 --nodes-min 1 --nodes-max 4 \
  --managed

aws eks update-kubeconfig --name cloudshop --region us-east-1
kubectl get nodes
```

## 2. Create ECR Repositories
```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1

for svc in cloudshop-api cloudshop-frontend cloudshop-worker; do
  aws ecr create-repository --repository-name $svc --region $REGION
done
```

## 3. Build & Push Images
```bash
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$REGION.amazonaws.com

for svc in api frontend worker; do
  docker build -t cloudshop-$svc:latest ./$svc
  docker tag cloudshop-$svc:latest $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/cloudshop-$svc:latest
  docker push $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/cloudshop-$svc:latest
done
```

## 4. Update values.yaml
Set `image.registry` in helm/cloudshop/values.yaml to:
`<ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com`

## 5. Install Ingress Controller
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s
```

## 6. Install Metrics Server (for HPA)
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## 7. Deploy with Helm
```bash
helm install cloudshop ./helm/cloudshop \
  --namespace cloudshop --create-namespace \
  --set image.registry=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com \
  --wait

kubectl get pods -n cloudshop
kubectl get ingress -n cloudshop   # grab the public URL
```

## 8. GitHub Secrets to Add
In your repo: Settings → Secrets → Actions:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

## Cleanup (avoid AWS charges)
```bash
helm uninstall cloudshop -n cloudshop
eksctl delete cluster --name cloudshop --region us-east-1
```
