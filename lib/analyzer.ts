import { parse } from '@solidity-parser/parser';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  suggestedFix: string;
  line?: number;
  pattern: string;
}

const SEVERITY_ORDER: Record<Severity, number> = {
  'Critical': 4,
  'High': 3,
  'Medium': 2,
  'Low': 1,
};

function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'Critical':
      return '#dc2626';
    case 'High':
      return '#ea580c';
    case 'Medium':
      return '#eab308';
    case 'Low':
      return '#16a34a';
  }
}

class VulnerabilityAnalyzer {
  private vulnerabilities: Vulnerability[] = [];
  private sourceCode: string = '';

  analyze(solidityCode: string): Vulnerability[] {
    this.vulnerabilities = [];
    this.sourceCode = solidityCode;

    try {
      const ast = parse(solidityCode, { loc: true, range: true });
      this.detectVulnerabilities(ast);
    } catch (error) {
      console.error('Parsing error:', error);
      this.vulnerabilities.push({
        id: 'parse_error',
        title: 'Parse Error',
        description: `Failed to parse contract: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'High',
        suggestedFix: 'Ensure the Solidity contract syntax is valid. Check for typos and correct syntax.',
        pattern: 'Syntax',
      });
    }

    return this.vulnerabilities.sort(
      (a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]
    );
  }

  private detectVulnerabilities(ast: any): void {
    this.checkReentrancy(ast);
    this.checkAccessControl(ast);
    this.checkTxOrigin(ast);
    this.checkUnsafeExternalCalls(ast);
    this.checkIntegerOverflow(ast);
    this.checkDelegateCall(ast);
    this.checkGasOptimizations(ast);
    this.checkFrontRunning(ast);
  }

  private checkReentrancy(ast: any): void {
    const code = this.sourceCode;
    const reentrancyPatterns = [
      /call\s*\{[^}]*\}|\.call\(/g,
      /\.send\(|\.transfer\(/g,
    ];

    let hasExternalCall = false;
    for (const pattern of reentrancyPatterns) {
      if (pattern.test(code)) {
        hasExternalCall = true;
        break;
      }
    }

    if (hasExternalCall && !code.includes('ReentrancyGuard') && !code.includes('nonReentrant')) {
      this.vulnerabilities.push({
        id: 'reentrancy_' + Date.now(),
        title: 'Potential Reentrancy Vulnerability',
        description:
          'External calls detected without reentrancy protection. If state is updated after external calls, reentrancy attacks are possible.',
        severity: 'Critical',
        suggestedFix:
          'Use OpenZeppelin ReentrancyGuard with @nonReentrant modifier or apply the Checks-Effects-Interactions pattern: verify conditions, update state, then call external contracts.',
        pattern: 'Reentrancy',
      });
    }
  }

  private checkAccessControl(ast: any): void {
    const code = this.sourceCode;
    const functionRegex = /function\s+\w+\s*\([^)]*\)\s*(public|external|internal|private)/g;
    const publicFunctions = [...code.matchAll(functionRegex)];

    let unprotectedPublicFunctions = 0;
    for (const match of publicFunctions) {
      const fnDecl = match[0];
      if ((fnDecl.includes('public') || fnDecl.includes('external')) &&
          !code.substring(Math.max(0, match.index! - 200), match.index).includes('onlyOwner') &&
          !code.substring(Math.max(0, match.index! - 200), match.index).includes('require(')) {
        unprotectedPublicFunctions++;
      }
    }

    if (unprotectedPublicFunctions > 0) {
      this.vulnerabilities.push({
        id: 'access_control_' + Date.now(),
        title: 'Missing Access Control',
        description: `Found ${unprotectedPublicFunctions} public/external function(s) without obvious access control modifiers or checks.`,
        severity: 'High',
        suggestedFix:
          'Implement proper access control using modifiers like @onlyOwner, @onlyAdmin, or implement custom require() statements to verify caller permissions.',
        pattern: 'Access Control',
      });
    }
  }

  private checkTxOrigin(ast: any): void {
    const code = this.sourceCode;
    if (/tx\.origin/g.test(code)) {
      this.vulnerabilities.push({
        id: 'tx_origin_' + Date.now(),
        title: 'Use of tx.origin for Authentication',
        description:
          'tx.origin is used in the contract. This is unsafe as it can be manipulated through intermediary contracts in a phishing attack.',
        severity: 'Critical',
        suggestedFix:
          'Replace tx.origin with msg.sender. Always use msg.sender for access control checks instead of tx.origin.',
        pattern: 'tx.origin',
      });
    }
  }

  private checkUnsafeExternalCalls(ast: any): void {
    const code = this.sourceCode;
    const lowLevelCallRegex = /\.call\s*\{|\.delegatecall\s*\{|\.staticcall\s*\{/g;
    const matches = [...code.matchAll(lowLevelCallRegex)];

    if (matches.length > 0) {
      let callsWithoutReturnCheck = 0;
      for (const match of matches) {
        const afterCall = code.substring(match.index!, match.index! + 500);
        if (!afterCall.includes('require(') && !afterCall.includes('assert(')) {
          callsWithoutReturnCheck++;
        }
      }

      if (callsWithoutReturnCheck > 0) {
        this.vulnerabilities.push({
          id: 'unsafe_calls_' + Date.now(),
          title: 'Unsafe External Calls Without Return Check',
          description: `Found ${callsWithoutReturnCheck} low-level call(s) without verifying return values. Failed calls will silently fail.`,
          severity: 'High',
          suggestedFix:
            'Always check the return value of low-level calls. Use require(success, "Call failed") or wrap with try-catch to handle failures gracefully.',
          pattern: 'Unsafe External Calls',
        });
      }
    }
  }

  private checkIntegerOverflow(ast: any): void {
    const code = this.sourceCode;
    const hasSafemath = code.includes('SafeMath') || code.includes('pragma solidity ^0.8');
    const hasUintOperations = /\+|-|\*|\//.test(code) && /uint\d*\s+\w+|uint\s+\w+/.test(code);

    if (hasUintOperations && !hasSafemath && !code.includes('pragma solidity ^0.8')) {
      this.vulnerabilities.push({
        id: 'overflow_' + Date.now(),
        title: 'Potential Integer Overflow/Underflow',
        description:
          'Contract uses arithmetic operations on unsigned integers without SafeMath. In Solidity < 0.8, overflow/underflow is not prevented.',
        severity: 'High',
        suggestedFix:
          'Use Solidity 0.8+ for built-in overflow checks, or import OpenZeppelin SafeMath library for older versions.',
        pattern: 'Integer Overflow',
      });
    }
  }

  private checkDelegateCall(ast: any): void {
    const code = this.sourceCode;
    if (/delegatecall/g.test(code)) {
      const delegatecallCount = [...code.matchAll(/delegatecall/g)].length;
      this.vulnerabilities.push({
        id: 'delegatecall_' + Date.now(),
        title: 'Use of Delegatecall',
        description: `Found ${delegatecallCount} delegatecall(s) in the contract. Delegatecall can be dangerous if not used carefully.`,
        severity: 'Medium',
        suggestedFix:
          'Only use delegatecall with trusted, audited contracts. Ensure the called contract cannot modify critical state variables. Consider using upgradeable proxy patterns carefully.',
        pattern: 'Delegatecall',
      });
    }
  }

  private checkGasOptimizations(ast: any): void {
    const code = this.sourceCode;
    const loopsRegex = /for\s*\([^)]*\)|while\s*\([^)]*\)/g;
    const loops = [...code.matchAll(loopsRegex)].length;

    if (loops > 2) {
      this.vulnerabilities.push({
        id: 'gas_' + Date.now(),
        title: 'Gas Inefficiency - Multiple Loops',
        description: `Found ${loops} loop(s) in the contract. Multiple loops can cause gas inefficiency.`,
        severity: 'Low',
        suggestedFix:
          'Optimize loops by caching array length, combining loops where possible, or using batch processing patterns to reduce gas costs.',
        pattern: 'Gas Optimization',
      });
    }

    if (/storage\s+\w+\s*=/g.test(code)) {
      const storageWrites = [...code.matchAll(/storage\s+\w+\s*=/g)].length;
      if (storageWrites > 3) {
        this.vulnerabilities.push({
          id: 'gas_storage_' + Date.now(),
          title: 'Gas Inefficiency - Excessive Storage Operations',
          description: 'Multiple storage writes detected. Storage operations are expensive in terms of gas.',
          severity: 'Low',
          suggestedFix:
            'Use local variables to reduce storage writes. Only update storage once at the end of a function if possible.',
          pattern: 'Storage Operations',
        });
      }
    }
  }

  private checkFrontRunning(ast: any): void {
    const code = this.sourceCode;
    const dependsOnBlockNumber = /block\.number|block\.timestamp/g.test(code);
    const hasStateTransitions = /uint\s+\w+|mapping/g.test(code);

    if (dependsOnBlockNumber && hasStateTransitions) {
      this.vulnerabilities.push({
        id: 'frontrun_' + Date.now(),
        title: 'Potential Front-Running Vulnerability',
        description:
          'Contract depends on block.timestamp or block.number with state transitions. This may be vulnerable to front-running attacks.',
        severity: 'Medium',
        suggestedFix:
          'Avoid using predictable values like block.timestamp for critical logic. Use commit-reveal patterns or other mitigation strategies for sensitive operations.',
        pattern: 'Front-Running',
      });
    }
  }
}

export function getSeverityColorCode(severity: Severity): string {
  return getSeverityColor(severity);
}

export const analyzer = new VulnerabilityAnalyzer();
