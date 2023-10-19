#!/usr/bin/env bash

# Handle exit code for command (doesn't exit)
handle_exit_code_non_crucial() {
  if [ $? -ne 0 ]; then
    echo "Previous command failed with exit code $?."
    echo "Please check the logs for any errors."
    echo
  else
    echo "Ok."
    echo
  fi
}

logo=$(
  cat <<'EOF'  
EOF
)
echo "${logo}"
echo
echo "Opal Cloud reporter uninstall script"
echo "------------------------------"
echo "This script will uninstall Opal Cloud reporter from your system."
echo
echo "Checking for root privileges..."
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root. Exiting..."
  exit 1
fi
echo "Ok."
echo
if ps --no-headers -o comm 1 | grep 'systemd' > /dev/null; then 
  echo "Systemd is installed."
  systemctl_installed=true
else
  echo "Systemd is not installed. No service will be removed."
  systemctl_installed=false
fi
echo "Ok."
echo
echo "Checking for Opal Cloud reporter installation..."
if [ -d /opt/xornet ]; then
  echo "Opal Cloud reporter is installed."
else
  echo "Opal Cloud reporter is not installed. No uninstallation will be done."
  exit 0
fi
echo
read -p "Are you sure you want to uninstall Opal Cloud reporter? (y/n): " answer </dev/tty
case ${answer:0:1} in
  y|Y )
    echo "Ok, uninstalling Opal Cloud reporter..."
    if [ $systemctl_installed = true ]; then
      echo "Stopping Opal Cloud reporter service..."
      systemctl stop xornet-reporter.service
      handle_exit_code_non_crucial
      echo "Disabling Opal Cloud reporter service..."
      systemctl disable xornet-reporter.service
      handle_exit_code_non_crucial
      echo "Removing Opal Cloud reporter service..."
      rm /etc/systemd/system/xornet-reporter.service
      handle_exit_code_non_crucial
    fi
    echo "Removing Opal Cloud reporter files..."
    rm -rf /opt/xornet
    handle_exit_code_non_crucial
    echo "Opal Cloud reporter has been uninstalled."
    ;;
  * )
    echo "Ok, exiting..."
    exit 1
    ;;
esac