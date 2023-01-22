# SCCS Scheduler
Scraper-based scheduling website to allow students to plot out classes with dates and times and export recurring classes as an iCalendar file.

## Development Environment Setup

### With VS Code
For machines with Visual Studio Code installed, a devcontainer configuration is included to automatically set up a Docker-based development environment with just a couple clicks. At this time the container is not hosted in a registry, so you'll have to clone the repo and build the container yourself.

#### Prerequisites
- Visual Studio Code
- VS Code Remote-Containers extension
- Docker (Docker Desktop with WSL2 on Windows 10+, Docker Desktop on macOS, `docker.io` package on Linux-based systems)

#### Steps
1. Clone the repo
    ```bash
    git clone https://github.com/swat-sccs/scheduler.git
    ```

2. Launch VS Code in the `scheduler/` directory
    ```bash
    code ./scheduler/
    ```

3. Select "Reopen in Container" in the popup at the botttom right

### Without VS Code
Those without VS Code installed will have to clone the repo and edit files natively instead of in a container unless another way of building the Dockerfile in a usable way is discovered (feel free to edit the config later as long as you don't break anything).

#### Prerequisites
- Node.js 16
- `npm` 8.x.x (preferred latest for Node.js 16, recommended to use `nvm`)

#### Steps
1. Clone and enter the repo
    ```bash
    git clone https://github.com/swat-sccs/scheduler.git && cd scheduler
    ```

2. Install `npm` packages
    ```bash
    npm install
    ```

3. Install required Webpack utilities globally
    ```bash
    # May require sudo/elevated permissions to install--nvm should mitigate this by default
    npm install -g webpack
    npm install -g webpack-cli
    npm install -g webpack-dev-server
    ```

## Using the Development Environment
Several `npm` scripts are included for your convenience:

```bash
npm run build           # Builds for production
npm start               # Run development instance
```

If you get an error running one of these scripts, it's probably due to a missing or broken dependency. As per standard with `npm`-based projects, fix this with one of the following:

```bash
npm install <missing-dep>               # Installs a missing dependency
npm install -g <missing-global-dep>     # Installs a missing global-required dependency
npm update                              # Updates packages (or just kinda doesn't)
npm audit fix                           # Supposedly fixes broken packages
npm audit fix --force                   # Actually fixes broken packages but often breaks
                                        # more in the process
```

## License
(c) 2016-2023 Swarthmore College Computer Society
Licensed under the MIT license, as indicated in [the LICENSE file](LICENSE.md)
3rd-party content licenses can be found in [the third-party LICENSE file](LICENSE-3RDPARTY.md)
