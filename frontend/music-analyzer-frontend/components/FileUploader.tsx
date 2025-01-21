import * as React from "react";
import {useState} from "react";
import axios from "axios";


type FileUploaderProps = {
    onUploadComplete: (result: any) => void;
};

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);

    //trigger when file input changes. Update the state with the first file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please upload a file");
            return;
        }

        //create formaData object to send file to the server
        const formData = new FormData();
        formData.append("audioFile", file);//add file to formData object

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploadComplete(response);
        } catch (error) {
            console.error('Error uploading file:' ,error);
            alert('file upload failed');
        }
    };


    return (
        <div>
            <input type={"file"} onChange={handleFileChange}/>
            <button onClick={handleUpload}>Upload</button>
        </div>
    )
};
export default FileUploader;
