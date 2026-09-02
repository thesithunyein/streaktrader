# Contributing to StreakTrader

Thank you for your interest in contributing to StreakTrader! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `npx hardhat test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npx hardhat test

# Build for production
npm run build
```

## Code Style

- Use TypeScript for all new files
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in imperative mood
- Keep the first line under 72 characters
- Reference issues when applicable

Example:
```
Add streak multiplier calculation

- Implement exponential multiplier based on consecutive wins
- Add unit tests for edge cases
- Update documentation

Closes #42
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all tests pass
3. Request review from maintainers
4. Address review comments
5. Merge after approval

## Smart Contract Changes

- All contract changes must include tests
- Run `npx hardhat test` before submitting
- Document any breaking changes
- Consider gas optimization

## Reporting Bugs

- Use GitHub Issues
- Include steps to reproduce
- Include expected vs actual behavior
- Include browser/OS information

## Feature Requests

- Use GitHub Issues
- Clearly describe the feature
- Explain the use case
- Consider implementation complexity

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
