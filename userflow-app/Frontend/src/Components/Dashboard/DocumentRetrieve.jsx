import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
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
      console.log('Response from backend:', response.data); // Debugging line
      if (Array.isArray(response.data)) {
        setPreviousTransactions(response.data);
      } else {
        console.error('API did not return an array:', response.data);
        setErrorMessage('Failed to fetch previous transactions. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching previous transactions:', error);
      setErrorMessage('Failed to fetch previous transactions. Please try again.');
    }
  };

  const handleDownloadPDF = (transaction) => {
    const doc = new jsPDF();
    doc.text(`Transaction ID: ${transaction?.id || 'N/A'}`, 10, 10);
    doc.text(`Transaction Name: ${transaction?.transaction_name || 'N/A'}`, 10, 20);
    doc.text(`Date: ${transaction?.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}`, 10, 30);
    doc.text(`Account Holder Name: ${transaction?.account_holder_name || 'N/A'}`, 10, 40);

    let y = 50;
    if (transaction?.documents && transaction.documents.length > 0) {
      transaction.documents.forEach((document, index) => {
        doc.text(`Document ${index + 1}: ${document.file_name}`, 10, y); // Changed here
        y += 10;
      });
    } else {
      doc.text('No documents available.', 10, y);
    }

    doc.save(`${transaction?.transaction_name || 'transaction'}.pdf`);
  };

  return (
    <div className="document-retrieve-container">
      <h1>Retrieve Documents</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <div className="previous-transactions-retrieve">
        {Array.isArray(previousTransactions) && previousTransactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Transaction Name</th>
                <th>Date</th>
                <th>Account Holder Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {previousTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction?.id || 'N/A'}</td>
                  <td>{transaction?.transaction_name || 'Transaction'}</td>
                  <td>{transaction?.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'Unknown Date'}</td>
                  <td>{transaction?.account_holder_name || 'Unknown Name'}</td>
                  <td>
                    <button onClick={() => handleDownloadPDF(transaction)}>
                      {transaction?.documents && transaction.documents.length > 0
                        ? transaction.documents[0].file_name // Changed here
                        : 'Download'}
                    </button>
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

export default DocumentRetrieve;
