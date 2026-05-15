# Installation

---

## Install on MacOS

> Reference: https://developer.atlassian.com/cloud/acli/guides/install-macos/

Open a terminal window and enter the command below to install. If you are on macOS and using Homebrew package manager, you can install acli with Homebrew.

1. Run the installation command:

```
brew tap atlassian/homebrew-acli
brew install acli
```

2. Test to ensure the version you installed is up-to-date:

```
acli --version
```

## Install on Linux

> Reference: https://developer.atlassian.com/cloud/acli/guides/install-linux/

### Debian-based distributions

Open a terminal window and enter the command below to install:

1. Download required dependencies:

```
sudo apt-get install -y wget gnupg2
```

2. Setup APT Repository:

```
sudo mkdir -p -m 755 /etc/apt/keyrings
wget -nv -O- https://acli.atlassian.com/gpg/public-key.asc | sudo gpg --dearmor -o /etc/apt/keyrings/acli-archive-keyring.gpg
sudo chmod go+r /etc/apt/keyrings/acli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/acli-archive-keyring.gpg] https://acli.atlassian.com/linux/deb stable main" | sudo tee /etc/apt/sources.list.d/acli.list > /dev/null
```

3. Install ACLI:

```
sudo apt update
sudo apt install -y acli
```

### Red Hat-based distributions

Open a terminal window and enter the command below to install:

1. Download required dependencies:

```
sudo yum install -y yum-utils
```

2. Setup YUM repository:

```
sudo yum-config-manager --add-repo https://acli.atlassian.com/linux/rpm/acli.repo
```

3. Install ACLI:

```
sudo yum install -y acli
```

## Install on Windows

> Reference: https://developer.atlassian.com/cloud/acli/guides/install-windows/

Open a PowerShell window and enter the command below to install:

1. Download the latest release:

- x86-64:

```
Invoke-WebRequest -Uri  https://acli.atlassian.com/windows/latest/acli_windows_amd64/acli.exe -OutFile acli.exe
```

- ARM64:

```
Invoke-WebRequest -Uri https://acli.atlassian.com/windows/latest/acli_windows_arm64/acli.exe -OutFile acli.exe

```

2. You can now use acli.exe from this directory:

```
.\acli.exe --help
```
