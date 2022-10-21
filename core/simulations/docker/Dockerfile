FROM vulcanize/dapptools:v0.30.0-v1.10.16-statediff-3.0.2a

ENTRYPOINT ["tail", "-f", "/dev/null"]

# # RUN nix-shell --pure -p cacert cachix curl git jq nix gnumake nano --run "bash docker/install.sh"
# RUN nix-shell -p cacert cachix curl git jq nix gnumake nano
# RUN dapp --version
# RUN seth --version

# # edit nix.conf to add filter-syscalls = false
# RUN echo 'filter-syscalls = false' >> /etc/nix/nix.conf

# RUN git clone https://github.com/makerdao/spells-mainnet spells
# WORKDIR /root/spells
# RUN git checkout CES-795
# RUN dapp update

# # prepare keys
# RUN echo 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' > ../private-key
# RUN echo '' > ../key-password
# # RUN (printf "\n\n" && cat) | geth account import --datadir /root ../private-key
# ENV ETH_FROM="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
# ENV ETH_KEYSTORE="/root/keystore"
# ENV ETH_PASSWORD="/root/key-password"
# ENV ETH_RPC_URL=http://core:8545
# ENV ETH_GAS=30000000
# ENV ETH_GAS_PRICE=1000000000000
# RUN make
# RUN dapp create DssSpell

# ENTRYPOINT [ "sh" ]

# FROM ubuntu:20.04 as base-installs

# RUN apt-get update && apt-get -y install curl xz-utils git make

# FROM base-installs as tool-installs

# RUN useradd -s /bin/bash -d /home/blockchain/ -m -G sudo blockchain
# RUN mkdir -m 0755 /nix && chown blockchain /nix
# RUN sysctl kernel.unprivileged_userns_clone=1
# USER blockchain
# ENV USER="blockchain"
# ENV HOME="/home/${USER}"
# ENV PATH="${HOME}/.nix-profile/bin:${PATH}"
# ENV NIX_PATH="${HOME}/.nix-defexpr/channels"
# RUN curl -L https://nixos.org/nix/install | sh -s -- --no-daemon
# RUN nix --version
# RUN mkdir /nix/store
# RUN curl -L https://dapp.tools/install | sh
# CMD ["/bin/bash"]

# # RUN seth --version

# # FROM tool-installs as base-clones

# # USER blockchain
# # RUN mkdir /home/blockchain/spells
# # WORKDIR /home/blockchain/spells
# # COPY ./onboard.sh .
# # RUN git clone https://github.com/makerdao/spells-mainnet.git
# # RUN git clone https://github.com/makerdao/exchange-callees.git

# # FROM base-clones as cast-spell-base

# # ARG ETH_RPC_URL
# # ENV ETH_RPC_URL=${ETH_RPC_URL}
# # ARG ETH_GAS
# # ENV ETH_GAS=${ETH_GAS}
# # ARG ETH_FROM
# # ENV ETH_FROM=${ETH_FROM}


# # ENV USER="blockchain"
# # ENV HOME="/home/${USER}"
# # ENV PATH="${HOME}/.nix-profile/bin:${PATH}"

# # USER blockchain
# # RUN export ETH_GAS_PRICE=$(seth --to-wei 100 "gwei")
# # WORKDIR /home/blockchain/spells/spells-mainnet
# # RUN echo "export ETH_RPC_ACCOUNTS=yes" >> /home/blockchain/.sethrc

# # FROM cast-spell-base as cast-spell-execute

# # CMD ["../onboard.sh"]
