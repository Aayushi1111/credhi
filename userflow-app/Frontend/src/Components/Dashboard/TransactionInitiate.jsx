import React, { useState } from 'react';
import '../../App.css'; // Import your CSS file

const TransactionInitiate = () => {
  const [transactionName, setTransactionName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [accountHolderAge, setAccountHolderAge] = useState('');
  const [profession, setProfession] = useState('');
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
    console.log('Transaction Submitted:', { transactionName, accountHolderName, employmentType, employerName, accountHolderAge, profession, documents });

    // Clear the form
    setTransactionName('');
    setAccountHolderName('');
    setEmploymentType('');
    setEmployerName('');
    setAccountHolderAge('');
    setProfession('');
    setDocuments([]);
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
        <div className="form-note">
          <h6>Allowed formats:  .xls, .xlsx</h6>
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
