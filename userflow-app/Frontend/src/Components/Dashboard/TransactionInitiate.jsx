import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const TransactionInitiate = () => {
  const [transactionName, setTransactionName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [accountHolderAge, setAccountHolderAge] = useState('');
  const [profession, setProfession] = useState('');
  const [documents, setDocuments] = useState([]);
  const [previousTransactions, setPreviousTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPreviousTransactions();
  }, []);

  const fetchPreviousTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/previous-transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response from backend:', response.data);
      setPreviousTransactions(response.data);
    } catch (error) {
      console.error('Error fetching previous transactions:', error);
      setErrorMessage('Failed to fetch previous transactions. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 5 * 1024 * 1024;

    for (let file of files) {
      if (file.size > maxFileSize) {
        setErrorMessage(`File ${file.name} exceeds the 5MB size limit.`);
        return;
      }
    }

    setDocuments(files);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const decodedToken = jwt_decode(token);
    const username = decodedToken.username; // Adjust based on your token structure

    const formData = new FormData();
    formData.append('transactionName', transactionName);
    formData.append('accountHolderName', accountHolderName);
    formData.append('employmentType', employmentType);
    formData.append('employerName', employerName);
    formData.append('accountHolderAge', accountHolderAge);
    formData.append('profession', profession);
    formData.append('username', username); // Add username to the form data

    documents.forEach((file) => formData.append('documents', file));

    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post('http://localhost:3001/submit-transaction', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      console.log('Response from backend:', response.data);

      // Reset form fields
      setTransactionName('');
      setAccountHolderName('');
      setEmploymentType('');
      setEmployerName('');
      setAccountHolderAge('');
      setProfession('');
      setDocuments([]);
      setSuccessMessage('Transaction submitted successfully');
      fetchPreviousTransactions();
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
        setErrorMessage('Failed to submit the transaction. Please try again.');
      } else if (error.request) {
        // Request was made but no response was received
        console.log('No response received:', error.request);
        setErrorMessage('No response from the server. Please try again later.');
      } else {
        // Something happened in setting up the request
        console.log('Error setting up request:', error.message);
        setErrorMessage('Failed to submit the transaction. Please try again.');
      }
    }
  };

  return (
    <div className="transaction-initiate-container">
      <h1>Initiate a New Transaction</h1>
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>Transaction Name: <span className="mandatory">*</span></label>
          <input
            type="text"
            value={transactionName}
            onChange={(e) => setTransactionName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Name of Account Holder:</label>
          <input
            type="text"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Employment Type:</label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            <option value="">Select Employment Type</option>
            <option value="salaried">Salaried</option>
            <option value="student">Student</option>
            <option value="home-maker">Home-maker</option>
            <option value="business owner">Business Owner</option>
            <option value="self employed professional">Self Employed Professional</option>
            <option value="unemployed">Unemployed</option>
          </select>
        </div>
        {employmentType === 'salaried' && (
          <div className="form-group">
            <label>Name of Employer:</label>
            <input
              type="text"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
            />
          </div>
        )}
        {employmentType === 'self employed professional' && (
          <div className="form-group">
            <label>Profession:</label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
          </div>
        )}
        <div className="form-group">
          <label>Age of Account Holder:</label>
          <input
            type="number"
            value={accountHolderAge}
            onChange={(e) => setAccountHolderAge(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Upload Documents:</label>
          <input
            type="file"
            id="documents"
            name="documents"
            multiple
            accept=".xls,.xlsx"
            onChange={handleFileChange}
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
        <button type="submit">Submit Transaction</button>
        {successMessage && <p className="success">{successMessage}</p>}
      </form>

      <div className="previous-transactions">
        <h2>Previous Transactions</h2>
        {previousTransactions.length > 0 ? (
          <ul>
            {previousTransactions.map((transaction) => (
              <li key={transaction.transaction_id}>
                <strong>Transaction Name:</strong> {transaction.transaction_name}
                <br />
                <strong>Account Holder Name:</strong> {transaction.account_holder_name}
                <br />
                <strong>Employment Type:</strong> {transaction.employment_type}
                <br />
                <strong>Employer Name:</strong> {transaction.employer_name}
                <br />
                <strong>Account Holder Age:</strong> {transaction.account_holder_age}
                <br />
                <strong>Profession:</strong> {transaction.profession}
                <br />
              </li>
            ))}
          </ul>
        ) : (
          <p>No previous transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionInitiate;
