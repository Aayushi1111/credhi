import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../App.css';

const DocumentRetrieve = () => {
  const [previousTransactions, setPreviousTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPreviousTransactions();
  }, []);

  const fetchPreviousTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/previous-transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviousTransactions(response.data);
    } catch (error) {
      console.error('Error fetching previous transactions:', error);
      setErrorMessage('Failed to fetch previous transactions. Please try again.');
    }
  };

  return (
    <div className="document-retrieve-container">
      <h1>Retrieve Documents</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <div className="previous-transactions-retrieve">
        {previousTransactions.map((transaction, index) => (
          <div key={index} className="transaction-item">
            <h3>{transaction.transactionName}</h3>
            <p>Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
            <p>Files:</p>
            <ul>
              <li>
                <a
                  href={`http://localhost:3001/${transaction.documentPath}`}
                  download
                >
                  {transaction.documentName}
                </a>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentRetrieve;
