# Security Policy

## Supported Versions

This project is currently in **development/demo** status. Use only for learning and local development.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Considerations

### Environment Variables
- **NEVER** commit `.env` files with real private keys
- Use separate keys for development vs production
- The provided example keys are for local Ganache only

### Dependencies
Current known vulnerabilities in development dependencies:
- `ganache@7.4.3` - Contains outdated cryptographic libraries (elliptic, secp256k1)
- Various other dev dependencies with moderate vulnerabilities

**Mitigation**: These are development-only dependencies and don't affect production builds.

### Smart Contract
- Uses session-based voting to prevent double voting
- Admin functions are properly protected
- Events logged for transparency

### Production Deployment
For production use:
1. Use a properly secured environment
2. Update all dependencies to latest versions
3. Audit smart contracts thoroughly
4. Use hardware wallets for admin functions
5. Deploy to testnets first

## Reporting a Vulnerability

To report a security vulnerability:
1. **DO NOT** open a public issue
2. Create a private issue or email the maintainers
3. Include steps to reproduce and potential impact
4. Allow time for proper investigation and fix

Response timeline:
- Initial response: Within 48 hours
- Status updates: Weekly until resolved
- Fix timeline: Depends on severity (24 hours for critical, 1 week for moderate) 