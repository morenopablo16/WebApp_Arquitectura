<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<h1 align="center">CIBMAQ Architecture Configurator</h1>

<p align="center">
Interactive tool to design and visualize industrial cybersecurity architectures based on real use cases.
</p>

---

## 🎥 Demo

<div align="center">

<video src="./demo_arq.mp4" controls width="900"></video>

</div>

---

## 🧠 What is this?

This project is an **industrial cybersecurity architecture configurator**.

It allows you to:

- Select industrial use cases (remote maintenance, telemetry, cloud, AI…)
- Automatically determine the **recommended architecture**
- Visualize:
  - Architecture layers (OT / Edge / Cloud)
  - Required components
  - Data flows
- Generate a **clear and structured architecture diagram**

---

## ⚙️ Features

- 🧩 Use-case driven architecture selection
- 🏗️ Multi-layer architecture (OT / Edge / Cloud)
- 🔐 Security-first design (VPN, MFA, segmentation, logging)
- 📊 Visual network diagrams
- 🧠 Scalable architecture logic (A0 → A7 models)

---

## 🏗️ Architecture Logic

The tool is based on a decision matrix that maps:

| Need | Architecture |
|------|-------------|
| Local only | A0 |
| Telemetry | A2 |
| Remote maintenance | A4 |
| Telemetry + maintenance | A5 |
| IT/OT integration | A6 |
| AI / analytics | A7 |

---

## 🚀 Run Locally

### Prerequisites
- Node.js

### Setup

1. Install dependencies  
   ```bash
   npm install
   ```
2. Run the app
 ```bash
   npm run dev
   ```