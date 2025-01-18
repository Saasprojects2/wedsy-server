const User = require("../models/User");
const Order = require("../models/Order");
const Vendor = require("../models/Vendor");

const GetStatistics = async (req, res) => {
  const { user_id, user, isAdmin, isVendor } = req.auth;
  const { key } = req.query;
  if (isAdmin) {
    if (key === "total-vendors") {
      const totalVendors = await Vendor.countDocuments();
      res.send({ message: "success", stats: totalVendors });
    } else if (key === "total-users") {
      const totalVendors = await User.countDocuments();
      res.send({ message: "success", stats: totalVendors });
    } else if (key === "today-order-wedsy-packages") {
      let stats = 0;
      const today = new Date().toISOString().split("T")[0];
      const finalizedOrders = await Order.find({
        source: "Wedsy-Package",
        "status.finalized": true,
      }).populate("wedsyPackageBooking");
      const finalizedForToday = finalizedOrders.filter(
        (order) =>
          order.wedsyPackageBooking &&
          new Date(order.wedsyPackageBooking.date)
            .toISOString()
            .split("T")[0] === today
      );
      stats = finalizedForToday.length;
      res.send({ message: "success", stats });
    } else if (key === "today-order-personal-packages") {
      let stats = 0;
      const today = new Date().toISOString().split("T")[0];
      const finalizedOrders = await Order.find({
        source: "Personal-Package",
        "status.finalized": true,
      }).populate("vendorPersonalPackageBooking");
      const finalizedForToday = finalizedOrders.filter(
        (order) =>
          order.vendorPersonalPackageBooking &&
          new Date(order.vendorPersonalPackageBooking.date)
            .toISOString()
            .split("T")[0] === today
      );
      stats = finalizedForToday.length;
      res.send({ message: "success", stats });
    } else if (key === "today-order-bidding") {
      let stats = 0;
      const today = new Date().toISOString().split("T")[0];
      const finalizedOrders = await Order.find({
        source: "Bidding",
        "status.finalized": true,
      }).populate("biddingBooking");
      const finalizedForToday = finalizedOrders.filter(
        (order) =>
          order.biddingBooking &&
          order.biddingBooking?.events?.some(
            (event) =>
              new Date(event.date).toISOString().split("T")[0] === today
          )
      );
      stats = finalizedForToday.length;
      res.send({ message: "success", stats });
    } else {
      res.send({ message: "failure" });
    }
  } else if (isVendor) {
    res.send({ message: "failure" });
  } else {
    res.send({ message: "failure" });
  }
};

module.exports = { GetStatistics };
