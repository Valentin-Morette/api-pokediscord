const AbstractManager = require("./AbstractManager");

class SaleManager extends AbstractManager {
  static table = "sale";

  findById(id) {
    return this.connection.query(
      `SELECT * FROM ${SaleManager.table} WHERE id = ?`,
      [id]
    );
  }

  create(sale) {
    return this.connection.query(
      `INSERT INTO ${SaleManager.table} (stripe_session_id	,stripe_payment_intent, discord_id, email, product_id, amount_total, quantity, currency, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sale.stripe_session_id,
        sale.stripe_payment_intent,
        sale.discord_id,
        sale.email,
        sale.product_id,
        sale.amount_total,
        sale.quantity,
        sale.currency,
        sale.payment_status,
      ]
    );
  }
}

module.exports = SaleManager;
