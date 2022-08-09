#!/bin/bash
cd ~/spells/spells-mainnet
dapp update
make
dapp create DssSpell

cd ~/spells/exchange-callees
dapp update
make
make deploy-mainnet
