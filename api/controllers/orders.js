const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

exports.getAllOrders = (req, res, next) => {
  Order
    .find()
    .select('_id product quantity')
    .populate('product', '_id name price')
    .exec()
    .then((orders) => {
      res
        .status(200)
        .json({
          ordersAmount: orders.length,
          orders: orders.map((order) => ({
            _id: order._id,
            product: order.product,
            quantity: order.quantity,
            request: {
              type: 'GET',
              url: `http://localhost:3002/orders/${order._id}`,
            },
          })),
        });
    })
    .catch((err) => {
      res
        .status(500)
        .json({
          error: err,
        });
    });
};

exports.getOrder = (req, res, next) => {
  const { orderID } = req.params;

  Order.findById(orderID)
    .select('_id product quantity')
    .populate('product', '_id name price')
    .exec()
    .then((order) => {
      if (order) {
        res
          .status(200)
          .json({
            _id: order._id,
            product: order.product,
            quantity: order.quantity,
            request: {
              type: 'GET',
              url: `http://localhost:3002/orders/${order._id}`,
            },
          });
      } else {
        res
          .status(404)
          .json({
            error: {
              message: 'Order with this ID doesn\'t exist.',
            },
          });
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({
          error: err,
        });
    });
};

exports.createOrder = (req, res, next) => {
  const { productID, quantity } = req.body;
  Product.findById(productID)
    .then((product) => {
      if (!product) {
        return res
          .status(404)
          .json({
            error: {
              message: 'Product with this ID doesn\'t exist.',
            },
          });
      }

      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product: {
          _id: productID,
        },
        quantity,
      });
      // save() gives us Promise
      // by default
      // so we don't need exec()
      return order.save();
    })
    .then((result) => {
      res
        .status(201)
        .json({
          message: 'Order successfully created.',
          _id: result._id,
          quantity: result.quantity,
          product: result.product,
          request: {
            type: 'POST',
            url: `http://localhost:3002/orders/${result._id}`,
          },
        });
    })
    .catch((err) => {
      res
        .status(500)
        .json({
          error: err,
        });
    });
};

exports.deleteOrder = (req, res, next) => {
  const { orderID } = req.params;

  Order.findById(orderID)
    .then((order) => {
      if (order) {
        return Order
          .remove({
            _id: orderID,
          })
          .exec()
          .then((info) => {
            res
              .status(200)
              .json({
                ok: info.ok,
                message: 'Order successfully deleted',
                _id: orderID,
                request: {
                  type: 'DELETE',
                  url: `http://localhost:3002/orders/${orderID}`,
                },
              });
          });
      }
      return res
        .status(404)
        .json({
          error: 'Order with this ID doesn\'t exist.',
        });
    })
    .catch((err) => {
      res
        .status(500)
        .json({
          error: err,
        });
    });
};
