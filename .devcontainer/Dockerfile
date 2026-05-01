# Use Ubuntu LTS as base image
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Set up environment variables
ENV EMSDK_PATH=/opt/emsdk
ENV PATH=${EMSDK_PATH}/3.1.22:${PATH}

# Update packages and install dependencies
RUN apt-get update && apt-get install -y \
    git \
    vim \
    curl \
    wget \
    build-essential \
    python3 \
    python3-pip \
    cmake \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js v22 LTS using NodeSource repository
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Clone emsdk and set up environment
RUN git clone https://github.com/emscripten-core/emsdk.git ${EMSDK_PATH} \
    && cd ${EMSDK_PATH} \
    && ./emsdk install 3.1.22

# Create non-root user for VS Code
RUN groupadd --gid 1000 vscode
RUN useradd -u 1000 -g 1000 -m -s /bin/bash vscode
RUN chown -R vscode:vscode ${EMSDK_PATH}
# Add emsdk setup to vscode's .bashrc for interactive shells
RUN echo "${EMSDK_PATH}/emsdk activate 3.1.22" >> /home/vscode/.bashrc
RUN echo "source ${EMSDK_PATH}/emsdk_env.sh" >> /home/vscode/.bashrc

# Set working directory
WORKDIR /workspaces/qulacs-wasm

USER vscode

CMD ["/bin/bash"]
