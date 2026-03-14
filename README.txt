# 🎮 PhoneWheel — Use your phone as a game controller!

## ✅ What you need
- A Windows PC
- Node.js installed (free): https://nodejs.org
- Your phone on the **same Wi-Fi** as your PC

---

## 🚀 How to start (3 steps)

### Step 1 — Double-click `START.bat`
This opens a black terminal window. Leave it running.

### Step 2 — Open the website
- **On your PC**: open your browser and go to → `http://localhost:3000`
- **On your phone**: open your browser and go to → `http://YOUR_PC_IP:3000`
  - (The PC's IP is shown in the terminal window after starting)

### Step 3 — Connect
1. On the **PC browser**: click **"CREATE SERVER"** — a 4-digit code will appear
2. On the **phone browser**: type that code and press **"JOIN SERVER"**
3. Choose your control mode:
   - 🎡 **Gyroscope** — tilt your phone left/right to steer
   - ⚡ **Pedals** — tap GAS and BRAKE buttons

---

## 🎮 Key bindings (sent to your game)
| Action | Key |
|--------|-----|
| Steer Left | A |
| Steer Right | D |
| Gas | W |
| Brake | S |

> **Tip:** Click your game window before using the controller so it receives the key presses!

---

## ❓ Troubleshooting
- **Phone can't reach the site?** Make sure both devices are on the same Wi-Fi network.
- **Gyroscope not working on iPhone?** iOS requires HTTPS for gyro. Use the pedals mode or see the HTTPS note below.
- **Code says invalid?** Make sure the server (`START.bat`) is still running.

### iPhone gyroscope (optional)
Safari on iOS 13+ requires HTTPS to use the gyroscope. For a simple fix, open the page via an HTTPS tunnel like [ngrok](https://ngrok.com):
```
ngrok http 3000
```
Then use the `https://` URL ngrok gives you on your iPhone.
