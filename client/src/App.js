import './App.css';
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { saveAs } from 'file-saver';

import demoImg from '../src/img/demo-img.png'
import lodingSVG from '../src/img/loding.svg'

function App() {

  const textAreaRef = useRef(null)
  const inputRef = useRef()

  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null)
  const [res, setRes] = useState({})
  const [textData, setTextData] = useState("")
  const [loding, setLoding] = useState(false)

  useEffect(() => {
    handleUpload()
  }, [file])

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log(selectedFile);
    // setImagePreview(selectedFile)
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
  };

  const handalDragOver = (e) => {
    e.preventDefault()
  }

  const handalDrop = (e) => {
    e.preventDefault()
    const selectedFile = e.dataTransfer.files[0];
    console.log(selectedFile);
    setImagePreview(selectedFile)
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
  }

  const handleUpload = () => {
    setLoding(true)
    setTimeout(async () => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axios.post("https://stagenography-server-flask.onrender.com/upload", formData);
        // const response = await axios.post("http://localhost:5000/upload", formData);
        // Handle the response from the Flask server
        console.log(response.data);
        setRes(response.data)

        if (response.data.class === "green") {
          // textAreaRef.current.value = response.data.textData
          setTimeout(() => {
            if (textAreaRef.current) {
              textAreaRef.current.value = response.data.textData;
            }
          }, 0);
        }

        textAreaRef.current.focus()
      } catch (error) {
        // Handle any errors
        console.error(error);
      } finally {
        setLoding(false);
      }
    }, 50)
  };

  const handalCreate = () => {
    setLoding(true)
    setTimeout(async () => {
      // setLoding(false)
      const formData = new FormData();
      formData.append("file", file)
      formData.append("textData", textData);

      try {
        const response = await axios.post("https://stagenography-server-flask.onrender.com/create", formData)
        // const response = await axios.post("http://localhost:5000/create", formData)
        // console.log(response.data);
        setRes(response.data)

        if (response.data.class === "green") {
          // textAreaRef.current.value = res.textData
          setTimeout(() => {
            if (textAreaRef.current) {
              textAreaRef.current.value = response.data.textData;
            }
          }, 0);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoding(false);
      }
    }, 50)
  }

  const handleDownload = async () => {
    try {
      setLoding(true)
      const response = await axios.get(`https://stagenography-server-flask.onrender.com/${res.downloadLink}`, {
        responseType: 'blob', // Specify 'blob' as the responseType
      });

      if (response.status === 200) {
        // Use the file-saver library to initiate the download
        saveAs(response.data, 'stago-image.png');
      } else {
        console.error('Failed to download the image. Status code: ', response.status);
      }
    } catch (error) {
      console.error('An error occurred: ', error);
    } finally {
      setLoding(false);
    }
  };

  return (
    <div className='App' onDragOver={handalDragOver} onDrop={handalDrop}>
      {
        loding === true
          ? <div className='loding'><img src={lodingSVG} alt="hello herin" /></div>
          : <div>
            <div className="navbar">
              <h1>Hello Steganography</h1>
            </div>

            <div className="drop-box">
              <h3>drop file here</h3>
              <input type="file" accept="image/*" onChange={handleFileChange} hidden ref={inputRef} />
              <button onClick={() => { inputRef.current.click() }}>
                Select file
              </button>
            </div>
            <div className="combo-box">
              <img
                src={imagePreview == null ? demoImg : imagePreview}
                alt="loding..."
              />

              <textarea
                ref={textAreaRef}
                cols="30"
                rows="30"
                onChange={(e) => setTextData(e.target.value)}
                placeholder='Enter your hidden massage...'
              ></textarea>
            </div>

            <div className="btn-box">
              <button onClick={handalCreate} >Create stego image</button>
              <button onClick={handleDownload} >Download image</button>
            </div>
          </div>

      }

    </div>
  );
}

export default App;
