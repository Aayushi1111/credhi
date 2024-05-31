import React from 'react';
import '../../App.css';

const DocumentRetrieve = () => {
  const previousTransactions = [
    { name: 'Transaction 1', date: '2023-12-01', files: ['file1.pdf', 'file2.pdf'] },
    { name: 'Transaction 2', date: '2024-01-15', files: ['file3.pdf', 'file4.pdf'] },
  ];

  return (
    <div className="document-retrieve-container">
      <h1><center>Retrieve Documents</center></h1>
      <div className="previous-transactions-retrieve">
        {previousTransactions.map((transaction, index) => (
          <div key={index} className="transaction-item">
            <h3>{transaction.name}</h3>
            <p>Date: {transaction.date}</p>
            <p>Files:</p>
            <ul>
              {transaction.files.map((file, fileIndex) => (
                <li key={fileIndex}>
                  <a href={`path/to/your/files/${file}`} download>{file}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentRetrieve;
