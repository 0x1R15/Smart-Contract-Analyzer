# Smart Contract Vulnerability Analyzer

A modern, responsive static security analysis tool for Solidity smart contracts. This application parses Solidity code and flags common vulnerabilities, design flaws, and gas inefficiencies to help developers secure their smart contracts before deployment.

Built with Next.js, React, Tailwind CSS, and @solidity-parser/parser.

---

## Features

- **Static Analysis Engine:** Inspects Solidity source code using an Abstract Syntax Tree (AST) parser to identify issues.
- **Vulnerability Diagnostics:** Detects and classifies issues across 8 distinct categories:
  - **Reentrancy:** Triggers when external calls are executed without proper guard modifiers.
  - **Missing Access Control:** Identifies public/external state-changing functions lacking authorization rules.
  - **tx.origin Authentication:** Warns against using tx.origin for caller validation.
  - **Unsafe Low-Level Calls:** Detects unchecked return values from .call(), .delegatecall(), or .staticcall().
  - **Integer Overflow/Underflow:** Checks arithmetic operations under older Solidity versions (< 0.8) without SafeMath.
  - **Delegatecall Safety:** Warns on dynamic delegatecall implementations.
  - **Front-Running (Timestamp Dependency):** Flags dependencies on block.timestamp or block.number combined with state transitions.
  - **Gas Inefficiencies:** Identifies optimization opportunities like nested loops or multiple storage writes.
- **Interactive Dashboard:** Premium dark-themed user interface with clean glassmorphism styling, real-time feedback, and dynamic layout.
- **Reporting & Exporting:** Download security audit reports in JSON or TXT formats.

---

## Getting Started

### Prerequisites

Ensure you have Node.js installed.

### Installation

1. Navigate to the project directory:
   ```bash
   cd smart-contract-analyzer
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to http://localhost:3000 to use the application.

---

## Testing

A suite of test files is provided in the test_contracts folder to showcase the analyzer's capabilities. Upload them directly in the UI to see the detection rules in action:

- [ReentrancyTest.sol](./test_contracts/ReentrancyTest.sol): Flags reentrant transfer vulnerabilities.
- [AccessControlTest.sol](./test_contracts/AccessControlTest.sol): Flags unprotected state changes.
- [TxOriginTest.sol](./test_contracts/TxOriginTest.sol): Flags phishable ownership authentication.
- [UnsafeCallsTest.sol](./test_contracts/UnsafeCallsTest.sol): Flags ignored return values on external calls.
- [OverflowTest.sol](./test_contracts/OverflowTest.sol): Flags old compiler versions lacking SafeMath.
- [DelegatecallTest.sol](./test_contracts/DelegatecallTest.sol): Flags dynamic delegates.
- [GasOptimizationTest.sol](./test_contracts/GasOptimizationTest.sol): Flags loops and redundant storage writes.
- [FrontRunningTest.sol](./test_contracts/FrontRunningTest.sol): Flags block timestamp manipulation risks.
- [SecureContract.sol](./test_contracts/SecureContract.sol): An example of a secure contract that bypasses all flags by implementing proper checks-effects-interactions and access modifier patterns.

---

## Disclaimer

This tool performs static syntax and pattern analysis only. It is intended for educational and local developer testing purposes and should never be used as a replacement for professional, human-led security audits.
