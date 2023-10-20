#!/usr/bin/env bash
set +x
trap handle_ctrl_c INT
path=$(pwd)

# Cleanup
cleanup() {
  echo "Cleaning up..."
  cd $path
  if [ -f opalcloud-reporter ]; then
    rm opalcloud-reporter
  fi
  echo "Ok."
}

# Handle exit code for command
handle_exit_code() {
  if [ $? -ne 0 ]; then
    echo "Installation failed."
    echo "Please check the logs for any errors."
    cleanup
    exit
  else
    echo "Ok."
    echo
  fi
}

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

# Ctrl-C
handle_ctrl_c() {
  echo "CTRL-C detected."
  cleanup
  exit
}

logo=$(
  cat <<'EOF'
Opal Cloud
version: 1.1.0
EOF
)
echo "${logo}"
echo
echo "OpalCloud reporter install script"
echo "------------------------------"
echo "This script will install and set up OpalCloud reporter for your system."
echo
echo "Checking for root privileges..."
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root. Exiting..."
  exit 1
fi
echo "Ok."
echo
echo "Checking CPU architecture..."
arch=$(uname -m)
# TODO: Add support for lowercase
case $arch in
armv7* | armv8*)
  arch="armv7"
  ;;
amd64)
  arch="x86_64"
  ;;
arm*)
  arch="arm"
  ;;
*)
  arch=$arch
  ;;
esac
echo $arch
echo
echo "Checking for required apps for the script to run..."
if [ ! -f /usr/bin/curl ]; then
  echo "Curl is not installed or not in PATH. Please install it and try again."
  exit 1
fi
echo "Curl is installed."

service_manager="none"

if ps --no-headers -o comm 1 | grep 'systemd' >/dev/null; then
  echo "Systemd found."
  service_manager="systemd"
fi
if [ -f /sbin/openrc ]; then
  echo "OpenRC found."
  service_manager="openrc"
fi
if [ $service_manager = "none" ]; then
  echo "Neither Systemd or OpenRC was not found. This script cannot create the automatic system service."
fi
echo "Ok."
echo

echo "Checking for existing OpalCloud reporter installation..."
if [ -d /opt/opalcloud ]; then
  echo "OpalCloud reporter is already installed."
  ready=false
  while [ $ready = false ]; do
    echo "Please choose one of the following options:"
    echo "1. Clean install OpalCloud reporter"
    echo "2. Update existing OpalCloud reporter"
    echo "3. Exit"
    read -p "Please enter your choice: " choice </dev/tty
    echo
    case $choice in
    1)
      echo "Uninstalling old OpalCloud reporter entirely..."
      if [ $service_manager = "systemd" ]; then
        echo "Stopping OpalCloud reporter service..."
        systemctl stop opalcloud-reporter.service
        handle_exit_code_non_crucial
        echo "Disabling OpalCloud reporter service..."
        systemctl disable opalcloud-reporter.service
        handle_exit_code_non_crucial
        echo "Removing OpalCloud reporter service..."
        rm /etc/systemd/system/opalcloud-reporter.service
        handle_exit_code_non_crucial
      elif [ $service_manager = "openrc" ]; then
        echo "Stopping OpalCloud reporter service..."
        rc-service opalcloud-reporter stop
        if [ $? -ne 0 ]; then
          rc-service opalcloud-reporter zap
          handle_exit_code_non_crucial
        fi
        echo "Removing OpalCloud reporter service from default runlevel..."
        rc-update delete opalcloud-reporter default
        handle_exit_code_non_crucial
        echo "Removing OpalCloud reporter service..."
        rm /etc/init.d/opalcloud-reporter
        handle_exit_code_non_crucial
      fi
      echo "Removing old OpalCloud reporter installation directory..."
      rm -rf /opt/opalcloud
      handle_exit_code
      echo "Creating new OpalCloud reporter installation directory..."
      mkdir /opt/opalcloud
      handle_exit_code
      ready=true
      ;;
    2)
      echo "Updating OpalCloud reporter..."
      if [ $service_manager = "systemd" ]; then
        echo "Stopping OpalCloud reporter service..."
        systemctl stop opalcloud-reporter.service
        handle_exit_code_non_crucial
      elif [ $service_manager = "openrc" ]; then
        rc-service opalcloud-reporter stop
        if [ $? -ne 0 ]; then
          rc-service opalcloud-reporter zap
          handle_exit_code_non_crucial
        fi
      fi
      echo "Removing old OpalCloud reporter executable..."
      rm /opt/opalcloud/opalcloud-reporter
      handle_exit_code_non_crucial
      ready=true
      ;;
    3)
      echo "Exiting..."
      exit
      ;;
    *)
      echo "Invalid choice. Try again."
      echo
      ;;
    esac
  done
