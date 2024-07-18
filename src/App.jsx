import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css"

function App() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const customerData = await axios.get("http://localhost:5000/customers");
      setCustomers(customerData.data);

      const transactionData = await axios.get("http://localhost:5000/transactions");
      setTransactions(transactionData.data);
    };

    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(
    (transaction) =>
      (!selectedCustomer || transaction.customer_id === selectedCustomer.id) &&
      (transaction.amount.toString().includes(filter) || customers.find((customer) => customer.id === transaction.customer_id)?.name.includes(filter))
  );

  const totalAmountPerDay = filteredTransactions.reduce((acc, transaction) => {
    acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(totalAmountPerDay),
    datasets: [
      {
        label: "Total Transaction Amount",
        data: Object.values(totalAmountPerDay),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="App">
      <h1>Customer Transactions</h1>
      <input
        type="text"
        placeholder="Filter by customer name or amount"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table border="1">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{customers.find((customer) => customer.id === transaction.customer_id)?.name}</td>
              <td>{transaction.date}</td>
              <td>{transaction.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedCustomer && (
        <div>
          <h2>Transactions for {selectedCustomer.name}</h2>
          <Bar data={chartData} />
        </div>
      )}
      <h2>Select Customer</h2>
      {customers.map((customer) => (
        <button key={customer.id} onClick={() => setSelectedCustomer(customer)}>
          {customer.name}
        </button>
      ))}
    </div>
  );
}

export default App;