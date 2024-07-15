import React, { useEffect, useState } from "react";
import "../../styles/customer-rewards.css";

const CustomerRewards = () => {
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [customerRewardsDetails, setCustomerRewardsDetails] = useState();

  useEffect(() => {
    fetch("/transaction-details.json")
      .then((response) => response.json())
      .then((response) => {
        setTransactionDetails(response);
        calculatePoints(response);
      })
      .catch((error) => console.log(error));
  }, []);

  const calculatePoints = (transactions) => {
    const monthlyPoints = {};
    const totalPoints = {};
    const amount = {};
    const name = {};

    transactions.forEach((transaction) => {
      const { customerId, transactionAmount, transactionDate, customerName } =
        transaction;
      const month = new Date(transactionDate).toLocaleString("en-US", {
        month: "long",
      });
      const points = calculatePointsForTransaction(transactionAmount);

      if (!monthlyPoints[customerId]) {
        monthlyPoints[customerId] = {};
      }

      if (!monthlyPoints[customerId][month]) {
        monthlyPoints[customerId][month] = 0;
      }

      monthlyPoints[customerId][month] += points.points;

      if (!totalPoints[customerId]) {
        totalPoints[customerId] = 0;
      }

      totalPoints[customerId] += points.points;

      if (!amount[customerId]) {
        amount[customerId] = {};
      }
      if (!amount[customerId][month]) {
        amount[customerId][month] = 0;
      }

      amount[customerId][month] += points.amount;
      name[customerId] = customerName;
    });

    const results = [];

    for (const customerId in monthlyPoints) {
      for (const month in monthlyPoints[customerId]) {
        results.push({
          customerId,
          customerName: name[customerId],
          month,
          monthlyPoints: monthlyPoints[customerId][month],
          totalPoints: totalPoints[customerId],
          amount: amount[customerId][month],
        });
      }
    }
    setCustomerRewardsDetails(
      Object.groupBy(results, ({ customerId }) => customerId)
    );
  };

  const calculatePointsForTransaction = (amount) => {
    let points = 0;
    if (amount > 100) {
      points = 2 * (amount - 100) + 1 * 50;
    } else if (amount > 50) {
      points = 1 * (amount - 50);
    }
    return { points, amount };
  };

  return (
    <>
      <h1>Customer Rewards</h1>
      <div className="customer-reward-table">
        {customerRewardsDetails &&
          Object.keys(customerRewardsDetails).map((row) => (
            <table key={row} border="1">
              <caption>{customerRewardsDetails[row][0].customerName}</caption>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount($)</th>
                  <th>Point(s)</th>
                </tr>
              </thead>
              <tbody>
                {customerRewardsDetails[row].map((values) => (
                  <tr>
                    <td>{values.month}</td>
                    <td>{values.amount}</td>
                    <td>{values.monthlyPoints}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>
                    Total Reward Points: $
                    {customerRewardsDetails[row][0].totalPoints}
                  </td>
                </tr>
              </tfoot>
            </table>
          ))}
      </div>
    </>
  );
};

export default CustomerRewards;
