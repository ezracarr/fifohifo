const { TaxLot, aggregateBuys, processSale } = require("./taxLot");

describe("Tax Lot Logic", () => {
  describe("aggregateBuys", () => {
    it("should aggregate buys on the same date", () => {
      const lots = [new TaxLot(1, "2021-01-01", 10000.0, 1.0)];
      aggregateBuys(lots, "2021-01-01", 15000.0, 1.0);
      expect(lots.length).toBe(1);
      expect(lots[0].price).toBeCloseTo(12500.0);
      expect(lots[0].quantity).toBeCloseTo(2.0);
      expect(lots[0].id).toBe(1);
    });

    it("should add new lots on different dates", () => {
      const lots = [new TaxLot(1, "2021-01-01", 10000.0, 1.0)];
      aggregateBuys(lots, "2021-01-02", 15000.0, 1.0);
      expect(lots.length).toBe(2);
      expect(lots[1].date).toBe("2021-01-02");
      expect(lots[0].id).toBe(1);
      expect(lots[1].id).toBe(2);
    });
  });

  describe("processSale", () => {
    it("should sell using FIFO algorithm", () => {
      const lots = [
        new TaxLot(1, "2021-01-01", 10000.0, 1.0),
        new TaxLot(2, "2021-01-02", 20000.0, 1.0),
      ];
      processSale(lots, "fifo", 1.5);
      expect(lots[0].id).toBe(2);
      expect(lots.length).toBe(1);
      expect(lots[0].quantity).toBeCloseTo(0.5);
    });

    it("should sell using HIFO algorithm", () => {
      const lots = [
        new TaxLot(1, "2021-01-01", 10000.0, 1.0),
        new TaxLot(2, "2021-01-02", 20000.0, 1.0),
      ];
      processSale(lots, "hifo", 1.5);
      expect(lots[0].id).toBe(1);
      expect(lots[0].quantity).toBeCloseTo(0.5);
    });
  });

  describe("edge cases", () => {
    it("should not sell more than available", () => {
      const lots = [new TaxLot(1, "2021-01-01", 10000.0, 1.0)];
      const result = processSale(lots, "fifo", 2.0);
      expect(result).toBe("Error: Insufficient lots for sale");
      expect(lots[0].quantity).toBeCloseTo(1.0);
    });

    it("should handle invalid date formats", () => {
      const lots = [];
      const result = aggregateBuys(lots, "invalid-date", 10000.0, 1.0);
      expect(result).toBe("Error: Invalid date format");
    });

    it("should handle invalid actions", () => {
      const lots = [];
      const result = aggregateBuys(lots, "2021-01-01", 10000.0, 1.0); // Proper buy
      const saleResult = processSale(lots, "invalid-action", 0.5);
      expect(saleResult).toBe("Error: Invalid action type");
    });

    it("should handle selling exact available quantity", () => {
      const lots = [new TaxLot(1, "2021-01-01", 10000.0, 1.0)];
      processSale(lots, "fifo", 1.0);
      expect(lots.length).toBe(0);
    });

    it("should handle selling when no lots available", () => {
      const lots = [];
      const result = processSale(lots, "fifo", 1.0);
      expect(result).toBe("Error: No lots available for sale");
    });
  });
  describe("Floating-Point Precision", () => {
    describe("aggregateBuys precision", () => {
      it("should correctly aggregate lots without precision loss", () => {
        const lots = [];
        const price = 10000.01;
        const quantity = 0.00000001;

        // Buy 100 times
        for (let i = 0; i < 100; i++) {
          aggregateBuys(lots, "2021-01-01", price, quantity);
        }

        expect(lots.length).toBe(1);
        expect(lots[0].price).toBeCloseTo(price, 8);
        expect(lots[0].quantity).toBeCloseTo(quantity * 100, 8);
      });
    });

    describe("processSale precision", () => {
      it("should correctly process sales without precision loss", () => {
        const lots = [new TaxLot(1, "2021-01-01", 10000.12345678, 1.00000001)];

        processSale(lots, "fifo", 0.50000001);

        expect(lots.length).toBe(1);
        expect(lots[0].quantity).toBeCloseTo(0.5, 8);
      });

      it("should handle sales with very small quantities correctly", () => {
        const lots = [new TaxLot(1, "2021-01-01", 10000.12345678, 1.00000001)];

        processSale(lots, "fifo", 0.00000001);

        expect(lots.length).toBe(1);
        expect(lots[0].quantity).toBeCloseTo(1.0, 8);
      });
    });
  });
});
