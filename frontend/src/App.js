import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaMapMarkerAlt, FaGlobe, FaSpinner, FaUpload } from 'react-icons/fa';
import './App.css';


const BACKEND_URL='http://127.0.0.1:5000'


function InputField({ htmlForInput, type, icon, label, value, handleChange }) {
  if (value == null) {
    return (
      <div className="form-group">
        <label htmlFor={htmlForInput} className="label">
          {icon} {label}:
        </label>
        <input id={htmlForInput} type={type} className="input" onChange={handleChange} />
      </div>
    );
  }

  return (
    <div className="form-group">
      <label htmlFor={htmlForInput} className="label">
        {icon} {label}:
      </label>
      <input id={htmlForInput} type={type} className="input" value={value} onChange={handleChange} />
    </div>
  );
}

function PageNumbers({ currentPage, totalPages, onPageClick }) {
  const [currentPageSet, setCurrentPageSet] = useState(1);

  const firstPageInSet = (currentPageSet - 1) * 10 + 1;
  const lastPageInSet = Math.min(currentPageSet * 10, totalPages);

  const pageNumbers = [];
  for (let i = firstPageInSet; i <= lastPageInSet; i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      {pageNumbers.map((pageNumber) => (
        <button key={pageNumber} onClick={() => onPageClick(pageNumber)} disabled={pageNumber === currentPage}>
          {pageNumber}
        </button>
      ))}
      <button onClick={() => setCurrentPageSet(currentPageSet + 1)} disabled={lastPageInSet >= totalPages}>
        Next
      </button>
    </div>
  );
}


function App() {
  const [file, setFile] = useState(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [responseVal, setResponse] = useState('');
  const [responseValPageNumber, setResponseValPageNumber] = useState(1);
  const [responseValCurrentPageNumber, setResponseValCurrentPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingIndex, setTypingIndex] = useState(-1);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await backendAPICall();
  };

  const backendAPICall = async () => {
    const formData = new FormData();
    if (file != null) {
      formData.append('pdf', file);
      formData.append('city', city);
      formData.append('country', country);
      formData.append('current_page', responseValCurrentPageNumber);
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/convert`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      console.log(data);


      setLoading(false);
      setError(null);
      setResponse(data['output']);
      setResponseValPageNumber(data['total_page']);
      setTypingIndex(0);

    } catch (error) {
      setLoading(false);
      setTypingIndex(-1);
      setResponse('');
      setError(error.message);
    }
  }

  const pageClick = async (pageNumber) => {
    console.log(pageNumber)
    setResponseValCurrentPageNumber(pageNumber);
    await backendAPICall();
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingIndex((prevIndex) => prevIndex + 1);
    }, 50);
    return () => clearInterval(interval);
  }, [responseVal]);

  return (
    <div className="App">
      <div className="left-container">

        <h1 className="title">Understand your PDF</h1>

        <form onSubmit={handleSubmit}>
          <InputField htmlForInput="file-input" type="file" icon={<FaFilePdf />} label="Choose a file" value={null} handleChange={handleFileUpload} />
          <InputField htmlForInput="city-input" type="text"  label="What to extract?" value={city} handleChange={handleCityChange} />
          <button type="submit" className="btn btn-primary">
            {loading ? <FaSpinner className="fa-spin" /> : <FaUpload />} Submit
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
      <div className="right-container">

        <div className='right-container-header'>
          <h1>Extracted Response</h1>
          <PageNumbers currentPage={responseValCurrentPageNumber} totalPages={responseValPageNumber} onPageClick={pageClick} />
        </div>

        <div className="response-container">
          {loading ? (
            <FaSpinner className="fa-spin" />
          ) : (
            <>
              <pre className="response">{responseVal.substring(0, typingIndex)}</pre>
              <span className="cursor" style={{ left: `${responseVal.length}px` }}></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;