// Whiteboard.tsx
import React, { useState, useRef } from "react";
import  {Excalidraw, exportToBlob}  from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css"; // ← very important!

import axios from "axios";
import { parseDrawing } from "../../services/whiteboardAnalyzer";

// export const Whiteboard = () =>  {
//     //State: saving what previously drawn
//   const [excalidrawAPI, setExcalidrawAPI] = useState(null);
//   const [base64Image, setBase64Image] = useState(null);
//   const [aiResponse, setAiResponse] = useState(""); //stores what AI says
//   const [isAnalyzing, setIsAnalyzing] = useState(false) //waiting for AI loading state

//     //clear function -> clears the entire canvas
//   const handleClear = () => {
//     excalidrawAPI?.resetScene();
//   };

//   //save function 
//   const handleSave = async () => {
//     if (!excalidrawAPI){
//         alert("Canvas not ready yet")
//         return;
//     };

//     try {
//         //exporting canvas as png 
//         const elements = excalidrawAPI.getSceneElements()
//         console.log("Elements:", elements);
//         if (elements.length === 0) {
//             alert("Please draw something first!");
//             return;
//         }


//         //Canvas drawing → Blob (binary image data)
//         //Blob → Base64 (text that AI can read)
//         //get the canvas a blob (images data)
//         const blob = await exportToBlob({
//             elements,                             // required
//             appState: excalidrawAPI.getAppState(), // required for background, zoom, etc.
//             files: excalidrawAPI.getFiles(),
//             mimeType: "image/png",
//             quality: 0.95
//         });
//         console.log("Blob created:", blob);

//          // Convert blob to base64 (AI needs this format)
//          //Browser API for reading file data
//          const reader = new FileReader()
//          reader.readAsDataURL(blob); //Converts blob to base64 string

//          reader.onloadend = () => {
//             const img = reader.result;
//             setBase64Image(img);

//             console.log("Image ready for AI:", img.substring(0, 50) + "...");
//             alert("Image exported! Now click 'Analyze with AI'");
//          }
//          console.log(reader)

//     } catch(error) {
//         console.error("Error exporting image:", error);
//         alert("Failed to export image");
//     }

//     } 

//     //AI anlayses
//     const handleAnalyze = async () => {
//         if (!base64Image) {
//             alert("Export the image first with Save button!");
//             return;
//         }
//         if (!excalidrawAPI) {
//             alert("Canvas not ready yet!");
//             return;
//         }
        

//         try{

//             setIsAnalyzing(true);
//             setAiResponse(""); // Clear previous response

//             //Send to Claude API 
//             console.log("Sending to Claude AI...");
//             const apiKey = "AIzaSyBwOH5CixGR6uwccIqUfYPTNS9EzC6lkXQ";

//             const response = await axios.post(
//             "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBwOH5CixGR6uwccIqUfYPTNS9EzC6lkXQ"
//             ,
//             {
//                 contents: [
//                 {
//                     parts: [
//                     {
//                         text: "Please analyze this drawing from Excalidraw..."
//                     },
//                     {
//                         inlineData: {
//                         mimeType: "image/png",
//                         data: base64Image.split(",")[1], // remove data:image/png;base64,
//                         },
//                     },
//                     ],
//                 },
//                 ],
//                 generationConfig: {
//                 temperature: 0.7,
//                 maxOutputTokens: 1024,
//                 },
//             },
//             {
//                 headers: {
//                 "Content-Type": "application/json",
//                 },
//             }
//             );

//             console.log(response.data)
//             const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI"

//             console.log("Gemini Response:", aiText);
//             alert("AI Analysis:\n\n" + aiText); // or show in UI/modal

//         } catch(error){
//             console.error("Gemini API error:", error?.response?.data || error.message);
//             alert("Failed to get AI analysis. Check console. (API key? Rate limit?)");
//         }

//     }

//   return (
//     <div style={{ height: "100vh", width: "100%", position: "relative" }}>
//       {/* Give it full height — very important! */}

//         <div style={{ position: "absolute", top: 80, left: 10, zIndex: 10 }}>
//             <button onClick={handleClear}>Clear Canvas</button>
//             <button onClick={handleSave} style={{ marginLeft: 10 }}>
//                 Save .excalidraw
//             </button>
//             <button onClick={handleAnalyze} style={{ marginLeft: 10, backgroundColor: "#2196F3", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
//                 Analyze with AI
//             </button>
//         </div>

//       <div style={{ height: "500px", width: "100%" }}>
//           <Excalidraw
//             excalidrawAPI={setExcalidrawAPI}
//           />
//       </div>
      


//       {/* AI Response Section */}
//       {(isAnalyzing || aiResponse) && (
//         <div style={{
//           marginTop: "20px",
//           padding: "20px",
//           backgroundColor: "#f5f5f5",
//           borderRadius: "8px",
//           border: "1px solid #ddd"
//         }}>
//           <h3>🤖 AI Analysis:</h3>
//           {isAnalyzing ? (
//             <p style={{ fontStyle: "italic", color: "#666" }}>
//               Analyzing your drawing... 🔄
//             </p>
//           ) : (
//             <p style={{ whiteSpace: "pre-wrap" }}>{aiResponse}</p>
//           )}
//         </div>
//       )}


//     </div>
//   );
// }

export const Whiteboard = () => {
  const [elements, setElements] = useState([]);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  //This get fires on every move and chnage on canvas
  const handleChange = (els) => {
    setElements(els);
    console.log(els)
  }

  //Saving the elements of canvas
  const handleSave = async () => {

    if (!excalidrawAPI) {
      alert("API not ready");
      return;
    }
    const sceneElements  = excalidrawAPI.getSceneElements() //array of elements
    const appState = excalidrawAPI.getAppState(); //Returns current appState.
    const files = excalidrawAPI.getFiles(); //get the files present in the scene.
    console.log("Current Scene Elements: ", sceneElements);
    if (sceneElements.length === 0) {
      alert("Please draw something first!");
      return;
    }

    //Canvas drawing → Blob (binary image data)
    //Blob → Base64 (text that AI can read)
    //get the canvas a blob (images data)
    const blob = await exportToBlob({
      elements: sceneElements,                            
      appState, // required for background, zoom, etc.
      files,
      mimeType: "image/png",
    });
    console.log("Blob created:", blob);

    const url = URL.createObjectURL(blob); //reates a temporary URL for the file (e.g., image, PDF). 
    console.log("temporary url: ", url)
    const link = document.createElement("a");
    link.href = url;
    link.download = "whiteboard.png";
    link.click();
    
  }

  //clear the canvas
  const handleClear = () => {
    excalidrawAPI.resetScene();
  }

  console.log("returned", parseDrawing(elements));
  return (
    <div>
      <div style={{ height: "500px", width: "100%" }}>
        {/* React prop that Excalidraw exposes so YOU can listen to canvas changes. */}
        <Excalidraw 
          
          onChange={handleChange} 
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
        /> 
      </div>

      <button onClick={handleSave}>Save as PNG</button>
      <button onClick={handleClear}>Clear Canvas</button>
    </div>
    
  );
};  