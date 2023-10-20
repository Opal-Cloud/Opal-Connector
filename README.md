# vps

## Install
```bash
curl https://raw.githubusercontent.com/Opal-Cloud/Opal-Connector/main/scripts/install.sh | sudo bash
```

## Compile EXE:
```
npm i -g nexe

Windows:
nexe ./dist/src/index.js -o ./exe/OpalCloud -t windows-x64-10.0.0

Linux:
nexe ./dist/src/index.js -o ./exe/OpalCloud-aarch64-unknown-linux -t linux-x64-10.0.0
```