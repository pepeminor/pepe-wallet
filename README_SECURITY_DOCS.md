# 📚 Security Documentation Guide

This project has multiple security documentation files for different audiences. Here's what each file is for:

## 👥 For Different Audiences

### 🔵 For End Users (Wallet App Users)

**Read this:** [`SECURITY_FOR_USERS.md`](./SECURITY_FOR_USERS.md) 🇻🇳
- **Language:** Vietnamese (Tiếng Việt)
- **Level:** Simple, non-technical
- **Content:** How the app protects you, what you need to do to stay safe
- **You'll learn:**
  - Why strong passwords matter
  - How to protect your seed phrase
  - Common scam scenarios
  - Safety checklist

### 🟢 For Developers (Working on this codebase)

**Read this:** [`CLAUDE.md`](./CLAUDE.md) 📘
- **Language:** English
- **Level:** Technical
- **Content:** Architecture overview, coding conventions, security guidelines
- **You'll learn:**
  - How the codebase is structured
  - Security architecture (secureKeyManager, rate limiting, etc.)
  - How to work with private keys safely
  - Production deployment process

**Also useful:**
- [`verify-production.md`](./verify-production.md) - How to verify security headers in production

### 🟡 For Security Auditors & Researchers

**Read this:** [`COMPREHENSIVE_SECURITY_ANALYSIS.md`](./COMPREHENSIVE_SECURITY_ANALYSIS.md) 🔍
- **Language:** English
- **Level:** Very technical, security-focused
- **Content:** Full security audit, vulnerabilities found, fixes implemented, remaining risks
- **You'll learn:**
  - All security vulnerabilities that existed (with severity ratings)
  - How each vulnerability was fixed
  - Remaining attack vectors that can't be fully mitigated
  - Security score: 7/10 (improved from 3/10)

**Also useful:**
- [`SECURITY_ATTACK_VECTORS.md`](./SECURITY_ATTACK_VECTORS.md) - Detailed attack scenarios and defenses

### 🤖 For AI Agents (Like Claude Code)

**Read this:** [`CLAUDE.md`](./CLAUDE.md) 🤖
- **Purpose:** Help AI understand the codebase and follow security best practices
- **Content:** Architecture, conventions, security rules, deployment guide
- **Critical rules:**
  - NEVER store private keys in Zustand state
  - Always use `secureKeyManager` for key management
  - Simulate transactions before signing
  - Use HTTPS for all RPC endpoints

---

## 📁 File Index

| File | Audience | Language | Length | Purpose |
|------|----------|----------|--------|---------|
| `SECURITY_FOR_USERS.md` | 👤 End Users | 🇬🇧 English | ~200 lines | Safety guide for wallet users |
| `CLAUDE.md` | 👨‍💻 Developers / 🤖 AI | 🇬🇧 English | ~130 lines | Project documentation & security guidelines |
| `COMPREHENSIVE_SECURITY_ANALYSIS.md` | 🔍 Auditors | 🇬🇧 English | ~680 lines | Full security audit report |
| `SECURITY_ATTACK_VECTORS.md` | 🔍 Auditors | 🇬🇧 English | ~430 lines | Attack scenarios & defenses |
| `verify-production.md` | 👨‍💻 DevOps | 🇬🇧 English | ~360 lines | Production deployment verification |
| `test-security-headers.sh` | 👨‍💻 DevOps | Bash | ~130 lines | Automated security testing script |

---

## ❓ Which Document Should I Read?

### "I'm a user of this wallet app"
→ Read **`SECURITY_FOR_USERS.md`**

### "I want to contribute code to this project"
→ Read **`CLAUDE.md`** first, then **`WHY_MORE_SECURE.md`** 📘

### "I'm auditing this project for security vulnerabilities"
→ Read **`COMPREHENSIVE_SECURITY_ANALYSIS.md`** and **`SECURITY_ATTACK_VECTORS.md`** 🔍

### "I'm deploying this to production"
→ Read **`CLAUDE.md`** (Production Deployment section) and **`verify-production.md`** 🚀

### "I cloned this repo and want to understand how it works"
→ Read **`CLAUDE.md`** first 📘

### "I'm an AI agent helping with this codebase"
→ Read **`CLAUDE.md`** 🤖

---

## 🔒 Security Score

**Current:** 7/10 (Production-ready)
**Previous:** 3/10 (Not production-ready)

**What was fixed:** 16 vulnerabilities (4 CRITICAL, 3 HIGH, 3 MEDIUM, 2 LOW, 4 additional features)

**What remains:**
- Browser extension risks (requires user awareness)
- Phishing attacks (requires user awareness)
- Social engineering (requires user awareness)
- Physical access (requires device security)

These remaining risks cannot be fully mitigated at the application level and require user education.

---

## 🤝 Contributing

When contributing to this project:
1. Read `CLAUDE.md` to understand the architecture and security guidelines
2. NEVER store private keys in Zustand state or any window-accessible object
3. Always use `secureKeyManager` for key management
4. Follow the security guidelines in `CLAUDE.md`
5. Test your changes with `npm run build` and verify no security regressions

---

## 📞 Security Issues

If you discover a security vulnerability:
1. **DO NOT** open a public GitHub issue
2. Email: security@yourproject.com (replace with actual email)
3. Or open a private security advisory on GitHub

We take security seriously and will respond promptly to all reports.

---

## 🎯 Quick Start

```bash
# For users: Just use the app, read SECURITY_FOR_USERS.md

# For developers:
npm install
npm run dev          # Development mode
npm run build        # Production build
npm run start        # Production server

# Verify security:
./test-security-headers.sh

# Read documentation:
cat CLAUDE.md        # Start here!
```

---

**Remember:** Security is a shared responsibility between the application and the user. We've built strong protections, but users must also practice good security hygiene!
