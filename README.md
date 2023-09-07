# **Tax Lot Management System**

Manage and track tax lots based on transaction logs using the provided algorithms (`fifo` or `hifo`).

## **Prerequisites**

- Node.js (v14+)

## **Setup**

1. Clone the repository to your local machine:

```bash
git clone "repo-url"
```

2. Make taxLot.js executable

```bash
chmod +x taxLot.js
```

2. Install the necessary npm packages:

```bash
npm install
```

## **To execute**

Run the script with the desired algorithm (fifo or hifo) and provide the transaction log via stdin like so:

```bash
echo -e '2021-01-01,buy,10000.00,1.00000000\n2021-01-02,buy,20000.00,1.00000000\n2021-02-01,sell,20000.00,1.50000000' | ./taxLot.js fifo
```

Input: date,action,price,quantity
Output: id,date,price,quantity

Errors are descriptive and output to stdout with a non-zero exit code.

## **Testing**

To run the tests, use the following command:

```bash
 npm test
```
