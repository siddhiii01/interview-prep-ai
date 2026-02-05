import {MessageThreadCollapsible} from "./components/tambo/message-thread-collapsible.tsx"
import { Whiteboard } from "./components/tambo/Whiteboard"
import { CodeEditor } from "./components/CodeEditor.jsx"
import { useState } from 'react' 
import { ResultsDisplay } from "./components/ResultDisplay.jsx";

function App() {

  const [results, setResults] = useState({
    output: '',
    executionTime: null,
    status: 'idle',  // idle, loading, success, error
    error: null
  });

  const handleRunCode = (code, language) => {
    console.log('──────────────────────────────');
    console.log(`RUN REQUEST ── Language: ${language}`);
    console.log('Code:');
    console.log(code);
    console.log('──────────────────────────────');

    // ✅ Show loading state
    setResults({
      output: '',
      executionTime: null,
      status: 'loading',
      error: null
    });

    // ✅ Simulate backend response (2 second delay)
    setTimeout(() => {
      // Mock success response
      setResults({
        output: `Mock output for ${language}:\n${code.substring(0, 50)}...`,
        executionTime: 0.002,
        status: 'success',
        error: null
      });
    }, 2000);
  };

  


    
  
  return (
    <>
      <h1>Welcome to My Drawing App</h1>
      <MessageThreadCollapsible/>
      {/* <Whiteboard /> */}
      <CodeEditor 
        onRunCode={handleRunCode}
      />

      {/* ✅ Add ResultsDisplay */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <ResultsDisplay {...results} />

      </div>
    </>
  );
}

export default App
