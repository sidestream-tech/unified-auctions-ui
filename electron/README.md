# Unified Auctions Electron App

Scripts to package unified-auction frontend into os-native applications

### Development setup

1. Install dependencies via `npm i`
2. Build and copy frontend `npm run build`
3. Start electron in "electron development mode" `npm start` (note: the frontend will not be rebuild)

### Build a distributable app

1. Install dependencies via `npm i`
2. Build applications for the current platform via `npm run distribute` (will run `npm run build`)
3. Built files will be available under the newly created `./out` directory
