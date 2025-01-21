import { useState } from 'react'
import './App.css'
import FileUploader from "../components/FileUploader.tsx";
import AnalysisResult from "../components/AnalysisResult.tsx";

function App() {
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);

    return (
        <div>
            <h1>Music Analyzer</h1>
            <FileUploader onUploadComplete={setAnalysisResult}/>
            <AnalysisResult result={analysisResult}/>
        </div>
    )
}

export default App
