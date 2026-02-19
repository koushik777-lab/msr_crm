const express = require("express");
const router = express.Router();
const Renewal = require("../models/Renewal");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const moment = require("moment");

router.get("/renewal", AdminAuthMiddleware, async (req, res) => {
  try {
    const page = req.query?.page;
    const limit = req?.query?.limit;
    const sortBy = req?.query?.filterType;
    const currentDate = moment().startOf("day").toDate();
    console.log(req?.query);
    // Create date filter based on month and year
    let dateFilter = {};
    if (req?.query?.month && req?.query?.year) {
      // If both month and year are present, create a combined filter
      dateFilter = {
        $expr: {
          $and: [
            { $eq: [{ $month: "$ISSUE DATE" }, parseInt(req.query.month)] },
            { $eq: [{ $year: "$ISSUE DATE" }, parseInt(req.query.year)] },
          ],
        },
      };
    } else {
      // If only one is present, apply individual filters
      if (req?.query?.month) {
        dateFilter = {
          $expr: {
            $eq: [{ $month: "$ISSUE DATE" }, parseInt(req.query.month)],
          },
        };
      }
      if (req?.query?.year) {
        dateFilter = {
          $expr: {
            $eq: [{ $year: "$ISSUE DATE" }, parseInt(req.query.year)],
          },
        };
      }
    }

    let TotalCount = await Renewal.countDocuments({
      ...(req?.isAgent && { agent: req.user._id }),
      ...(sortBy === "issue_date" && { "ISSUE DATE": { $gte: currentDate } }),
      ...(sortBy === "first_survey" && { "1ST SURV": { $gte: currentDate } }),
      ...(sortBy === "second_survey" && { "2ND SURV": { $gte: currentDate } }),
      ...(sortBy === "expiry_date" && { "EXPIRY DATE": { $gte: currentDate } }),
      ...(req?.query?.status && { status: req?.query?.status }),
      ...(Object.keys(dateFilter).length > 0 && dateFilter),
      ...(req?.query?.search && {
        $or: [
          { "CONTACT NO_": { $regex: req.query.search, $options: "i" } },
          { "COMPANY NAME": { $regex: req.query.search, $options: "i" } },
        ],
      }),
    });

    let renewals = await Renewal.find({
      ...(req?.isAgent && { agent: req.user._id }),
      ...(sortBy === "issue_date" && { "ISSUE DATE": { $gte: currentDate } }),
      ...(sortBy === "first_survey" && { "1ST SURV": { $gte: currentDate } }),
      ...(sortBy === "second_survey" && { "2ND SURV": { $gte: currentDate } }),
      ...(sortBy === "expiry_date" && { "EXPIRY DATE": { $gte: currentDate } }),
      ...(req?.query?.status && { status: req?.query?.status }),
      ...(Object.keys(dateFilter).length > 0 && dateFilter),
      ...(req?.query?.search && {
        $or: [
          { "CONTACT NO_": { $regex: req.query.search, $options: "i" } },
          { "COMPANY NAME": { $regex: req.query.search, $options: "i" } },
        ],
      }),
    })
      .sort({
        ...(sortBy == "issue_date" && { "ISSUE DATE": 1 }),
        ...(sortBy == "first_survey" && { "1ST SURV": 1 }),
        ...(sortBy == "second_survey" && { "2ND SURV": 1 }),
        ...(sortBy == "expiry_date" && { "EXPIRY DATE": 1 }),

        ...(!sortBy && { createdAt: -1 }),
      })
      .lean()
      .limit(limit)
      .skip((page - 1) * limit);
    renewals = renewals.map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([key, value]) => [
          key.replace(/\./g, "_"), // Replace dots in keys
          value,
        ]),
      ),
    );
    res
      .status(200)
      .json({ message: "Successfully fetched", renewals, TotalCount });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      ?.json({ message: "Server Error", error: error.message });
  }
});

router.post("/renewal", AdminAuthMiddleware, async (req, res) => {
  try {
    // let renewal = req.body.renewal;
    let renewal =
      req.body?.renewal?.length > 0 &&
      req.body?.renewal.map((item) =>
        Object.fromEntries(
          Object.entries(item).map(([key, value]) => [
            key.replace(/\./g, "_"), // Replace dots in keys
            value,
          ]),
        ),
      );
    //     console.log(renewal.map((item, idx) => console.log({
    //   date: item["ISSUE DATE"],
    //   typeOf : typeof item["ISSUE DATE"],
    //   idx: idx,
    // })));

    console.log("-----------------");
    renewal = renewal.map((item, idx) => ({
      ...item,
      "ISSUE DATE": item["ISSUE DATE"]
        ? moment(item["ISSUE DATE"]?.split(".")?.reverse()?.join("-")).toDate()
        : "",
      "1ST SURV": item["1ST SURV"]
        ? moment(item["1ST SURV"]?.split(".")?.reverse()?.join("-")).toDate()
        : "",
      "2ND SURV": item["2ND SURV"]
        ? moment(item["2ND SURV"]?.split?.(".")?.reverse()?.join("-")).toDate()
        : "",
      "EXPIRY DATE": item["EXPIRY DATE"]
        ? moment(
            item["EXPIRY DATE"]?.split?.(".")?.reverse()?.join("-"),
          ).toDate()
        : "",
    }));

    // console.log(renewal.map((item, idx) => console.log({
    //   date: item["ISSUE DATE"],
    //   typeOf : typeof item["ISSUE DATE"],
    //   idx: idx
    // })));
    renewal = renewal.filter(
      (v) => !(!v["COMPANY NAME"] || v["COMPANY NAME"] == ""),
    );
    console.log("RENEWAL LENGTH : ", renewal?.length);
    const updatedRenewals = await Promise.allSettled(
      renewal.map((v) => Renewal.insertOne(v)),
    );
    // console.log(updatedRenewals?.length, updatedRenewals.map((v,idx)=> ({...v, idx})).filter(v=> v.status=="rejected").map(v=> v) );
    // const updatedRenewals = await Renewal.insertMany(renewal);
    res.status(200).json({ message: "Successfully fetched", updatedRenewals });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      ?.json({ message: "Server Error", error: error.message });
  }
});
router.delete("/renewal/:id", AdminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRenewal = await Renewal.findByIdAndDelete(id);
    if (!deletedRenewal) {
      return res.status(404).json({ message: "Renewal not found" });
    }
    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      ?.json({ message: "Server Error", error: error.message });
  }
});

router.put("/renewal/:id", AdminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let renewal =
      req.body?.renewal?.length > 0 &&
      req.body?.renewal.map((item) =>
        Object.fromEntries(
          Object.entries(item).map(([key, value]) => [
            key.replace(/\./g, "_"), // Replace dots in keys
            value,
          ]),
        ),
      );

    const updatedRenewal = await Renewal.findByIdAndUpdate(id, req?.body, {
      new: true,
    });
    if (!updatedRenewal) {
      return res.status(404).json({ message: "Renewal not found" });
    }
    res
      .status(200)
      .json({ message: "Successfully updated", data: updatedRenewal });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      ?.json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
