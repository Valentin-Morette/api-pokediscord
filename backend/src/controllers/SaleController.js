const models = require("../models");

class SaleController {
  static createSale = (req, res) => {
    const data = req.body;
    models.sale
      .create(data)
      .then(([rows]) => {
        if (rows.affectedRows === 0) {
          res
            .status(400)
            .send({ status: "error", message: "Sale creation failed" });
        } else {
          res.status(201).send({ status: "success", saleId: rows.insertId });
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };
}

module.exports = SaleController;
