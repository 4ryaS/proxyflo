# Proxyflo - Reverse Proxy Server

This project implements a reverse proxy server using **Node.js** and **cluster management** to efficiently handle incoming HTTP requests with multiple worker processes. It reads its configuration from an external YAML file and dispatches requests to upstream servers based on specified routing rules.

## Features

- **Clustered Architecture**: The server uses Node.js clusters to distribute workload across multiple worker processes, improving performance and scalability.
- **Dynamic Configuration**: Configuration is read from an external YAML file. Rules and upstream servers can be defined dynamically.
- **Load Balancing**: Requests are randomly distributed across available worker processes, each of which proxies requests to upstream servers.
- **Graceful Error Handling**: The server gracefully handles errors, responding with appropriate HTTP status codes and error messages.
