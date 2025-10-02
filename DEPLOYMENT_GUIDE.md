# 🚀 ReactiveResume Server Deployment Guide

## 📋 **Which Script to Use?**

### **MAIN SCRIPT (Use This One!)**
```bash
./deploy-server.sh
```
**This is the ONLY script you need to remember!** It's a smart launcher that calls the appropriate setup script based on your needs.

## 🎯 **Usage Examples**

### **Basic Deployment**
```bash
# Complete automation stack (ReactiveResume + Skyvern + Ollama)
./deploy-server.sh

# Lightweight deployment (ReactiveResume only)
./deploy-server.sh --lite
```

### **Maintenance Operations**
```bash
# Complete cleanup + deploy complete stack
./deploy-server.sh --hard-reset

# Update all images + deploy complete stack
./deploy-server.sh --update

# Complete cleanup + deploy lite
./deploy-server.sh --lite --hard-reset

# Update images + deploy lite
./deploy-server.sh --lite --update
```

### **Get Help**
```bash
./deploy-server.sh --help
```

## 🔧 **What Each Option Does**

| Option | Description |
|--------|-------------|
| `--lite` | Deploy ReactiveResume only (PostgreSQL + Redis + MinIO + Chrome) |
| `--hard-reset` | Complete cleanup of all containers, images, and volumes |
| `--update` | Pull latest images for all services |
| `--help` | Show detailed usage information |

## 📁 **Script Hierarchy**

```
deploy-server.sh (MAIN LAUNCHER)
├── scripts/production/server-setup-complete-stack.sh (Full Stack)
└── scripts/production/server-setup-reactiveresume-only.sh (Lite)
```

## 🎯 **Quick Reference**

| What You Want | Command |
|---------------|---------|
| **Normal deployment** | `./deploy-server.sh` |
| **Lightweight deployment** | `./deploy-server.sh --lite` |
| **Fix Docker conflicts** | `./deploy-server.sh --hard-reset` |
| **Update to latest images** | `./deploy-server.sh --update` |
| **Complete reset + update** | `./deploy-server.sh --hard-reset --update` |

## 🚨 **Important Notes**

1. **Always use `deploy-server.sh`** - it's the main entry point
2. **Automatic conflict resolution** - scripts handle port and container conflicts automatically
3. **Background services** - all services run in background with PM2 + Docker
4. **Server location** - scripts must be run on the server at `/opt/reactive-resume`

## 🔍 **Troubleshooting**

If you encounter Docker conflicts:
```bash
# This will automatically resolve all conflicts
./deploy-server.sh --hard-reset
```

If you need to update to latest images:
```bash
# This will pull latest images and redeploy
./deploy-server.sh --update
```

## 📞 **Support**

- Check script help: `./deploy-server.sh --help`
- View service status: `pm2 status` and `docker ps`
- View logs: `pm2 logs` and `docker logs <container-name>`







