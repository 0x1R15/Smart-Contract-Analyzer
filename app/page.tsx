'use client';

import { useRef, useState } from 'react';
import { analyzer, Vulnerability, getSeverityColorCode } from '@/lib/analyzer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Download, Upload, Trash2 } from 'lucide-react';

export default function Page() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sourceCode, setSourceCode] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.sol')) {
      alert('Please select a valid Solidity file (.sol)');
      return;
    }

    setFileName(file.name);
    const content = await file.text();
    setSourceCode(content);
    performAnalysis(content);
  };

  const performAnalysis = (code: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const results = analyzer.analyze(code);
      setVulnerabilities(results);
      setIsAnalyzing(false);
    }, 300);
  };

  const exportJSON = () => {
    const report = {
      fileName,
      timestamp: new Date().toISOString(),
      totalVulnerabilities: vulnerabilities.length,
      vulnerabilities: vulnerabilities.map(v => ({
        title: v.title,
        severity: v.severity,
        description: v.description,
        suggestedFix: v.suggestedFix,
        pattern: v.pattern,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    downloadFile(blob, `${fileName.replace('.sol', '')}_report.json`);
  };

  const exportText = () => {
    let text = `Smart Contract Vulnerability Report\n`;
    text += `File: ${fileName}\n`;
    text += `Date: ${new Date().toISOString()}\n`;
    text += `Total Issues: ${vulnerabilities.length}\n`;
    text += `\n${'='.repeat(80)}\n\n`;

    vulnerabilities.forEach((vuln, index) => {
      text += `[${index + 1}] ${vuln.title}\n`;
      text += `Severity: ${vuln.severity}\n`;
      text += `Pattern: ${vuln.pattern}\n\n`;
      text += `Description:\n${vuln.description}\n\n`;
      text += `Suggested Fix:\n${vuln.suggestedFix}\n`;
      text += `\n${'-'.repeat(80)}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    downloadFile(blob, `${fileName.replace('.sol', '')}_report.txt`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAnalysis = () => {
    setVulnerabilities([]);
    setFileName('');
    setSourceCode('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Smart Contract Vulnerability Analyzer</h1>
          <p className="mt-2 text-muted-foreground">
            Static security analysis tool for Solidity smart contracts
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Input Section */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Load Solidity Contract</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sol"
                onChange={handleFileSelect}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:rounded file:border-0
                  file:bg-primary file:px-4 file:py-2
                  file:text-sm file:font-semibold file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>

            {fileName && (
              <div className="text-sm text-muted-foreground">
                Selected file: <span className="font-semibold text-foreground">{fileName}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (sourceCode) {
                    performAnalysis(sourceCode);
                  }
                }}
                disabled={!sourceCode || isAnalyzing}
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
              <Button variant="outline" onClick={clearAnalysis} disabled={!fileName} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Section */}
        {vulnerabilities.length > 0 && (
          <div className="space-y-4">
            {/* Export Options */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Analysis Results</p>
                  <p className="text-sm text-muted-foreground">
                    Found {vulnerabilities.length} issue(s)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={exportJSON}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button
                    onClick={exportText}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export TXT
                  </Button>
                </div>
              </div>
            </Card>

            {/* Vulnerability List */}
            <div className="space-y-3">
              {vulnerabilities.map((vuln) => {
                const bgColor = getSeverityColorCode(vuln.severity);
                return (
                  <Card
                    key={vuln.id}
                    className="p-4 border-l-4"
                    style={{ borderLeftColor: bgColor }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{vuln.title}</h3>
                          <p className="text-xs font-medium mt-1" style={{ color: bgColor }}>
                            {vuln.severity}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
                          {vuln.pattern}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">{vuln.description}</p>

                      <div className="bg-muted/50 p-3 rounded text-sm space-y-1">
                        <p className="font-semibold text-xs uppercase text-muted-foreground">Suggested Fix:</p>
                        <p>{vuln.suggestedFix}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {fileName && vulnerabilities.length === 0 && !isAnalyzing && (
          <Card className="p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold">No Vulnerabilities Found</h3>
            <p className="text-muted-foreground mt-2">
              The analyzed contract passed all security checks.
            </p>
          </Card>
        )}

        {/* Initial State */}
        {!fileName && (
          <Card className="p-12 text-center border-dashed">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Load a Solidity Contract</h3>
            <p className="text-muted-foreground mt-2">
              Select a .sol file to begin the security analysis.
            </p>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-12">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Smart Contract Vulnerability Analyzer - Static analysis only. Not a replacement for professional audits.</p>
        </div>
      </footer>
    </div>
  );
}
