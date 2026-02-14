# 🔒 Crypto Wallet Security - User Guide

## ✅ How Secure Is This Application?

Our wallet is designed with **multiple layers of security** to protect your funds:

### 🔐 1. Strong Password (REQUIRED)

**The app requires a strong password:**
- ✅ Minimum 12 characters
- ✅ Must contain uppercase, lowercase, numbers, and special characters
- ✅ Cannot use common passwords (123456, password, etc.)

**Why this matters:**
- Weak password → Hackers can easily guess → Lose all funds
- Strong password → Hackers need thousands of years to crack

**Examples:**
- ❌ BAD: `password123`, `solana2024`, `myWallet`
- ✅ GOOD: `MyS0l@n@W@llet!2024`, `Str0ng$ecur3#Pass`

---

### 🚫 2. Failed Attempt Limit (Anti-Brute Force)

**The app automatically locks after multiple failed attempts:**
- 5 wrong attempts → Locked for 5 minutes
- Continue failing → Locked for 10 minutes
- Continue failing → Locked for 20 minutes (doubles each time)

**This protects you from:**
- Hackers trying thousands of passwords automatically
- Someone else trying to guess your password

---

### 🔒 3. Auto-Lock

**Wallet automatically locks after 15 minutes of inactivity:**
- You forget to close the app → Wallet auto-locks
- Someone gets access to your computer → Cannot access wallet

**You can manually lock anytime:**
- Click the "Lock" button 🔒 in the top corner

---

### ⚠️ 4. Browser Extension Warning

**THE APP WILL WARN YOU:**
> ⚠️ Browser extensions can read your private keys!

**Recommendations:**
- ✅ Remove all unnecessary extensions
- ✅ Use Incognito mode (no extensions)
- ✅ Use a separate browser for crypto

**Dangerous extensions:**
- Ad blockers (can inject scripts)
- Translation tools
- Screenshot tools
- Any extension you don't 100% trust

---

### 💸 5. Transaction Safety

**The app validates before sending money:**
- ✅ Simulates transaction first (transaction simulation)
- ✅ If transaction will fail → Does NOT allow sending
- ✅ Clearly displays amount, recipient address, gas fees

**Protects you from:**
- Sending to wrong address
- Smart contract errors
- Malicious transactions

---

### 📊 6. Sandwich Attack Protection (When Swapping Tokens)

**The app limits slippage to max 5%:**
- Slippage = allowed price difference
- If price changes more than 5% → Transaction cancelled

**Protects you from:**
- MEV bots stealing your money during swaps
- Sudden market price fluctuations

---

### 🌐 7. Secure Connection (HTTPS Only)

**The app ONLY connects via HTTPS:**
- All API calls are encrypted
- No one can read or modify data

**Protects you from:**
- Hackers eavesdropping on public WiFi
- Man-in-the-middle attacks

---

## ⚠️ What YOU Need To Do To Stay Safe

### 1. 🔑 NEVER SHARE YOUR PRIVATE KEY / SEED PHRASE

```
❌ DO NOT send to anyone
❌ DO NOT screenshot
❌ DO NOT save on cloud (Google Drive, iCloud)
❌ DO NOT send via email/chat
❌ DO NOT enter on unknown websites
```

**Whoever has the private key = Owns the funds!**

### 2. 🎣 Beware of Phishing (Fake Websites)

**Hackers create fake websites that look identical:**
```
❌ solana-wallet.xyz (fake)
❌ phantomwallet.io (fake)
✅ phantom.app (real)
```

**Always check the URL carefully before entering information!**

### 3. 💻 Protect Your Computer/Phone

```
✅ Install antivirus
✅ Update OS regularly
✅ Don't download unknown apps
✅ Don't click on suspicious links
✅ Use computer password/lock screen
```

### 4. 📝 Backup Seed Phrase Correctly

**Safe backup methods:**
- ✅ Write by hand on paper (DO NOT type)
- ✅ Store in safe or secure location
- ✅ Make multiple backups (home, bank safe)
- ✅ DO NOT take photos, DO NOT save digitally

**If you lose seed phrase + forget password = LOSE ALL FUNDS!**

---

## 🚨 Dangerous Scenarios

### ❌ Scenario 1: Fake "Customer Support" Scam

```
Scammer: "Hello, I'm from the support team.
          Please enter your seed phrase so we can help fix the issue."

YOU: "NO! Support team will NEVER ask for seed phrase!"
```

**Remember:** Real support team will NEVER ask for:
- Seed phrase
- Private key
- Password

### ❌ Scenario 2: Fake Airdrop

```
Scammer: "You received 1000 SOL airdrop!
          Click this link and connect wallet to claim."

YOU: "NO! This is phishing to steal my private key!"
```

**Remember:** Real airdrops automatically arrive in wallet, NO NEED to:
- Connect wallet to unknown websites
- Enter seed phrase
- Pay fees to claim

### ❌ Scenario 3: "Wallet Hacked" Message

```
Scammer: "Your wallet has been hacked!
          Quickly move funds to this safe wallet: Abc123..."

YOU: "NO! This is a trick to make me send money myself!"
```

**Remember:** If wallet is REALLY hacked, hacker will steal immediately, NO NEED to:
- Send warning messages
- Ask you to transfer funds yourself

---

## 🛡️ Safety Checklist

Before using the wallet:
- [ ] Read and understand this entire guide
- [ ] Created strong password (12+ characters, complex)
- [ ] Backed up seed phrase (written by hand, stored safely)
- [ ] Removed/disabled unnecessary browser extensions
- [ ] Updated OS and antivirus
- [ ] Understand that NO ONE can recover password/seed phrase

When using the wallet:
- [ ] Check recipient address CAREFULLY before sending
- [ ] Send small test amount before sending large amount
- [ ] Don't use on unsecured public WiFi
- [ ] Lock wallet when not in use (Lock button 🔒)

When encountering problems:
- [ ] DON'T panic
- [ ] DON'T trust anyone claiming to be "support team" on social media
- [ ] DON'T share seed phrase with ANYONE
- [ ] Contact official support via official website/email

---

## 📞 Support & Bug Reports

If you discover a security vulnerability, please report via:
- GitHub Issues: https://github.com/pepeminor/pepe-wallet/issues
- Or contact the development team

**NEVER share private key/seed phrase, even with support team!**

---

## ✅ Conclusion

This application has **multiple security layers** to protect your funds:
- 🔐 Strong password required
- 🚫 Rate limiting (anti-brute force)
- 🔒 Auto-lock after 15 minutes
- ⚠️ Browser extension warnings
- 💸 Transaction simulation
- 📊 Slippage protection
- 🌐 HTTPS only

**But ultimate security depends on YOU:**
- Keep seed phrase safe
- Don't click suspicious links
- Don't trust scammers
- Always verify before sending funds

**Security = Caution + Knowledge!** 🛡️

---

## 🎓 Learn More

For technical details about how security works:
- **Developers:** Read `CLAUDE.md`
- **Security Researchers:** Read `COMPREHENSIVE_SECURITY_ANALYSIS.md`
- **Users:** This document is all you need!

**Remember: Stay safe, stay informed!** 🔒
