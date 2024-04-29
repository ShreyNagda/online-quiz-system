import React, { useState } from "react";
// import "./FilePicker.css"; // Import CSS for styling

const FilePicker = ({ onFileSelect }) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFileInputChange = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const allowedTypes = ["application/json", "text/csv"];
    const selectedFiles = Array.from(files).filter((file) =>
      allowedTypes.includes(file.type)
    );

    // Call the onFileSelect callback with selected files
    if (selectedFiles.length > 0) {
      onFileSelect(selectedFiles[0]);
      setFile(selectedFiles[0]);
    }
  };

  return (
    <div
      className={
        "w-4/5 h-44 border-white border-dashed flex justify-center items-center border-2 flex"
      }
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv,.json"
        className="hidden"
        onChange={handleFileInputChange}
      />
      {file === null ? (
        <p>Drag and drop files here or click to browse (.csv, .json)</p>
      ) : (
        <p className="text-xl">{file.name}</p>
      )}
    </div>
  );
};

export default FilePicker;
