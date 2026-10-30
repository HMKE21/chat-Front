Palora redesign - batch 1 (copy over the project, keep paths):
- index.html                      IBM Plex Sans Arabic font
- src/styles/css/palora.css       NEW design system (navy rail, azure/cyan, chat, meetings list, auth, landing, privacy)
- src/styles/index.css            adds @import './css/palora.css' as the LAST line
- src/layouts/AppShell.jsx        slim icon rail + theme toggle + avatar
- src/components/auth/AuthIllustration.jsx  chat/call art (replaces graduation cap)
- src/pages/Landing.jsx           NEW landing page at /
- src/pages/Privacy.jsx           NEW privacy page at /privacy and /privacy-policy
- src/App.jsx                     routes for / and /privacy
