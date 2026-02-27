FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Python 3.13 — build from source (Debian doesn't have deadsnakes PPA)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev \
       libsqlite3-dev libncursesw5-dev xz-utils tk-dev libxml2-dev \
       libxmlsec1-dev libffi-dev liblzma-dev wget ca-certificates \
    && wget -q https://www.python.org/ftp/python/3.13.0/Python-3.13.0.tgz \
    && tar -xf Python-3.13.0.tgz \
    && cd Python-3.13.0 \
    && ./configure --enable-optimizations --with-ensurepip=install \
    && make -j"$(nproc)" \
    && make altinstall \
    && cd .. && rm -rf Python-3.13.0 Python-3.13.0.tgz \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# uv — fast Python package manager
COPY --from=ghcr.io/astral-sh/uv:0.7 /uv /uvx /usr/local/bin/

# just — command runner
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Claude Code CLI — for running agents inside the container
RUN npm install -g @anthropic-ai/claude-code

# OpenCode — AI coding assistant
RUN curl -fsSL https://opencode.ai/install | bash -s -- --no-modify-path \
    && mv /root/.opencode/bin/opencode /usr/local/bin/opencode \
    && rm -rf /root/.opencode
