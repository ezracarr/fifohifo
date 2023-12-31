#!/usr/bin/env node

const readline = require("readline");

class TaxLot {
  constructor(id, date, price, quantity) {
    this.id = id;
    this.date = date;
    this.price = price;
    this.quantity = quantity;
  }
}

// Validates if the provided date string is in the correct format (YYYY-MM-DD).

function isValidDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) && !isNaN(Date.parse(date));
}

// This function aggregates the buy transactions, checking and updating existing lots or adding a new lot.
function aggregateBuys(lots, date, price, quantity) {
  if (!isValidDate(date)) {
    console.error("Error: Invalid date format");
    return "Error: Invalid date format";
  }

  if (price < 0 || quantity < 0) {
    console.error("Error: Negative price or quantity provided");
    return "Error: Negative price or quantity provided";
  }

  let matched = false;
  lots.forEach((lot) => {
    if (lot.date === date) {
      matched = true;
      const totalCost = lot.price * lot.quantity + price * quantity;
      lot.quantity += quantity;
      lot.price = totalCost / lot.quantity;
    }
  });

  if (!matched) {
    lots.push(new TaxLot(lots.length + 1, date, price, quantity));
  }
}

// This function processes the sale transaction based on the provided strategy (fifo or hifo).
function processSale(lots, strategy, quantityToSell) {
  if (quantityToSell < 0) {
    console.error("Error: Negative sale quantity provided");
    return "Error: Negative sale quantity provided";
  }

  if (!["fifo", "hifo"].includes(strategy)) {
    console.error("Error: Invalid action type");
    return "Error: Invalid action type";
  }

  if (lots.length === 0) {
    console.error("Error: No lots available for sale");
    return "Error: No lots available for sale";
  }
  let remainingSale = quantityToSell;

  // Create a deep copy of the lots array to work on
  let copiedLots = JSON.parse(JSON.stringify(lots));

  if (strategy === "fifo") {
    copiedLots.forEach((lot) => {
      if (remainingSale === 0) return;

      if (lot.quantity > remainingSale) {
        lot.quantity -= remainingSale;
        remainingSale = 0;
      } else {
        remainingSale -= lot.quantity;
        lot.quantity = 0;
      }
    });
  } else if (strategy === "hifo") {
    // Sort the lots by price in descending order
    copiedLots.sort((a, b) => b.price - a.price);

    copiedLots.forEach((lot) => {
      if (remainingSale === 0) return;

      if (lot.quantity > remainingSale) {
        lot.quantity -= remainingSale;
        remainingSale = 0;
      } else {
        remainingSale -= lot.quantity;
        lot.quantity = 0;
      }
    });
    // Sort back by ID to maintain the original order
    copiedLots.sort((a, b) => a.id - b.id);
  }

  if (remainingSale > 0) {
    console.error("Error: Insufficient lots for sale");
    return "Error: Insufficient lots for sale"; // Error is returned, original lots array remains unchanged
  }

  // Update the original lots array and filter out any lots with 0 quantity.
  lots.length = 0;
  copiedLots.forEach((lot) => {
    if (lot.quantity > 0) {
      lots.push(lot);
    }
  });

  return lots;
}

// Main function that reads from stdin, processes the input based on the provided algorithm and prints the result to stdout.
function main() {
  const algorithm = process.argv[2];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const lots = [];

  rl.on("line", (line) => {
    const [date, action, price, quantity] = line.split(",");
    if (action === "buy") {
      aggregateBuys(lots, date, parseFloat(price), parseFloat(quantity));
    } else if (action === "sell") {
      processSale(lots, algorithm, parseFloat(quantity));
    }
  });

  rl.on("close", () => {
    lots.forEach((lot) => {
      if (lot.quantity > 0) {
        console.log(
          `${lot.id},${lot.date},${lot.price.toFixed(2)},${lot.quantity.toFixed(
            8
          )}`
        );
      }
    });
  });
}

module.exports = {
  TaxLot,
  aggregateBuys,
  processSale,
};

main();
