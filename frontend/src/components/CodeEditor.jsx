import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'sql', name: 'SQL' },
];

const CODE_TEMPLATES = {
  python: `# Python - Performance timing example
import time

start = time.time()

# ← Write your code here

end = time.time()
print(f"Time taken: {end - start:.6f} seconds")
`,
  javascript: `// JavaScript - Performance timing example
const start = performance.now();

// ← Write your code here

const end = performance.now();
console.log(\`Time taken: \${(end - start).toFixed(6)} ms\`);
`,
  sql: `-- SQL - Example query
SELECT id, username, joined_at
FROM users
WHERE active = true
  AND age >= 18
ORDER BY joined_at DESC
LIMIT 20;
`
};

export const CodeEditor = ({ 
    onRunCode,
    initialLanguage = 'python',
    initialCode = null
}) => {
    const editorRef = useRef(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(initialLanguage);
    const [isExecuting, setIsExecuting] = useState(false);

    // Load initial code/template on mount only
    useEffect(() => {
        if (initialCode) {
            setCode(initialCode);
        } else {
            setCode(CODE_TEMPLATES[language]);
        }
    }, []); // ✅ Empty dependency array

    const handleEditorChange = (value) => {
        setCode(value);  // ✅ Clean
    }

    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        setLanguage(newLang);
        setCode(CODE_TEMPLATES[newLang]); // Load new template
    }

    const handleRun = () => {
        const trimmed = code.trim();
        if (!trimmed) {
            alert("Please write some code before running.");
            return;
        }

        setIsExecuting(true);

        setTimeout(() => {
            if (onRunCode) {  // ✅ Safety check
                onRunCode(trimmed, language);
            }
            setIsExecuting(false);
        }, 1200);
    };

    const isRunDisabled = isExecuting || code.trim() === '';

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '16px' }}>Code Editor</h2>
            
            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                {/* Language selector */}
                <div>
                    <label style={{ marginRight: '8px', fontWeight: 600 }}>
                        Language:
                    </label>
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        style={{
                            padding: '8px 12px',
                            fontSize: '15px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            minWidth: '140px',
                        }}
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Run button */}
                <button
                    onClick={handleRun}
                    disabled={isRunDisabled}
                    style={{
                        padding: '10px 20px',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: 'white',
                        backgroundColor: isExecuting ? '#60a5fa' : 
                                       isRunDisabled ? '#9ca3af' : '#3b82f6',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isRunDisabled ? 'not-allowed' : 'pointer',
                        opacity: isRunDisabled && !isExecuting ? 0.65 : 1,
                        transition: 'all 0.2s',
                    }}
                >
                    {isExecuting ? 'Executing...' : 'Run Code ▶'}
                </button>
            </div>

            {/* Editor */}
            <div style={{ height: '500px', border: '1px solid #ccc' }}>
                <Editor 
                    height="100%"
                    language={language}
                    value={code}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
}