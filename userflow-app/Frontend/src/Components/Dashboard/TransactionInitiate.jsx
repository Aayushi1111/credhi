import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import AWS from 'aws-sdk';  // Add this line

// AWS SDK Configuration
AWS.config.update({
  accessKeyId: 'AKIA47CRW7S2HHQ34WGM',
  secretAccessKey: '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',
  region: 'ap-south-1'  // Adjust to the correct region code (Mumbai is ap-south-1)
});

const s3 = new AWS.S3();

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
  
    // Upload documents to S3
    const uploadPromises = documents.map((file) => {
      const params = {
        Bucket: 'myawsbucketforcredhi',
        Key: `${username}/${file.name}`, // Store files under the user's folder
        Body: file,
        ContentType: file.type,
        ACL: 'private' // Set ACL as per your requirement
      };
  
      return s3.upload(params).promise();
    });
  
    try {
      // Wait for all uploads to complete
      const uploadResponses = await Promise.all(uploadPromises);
      console.log('S3 Uploads:', uploadResponses);
  
      // Prepare your formData for backend submission, if needed
      const formData = new FormData();
      formData.append('transactionName', transactionName);
      formData.append('accountHolderName', accountHolderName);
      formData.append('employmentType', employmentType);
      formData.append('employerName', employerName);
      formData.append('accountHolderAge', accountHolderAge);
      formData.append('profession', profession);
      formData.append('username', username); // Add username to the form data
  
      // Log uploaded file locations in your backend, if needed
      uploadResponses.forEach((response, index) => {
        formData.append('s3FileUrls', response.Location);
      });
  
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
      console.error('Error submitting transaction:', error);
      setErrorMessage('Failed to submit the transaction. Please try again.');
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
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction Name</th>
                <th>Account Holder Name</th>
                <th>Employment Type</th>
                <th>Employer Name</th>
                <th>Account Holder Age</th>
                <th>Profession</th>
              </tr>
            </thead>
            <tbody>
              {previousTransactions.map((transaction) => (
                <tr key={transaction.transaction_id}>
                  <td>{transaction.transaction_name}</td>
                  <td>{transaction.account_holder_name}</td>
                  <td>{transaction.employment_type}</td>
                  <td>{transaction.employer_name || 'N/A'}</td>
                  <td>{transaction.account_holder_age}</td>
                  <td>{transaction.profession || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No previous transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionInitiate;
