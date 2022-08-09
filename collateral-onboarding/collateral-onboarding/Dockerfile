FROM ubuntu:latest as base-installs

RUN apt-get update && \
    apt-get -y install curl xz-utils git make jq python3 pip
RUN pip install requests

FROM base-installs as tool-installs

RUN useradd -s /bin/bash -d /home/blockchain/ -m -G sudo blockchain
RUN mkdir -m 0755 /nix && chown blockchain /nix
USER blockchain
ENV USER="blockchain"
ENV HOME="/home/${USER}"
ENV PATH="${HOME}/.nix-profile/bin:${PATH}"
ENV NIX_PATH="${HOME}/.nix-defexpr/channels"
RUN curl -L https://nixos.org/nix/install | sh -s -- --no-daemon
RUN echo kek
RUN curl -L https://dapp.tools/install | sh

FROM tool-installs as base-clones

USER blockchain
RUN mkdir /home/blockchain/spells
WORKDIR /home/blockchain/spells
COPY ./onboard.sh .
RUN git clone https://github.com/makerdao/spells-mainnet.git
RUN git clone https://github.com/makerdao/exchange-callees.git

FROM base-clones as cast-spell-base

ARG ETH_RPC_URL
ENV ETH_RPC_URL=${ETH_RPC_URL}
ARG ETH_GAS
ENV ETH_GAS=${ETH_GAS}
ARG ETH_FROM
ENV ETH_FROM=${ETH_FROM}


ENV USER="blockchain"
ENV HOME="/home/${USER}"
ENV PATH="${HOME}/.nix-profile/bin:${PATH}"

USER blockchain
RUN export ETH_GAS_PRICE=$(seth --to-wei 100 "gwei")
WORKDIR /home/blockchain/spells/spells-mainnet
RUN echo "export ETH_RPC_ACCOUNTS=yes" >> /home/blockchain/.sethrc

FROM cast-spell-base as cast-spell-execute

CMD ["../onboard.sh"]
