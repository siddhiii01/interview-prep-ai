import { useState } from 'react';

export const ResultsDisplay = ({ 
    output,
    executionTime,
    status,  // "idle" | "loading" | "success" | "error"
    error 
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Idle state - nothing run yet
    if (status === 'idle') {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                color: '#6b7280',
                marginTop: '20px'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                <div>Write some code and click Run to see results</div>
            </div>
        );
    }

    // Loading state
    if (status === 'loading') {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '4px solid #3b82f6',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                }}></div>
                <div style={{ color: '#1e40af', fontWeight: 500 }}>
                    Executing code...
                </div>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Error state
    if (status === 'error') {
        return (
            <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '20px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    color: '#991b1b',
                    fontWeight: 600
                }}>
                    <span>❌</span>
                    <span>Execution Failed</span>
                </div>

                {/* Error message */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        marginBottom: '4px',
                        color: '#991b1b'
                    }}>
                        Error:
                    </div>
                    <div style={{
                        backgroundColor: '#fee2e2',
                        padding: '12px',
                        borderRadius: '6px',
                        borderLeft: '4px solid #dc2626',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#7f1d1d'
                    }}>
                        {error}
                    </div>
                </div>

                {/* Execution time if available */}
                {executionTime !== null && (
                    <div style={{ fontSize: '13px', color: '#991b1b' }}>
                        ⏱️ Execution time: {executionTime}s
                    </div>
                )}
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        const timeColor = executionTime < 0.01 ? '#16a34a' :
                         executionTime < 0.1 ? '#16a34a' :
                         executionTime < 1 ? '#ca8a04' : '#dc2626';
        
        const timeIcon = executionTime < 0.01 ? '⚡' :
                        executionTime < 1 ? '⏱️' : '🐌';

        return (
            <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '20px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    color: '#166534',
                    fontWeight: 600
                }}>
                    <span>✅</span>
                    <span>Execution Successful</span>
                </div>

                {/* Output section */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <div style={{ 
                            fontSize: '12px', 
                            fontWeight: 600,
                            color: '#166534'
                        }}>
                            Output:
                        </div>
                        <button
                            onClick={handleCopy}
                            style={{
                                fontSize: '11px',
                                padding: '4px 8px',
                                backgroundColor: '#374151',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    <pre style={{
                        backgroundColor: '#1f2937',
                        color: '#10b981',
                        padding: '16px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        margin: 0
                    }}>
                        {output || '(no output - code executed successfully)'}
                    </pre>
                </div>

                {/* Execution time */}
                {executionTime !== null && (
                    <div style={{ 
                        fontSize: '13px', 
                        color: timeColor,
                        fontWeight: 500
                    }}>
                        {timeIcon} Execution time: {executionTime}s
                        {executionTime < 0.01 && ' - Lightning fast!'}
                        {executionTime >= 1 && ' - Slow execution'}
                    </div>
                )}
            </div>
        );
    }

    return null;
};