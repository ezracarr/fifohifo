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

function isValidDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) && !isNaN(Date.parse(date));
}

function aggregateBuys(lots, date, price, quantity) {
  if (!isValidDate(date)) {
    console.error("Error: Invalid date format");
    return "Error: Invalid date format";
  }

  if (price < 0 || quantity < 0) {
    console.error("Error: Negative price or quantity provided");
    return "Error: Negative price or quantity provided";
  }

  for (let lot of lots) {
    if (lot.date === date) {
      const totalCost = lot.price * lot.quantity + price * quantity;
      lot.quantity += quantity;
      lot.price = totalCost / lot.quantity;
      return;
    }
  }
  lots.push(new TaxLot(lots.length + 1, date, price, quantity));
}

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
    for (const lot of copiedLots) {
      if (remainingSale === 0) break;

      if (lot.quantity > remainingSale) {
        lot.quantity -= remainingSale;
        remainingSale = 0;
      } else {
        remainingSale -= lot.quantity;
        lot.quantity = 0;
      }
    }
  } else if (strategy === "hifo") {
    copiedLots.sort((a, b) => b.price - a.price);

    for (const lot of copiedLots) {
      if (remainingSale === 0) break;

      if (lot.quantity > remainingSale) {
        lot.quantity -= remainingSale;
        remainingSale = 0;
      } else {
        remainingSale -= lot.quantity;
        lot.quantity = 0;
      }
    }

    copiedLots.sort((a, b) => a.id - b.id);
  }

  if (remainingSale > 0) {
    console.error("Error: Insufficient lots for sale");
    return "Error: Insufficient lots for sale"; // Error is returned, original lots array remains unchanged
  }

  // If everything went well, update the original lots array and filter out 0 quantity lots.
  lots.length = 0; // Clear the original array
  for (let lot of copiedLots) {
    if (lot.quantity > 0) {
      lots.push(lot);
    }
  }

  return lots;
}

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
    for (let lot of lots) {
      if (lot.quantity > 0) {
        console.log(
          `${lot.id},${lot.date},${lot.price.toFixed(2)},${lot.quantity.toFixed(
            8
          )}`
        );
      }
    }
  });
}

module.exports = {
  TaxLot,
  aggregateBuys,
  processSale,
};

main();
