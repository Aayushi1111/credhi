import React, { useState } from 'react';
import '../../App.css';

const TransactionInitiate = () => {
  const [transactionName, setTransactionName] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [documents, setDocuments] = useState([]);
  const [previousTransactions, setPreviousTransactions] = useState([
    { name: 'Transaction 1', date: '2023-12-01', files: ['file1.pdf', 'file2.pdf'] },
    { name: 'Transaction 2', date: '2024-01-15', files: ['file3.pdf', 'file4.pdf'] },
  ]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 5 * 1024 * 1024; // 5MB size limit

    for (let file of files) {
      if (file.size > maxFileSize) {
        setErrorMessage(`File ${file.name} exceeds the 5MB size limit.`);
        return;
      }
    }

    setDocuments(files);
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Transaction Submitted:', { transactionName, transactionDate, documents });

    // Clear the form
    setTransactionName('');
    setTransactionDate('');
    setDocuments([]);
  };

  return (
    <div className="transaction-initiate-container">
      <h1>Initiate a New Transaction</h1>
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>Transaction Name:</label>
          <input
            type="text"
            value={transactionName}
            onChange={(e) => setTransactionName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Transaction Date:</label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Upload Documents:</label>
          <input
            type="file"
            id="documents"
            name="documents"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
        <div className="form-note">
          <h6>Allowed formats: .pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg</h6>
          <h6>Max file size: 5MB</h6>
        </div>
        <button type="submit" className="btn btn-primary btn-block">Submit Transaction</button>
      </form>

      <h2>Previous Transactions</h2>
      <div className="previous-transactions">
        {previousTransactions.map((transaction, index) => (
          <div key={index} className="transaction-item">
            <h3>{transaction.name}</h3>
            <p>Date: {transaction.date}</p>
            <p>Files:</p>
            <ul>
              {transaction.files.map((file, fileIndex) => (
                <li key={fileIndex}>{file}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionInitiate;
