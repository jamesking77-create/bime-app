# BIME app

BIME plans study around work and home life, keeps you focused, and shows your progress on your phone's home and lock screens. This is the code. The plan and design docs are in the BIME folder on the Desktop.

## What's here

| Folder | What it is |
| --- | --- |
| `apps/mobile` | The app. One Expo codebase for iPhone, Android and the web |
| `packages/core` | BIME's brain: the weekly planner, the momentum score and the data types. Every app uses it |

Right now the Today screen shows a sample week planned by `packages/core`. Lock-in, Progress and Plan are placeholders that get built next.

## First run on Windows

1. Install **Node.js LTS** from https://nodejs.org (version 22 or 24). Check it in a terminal with `node -v`.
2. Install **Git** from https://git-scm.com.
3. On your iPhone, install **Expo Go** from the App Store.
4. Open this folder in VS Code, open the terminal (Ctrl+`) and run:

   ```
   npm install
   npm start
   ```

5. Scan the QR code with your iPhone camera. BIME opens in Expo Go. Your phone and PC need to be on the same Wi-Fi. If it won't connect, stop it and run `npx expo start --tunnel` inside `apps/mobile`.

## Everyday commands (run from this folder)

| Command | What it does |
| --- | --- |
| `npm start` | Starts the app for your phone |
| `npm run web` | Opens the app in your browser |
| `npm test` | Runs the planner's tests |
| `npm run plan` | Prints the sample week's plan |
| `npm run typecheck` | Checks the TypeScript types |

## Save it with Git

```
git init
git add .
git commit -m "BIME starting point"
```

Then create a private repository on GitHub and push to it, so the work is backed up and Claude can work on it in the cloud.

## iPhone widgets and App Store builds

Widgets and store builds need Apple's tools, which only run on a Mac. On Windows they are built in the cloud with Expo's build service (EAS). We set that up when we build the first widget.
