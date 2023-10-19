tmux send-keys -t 0 C-c "exit" Enter || true
tmux kill-session -t 0 || true
cp /tmp/config.json /root || true
wget https://github.com/Opal-Cloud/Opal-Connector/releases/latest/download/Opal-Connector.mipsel-unknown-linux-musl -O /tmp/Opal-Connector 
chmod +x /tmp/Opal-Connector
cp /root/config.json /tmp || true
tmux new-session -d
tmux send-keys -t 0 "/tmp/Opal-Connector" Enter