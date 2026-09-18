# 💳 Sovereign Treasury — Dual-Rail Payment Gateways & Settlement Engine

> **Corporate Core Division of Saifee Burhani (SB) Group**  
> **Executive Leader**: Thaddeus 'Thad' Stone, Chief Financial Officer  
> **Architecture**: Zero-Dependency Python (	reasury_engine.py)  
> **Supported Rails**: Razorpay (UPI, NetBanking, Cards) & PayPal (Global Cards)  

---

## Executive Overview
The Sovereign Treasury Engine unifies domestic and international revenue settlement across all SB Group subsidiaries into a single, air-gapped financial hub.

## Dual Payment Rail Infrastructure
1. **Razorpay Indian Domestic Rail**:
   - Native UPI QR codes, instant UPI intent, NetBanking, and RuPay cards.
   - HMAC-SHA256 signature verification on inbound webhooks (payment.captured, order.paid).
2. **PayPal International Rail**:
   - Multi-currency global payments (USD, EUR, GBP, AED, SAR) for international customers.
   - Automated webhook listener (PAYMENT.CAPTURE.COMPLETED) with automated digital asset fulfillment.

## Core Features
- 1-Click Dynamic Payment Link Generator (/api/treasury/create_link)
- Live Transaction Audit Ledger (	ransactions.json) with auto-reconciliation
- Zero Cloud Leakage: Secrets managed securely in encrypted environment vaults
