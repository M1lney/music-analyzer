import * as React from "react";

type AnalysisResultProps = {
    result: any;
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
    // Check if the necessary data exists
    if (!result || !result.data || !result.data.analysis) {
        return null;
    }

    const { bpm_analysis, key_analysis } = result.data.analysis;

    return (
        <div>
            <h3>Analysis Result</h3>
            <div>
                <h4>BPM Analysis</h4>
                <p><strong>BPM:</strong> {bpm_analysis?.bpm || 'N/A'}</p>
                <p><strong>Confidence:</strong> {bpm_analysis?.beats_confidence || 'N/A'}</p>
            </div>
            <div>
                <h4>Key Analysis</h4>
                <p><strong>Key:</strong> {key_analysis?.key || 'N/A'}</p>
                <p><strong>Scale:</strong> {key_analysis?.scale || 'N/A'}</p>
                <p><strong>Strength:</strong> {key_analysis?.strength || 'N/A'}</p>
            </div>
        </div>
    );
};

export default AnalysisResult;
