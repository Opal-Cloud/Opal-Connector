# vps

## Install
```bash
curl https://raw.githubusercontent.com/Opal-Cloud/Opal-Connector/main/scripts/install.sh | sudo bash
```

## Compile EXE:
```
npm install -g pkg

Windows:
pkg ./dist/src/index.js --targets node18-win-x64 --output ./exe/OpalCloud.exe

Ubuntu:
pkg ./dist/src/index.js --targets node18-linux-arm64 --output ./exe/OpalCloud-aarch64-unknown-linux
```