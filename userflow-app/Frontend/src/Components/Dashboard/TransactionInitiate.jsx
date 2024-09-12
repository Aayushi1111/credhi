import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import AWS from 'aws-sdk';

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
 
  const fetchTransactionStatus = async (transactionId) => {
    try {
      const response = await axios.get(`http://localhost:3001/get-transaction-status/${transactionId}`);
      const { status } = response.data;
      return status; // Return the correct status fetched from the backend
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      return 'pending'; // Default to pending only on error
    }
  };
  
  const fetchPreviousTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/previous-transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const transactions = response.data;
  
      // Fetch and update the status for each transaction
      const updatedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const status = await fetchTransactionStatus(transaction.id); // Fetch status for each transaction
          return { ...transaction, status }; // Update transaction with the fetched status
        })
      );
  
      setPreviousTransactions(updatedTransactions); // Set updated transactions with correct status
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
    const username = decodedToken.username;

    try {
        // First, create the transaction to get the transaction_id
        const formData = new FormData();
        formData.append('transactionName', transactionName);
        formData.append('accountHolderName', accountHolderName);
        formData.append('employmentType', employmentType);
        formData.append('employerName', employerName);
        formData.append('accountHolderAge', accountHolderAge);
        formData.append('profession', profession);
        formData.append('username', username);

        const transactionResponse = await axios.post('http://localhost:3001/submit-transaction', formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });

        const transactionId = transactionResponse.data.transaction_id; // Get the transaction_id from the response

        // Upload documents to S3 under the transaction_id folder
        const uploadPromises = documents.map((file) => {
            const params = {
                Bucket: 'myawsbucketforcredhi',
                Key: `${transactionId}/${file.name}`, // Store files under the transaction_id folder
                Body: file,
                ContentType: file.type,
                ACL: 'private' // Set ACL as per your requirement
            };

            return s3.upload(params).promise();
        });

        const uploadResponses = await Promise.all(uploadPromises);
        const s3Paths = uploadResponses.map(res => res.Location); // Assuming Location has the S3 URL
        const bankStatementS3Location = s3Paths[0]; 

        // Step 2: Initiate Transaction with Metadata (HTTP request to Lambda)
        const lambdaResponse = await axios.post(
            'http://localhost:3001/api/initiate-transaction',
            {
                bankStatementS3Location, // S3 path to bank statement
                S3Bucket: 'myawsbucketforcredhi', // Your bucket name
                bankName: 'hdfc', // Example bank name
                bankStatementPassword: '' // If applicable
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );

        // Step 3: Handle Callback to Update Database
        let status = 'pebding'; // Default status if something goes wrong

        if (lambdaResponse.data.status === 'success') {
            status = 'success';
        } else if (lambdaResponse.data.status === 'pending') {
            status = 'pending';
        }

        // Now, update the database with the status
        const updateData = {
            transactionId: transactionId,
            status: status, // This ensures the status is not blank
            s3Paths: s3Paths
        };

        const updateResponse = await axios.put('http://localhost:3001/update-transaction', updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (updateResponse.data.success) {
            setSuccessMessage('Transaction submitted and updated successfully');
        } else {
            setErrorMessage('Failed to update the transaction. Please try again.');
        }

        // Reset form fields
        setTransactionName('');
        setAccountHolderName('');
        setEmploymentType('');
        setEmployerName('');
        setAccountHolderAge('');
        setProfession('');
        setDocuments([]);
        fetchPreviousTransactions();
    } catch (error) {
        console.error('Error submitting transaction:', error);
        setErrorMessage('Failed to submit the transaction. Please try again.');
    }
};


  const handleDownload = async (transactionId) => {
    try {
      const params = {
        Bucket: 'myawsbucketforcredhi',
        Key: `${transactionId}/bank-statement.pdf` // Adjust the file path as necessary
      };

      const url = s3.getSignedUrl('getObject', params);
      window.location.href = url;
    } catch (error) {
      console.error('Error downloading file:', error);
      setErrorMessage('Failed to download the file. Please try again.');
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
                <th>Transaction ID</th>
                <th>Account Holder Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
  {previousTransactions.map((transaction) => (
    <tr key={transaction.id}>
      <td>{transaction.id}</td>
      <td>{transaction.account_holder_name}</td>
      <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
      <td>{new Date(transaction.created_at).toLocaleTimeString()}</td>
      <td>{transaction.status}</td>
      <td>
        {transaction.status === 'success' ? (
          <button onClick={() => handleDownload(transaction.id)}>
            Download
          </button>
        ) : (
          'N/A'
        )}
      </td>
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
 