#!/bin/bash
cd ~/spells/spells-mainnet
git checkout 2aa158568385af2503307c606c6c93afb1dbc481
dapp update
make
dapp create DssSpell