else
  echo "OpalCloud reporter is not installed. Proceeding with installation..."
  echo "Creating directory /opt/opalcloud..."
  mkdir /opt/opalcloud
  handle_exit_code
fi

echo "Downloading the latest release from github..."
download_url=$(curl -s https://api.github.com/repos/Opal-Cloud/Opal-Connector/releases | grep browser_download_url | grep "${arch}-" | head -n 1 | cut -d '"' -f 4)

if [ -z "$download_url" ]; then
  echo "Could not find a download URL for architecture $arch."
  handle_exit_code
  exit 1
else
  echo "Looking for file: $download_url"
  curl -L $download_url -o opalcloud-reporter
  handle_exit_code
  echo "Moving the executable into /opt/opalcloud..."
  mv opalcloud-reporter /opt/opalcloud
  handle_exit_code
  echo "Flagging as executable..."
  chmod +x /opt/opalcloud/opalcloud-reporter
  handle_exit_code
fi

if [ ! -f /opt/opalcloud/config.json ]; then
  cd /opt/opalcloud
  echo "Setting up as a new installation..."
  if [ ! $1 ]; then
    read -p "Please enter your OpalCloud Signup Token: " token </dev/tty
  else
    token=$1
  fi
  ./opalcloud-reporter -su $token
  handle_exit_code
  cd $path
fi

if [ $service_manager = "systemd" ]; then
  if [ ! -f /etc/systemd/system/opalcloud-reporter.service ]; then

    # Create the systemd service
    echo "Creating the systemd service..."
    cat >/etc/systemd/system/opalcloud-reporter.service <<EOF
[Unit]
Description=OpalCloud reporter
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/opalcloud
ExecStart=/opt/opalcloud/opalcloud-reporter --silent
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    echo "Ok."
    echo

    # Enable the service
    echo "Enabling the systemd service..."
    systemctl enable opalcloud-reporter.service
    echo "Ok."
    echo
  fi

  # Start the service
  echo "Starting the systemd service..."
  systemctl start opalcloud-reporter.service
  echo "Ok."
  echo

elif [ $service_manager = "openrc" ]; then
  if [ ! -f /etc/init.d/opalcloud-reporter ]; then

    # Create the openrc service
    echo "Creating the openrc service..."
    cat >/etc/init.d/opalcloud-reporter <<EOF
#!/sbin/openrc-run
command=/opt/opalcloud/opalcloud-reporter
command_args="--silent"
command_user="root:root"
pidfile=/var/run/opalcloud-reporter.pid
directory="/opt/opalcloud/"
supervisor=supervise-daemon
supervise_daemon_args="--respawn-delay 5 --pidfile /var/run/opalcloud-reporter.pid"
name="OpalCloud Reporter service"

description="OpalCloud Reporter is a service for OpalCloud status reporting"

depend() {
	need net
  after localmount
}

EOF
    echo "Ok."
    echo

    echo "Marking the file as executable..."
    chmod +x /etc/init.d/opalcloud-reporter
    handle_exit_code

    # Add the service to default runlevel
    echo "Enabling the openrc service to default runlevel..."
    rc-update add opalcloud-reporter default
    echo "Ok."
    echo
  fi

  # Start the service
  echo "Starting the opalcloud-reporter service..."
  rc-service opalcloud-reporter start
  echo "Ok."
  echo
fi
cleanup

echo "Installation complete. OpalCloud reporter is now installed."
echo "Please check the logs for any errors."
if [ $service_manager = "systemd" ]; then
  echo "You can stop the service by running the following command:"
  echo "systemctl stop opalcloud-reporter.service"
elif [ $service_manager = "openrc" ]; then
  echo "You can stop the service by running the following command:"
  echo "rc-service opalcloud-reporter stop"
else
  echo "No supported service manager was found. No background service was created."
  echo "You can start the reporter by running the following command:"
  echo "cd /opt/opalcloud && sudo ./opalcloud-reporter --silent"
fi