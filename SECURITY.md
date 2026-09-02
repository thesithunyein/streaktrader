# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within StreakTrader, please send an email to sithunyein.mailto@gmail.com. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

## Scope

This security policy applies to:

- The StreakTrader web application
- The smart contracts deployed on Somnia Shannon Testnet
- The API endpoints

## Smart Contract Security

StreakTrader's smart contracts have been developed with the following security considerations:

- **Access Control:** Owner-only functions are protected with `onlyOwner` modifiers
- **Reentrancy Protection:** State changes occur before external calls
- **Input Validation:** All function parameters are validated
- **Integer Overflow:** Solidity 0.8.x built-in overflow protection

## Known Limitations

- This is a hackathon prototype deployed on testnet
- Smart contracts have not been audited
- Use at your own risk on testnet

## Best Practices for Users

1. **Never share your private keys** or seed phrases
2. **Verify contract addresses** before interacting
3. **Use testnet only** — do not send real funds
4. **Revoke approvals** after testing

## Disclosure Policy

When a security vulnerability is reported:

1. We will acknowledge receipt within 48 hours
2. We will provide an estimated timeline for a fix
3. We will notify the reporter when the fix is deployed
4. We will publicly disclose the vulnerability after the fix is live

## Contact

For security inquiries: sithunyein.mailto@gmail.com
