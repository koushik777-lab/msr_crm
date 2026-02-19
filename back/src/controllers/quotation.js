const Quotation = require("../models/Quotation");
const SMQQuotationModel = require("../models/smbQuotation");
const QCCIQuotationModel = require("../models/qcciQuotation");
const QuotationNumberModel = require("../models/QuotationNumber");

const getquotationNumber = async (req, res) => {
  try {
    const TodayDate = new Date().toISOString().split("T")[0];
    let QuotationNumber = await QuotationNumberModel.findOne({
      date: TodayDate,
    }).lean();
    // console.log(QuotationNumber);
    if (QuotationNumber) {
      let num = QuotationNumber.number;

      QuotationNumber = await QuotationNumberModel.findByIdAndUpdate(
        QuotationNumber._id,
        { number: num + 1 },
        { new: true },
      );

      return res.status(200).json({
        message: "Quotation Number fetched successfully",
        QuotationNumber,
      });
    } else {
      const newQuotationNumber = await QuotationNumberModel.create({
        number: 101,
        date: TodayDate,
      });

      // await newQuotationNumber.save();
      return res.status(200).json({
        message: "Quotation Number fetched successfully",
        QuotationNumber: newQuotationNumber,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// const getCountOfQuotations = async (req, res) => {
//   try {
//     const quotations = await Quotation.find({
//       ...(req?.isAgent && { agentName: req?.user?.name }),
//     }).lean();

//     const obj = {};

//     for (let i = 0; i < quotations.length; i++) {
//       if (obj[quotations[i].agentName]) {
//         obj[quotations[i].agentName].push(quotations[i]);
//       } else {
//         obj[quotations[i].agentName] = [quotations[i]];
//       }
//     }
//     return res
//       .status(200)
//       .json({ message: "Quotations fetched successfully", quotations: obj });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

const getCountOfQuotations = async (req, res) => {
  try {
    const matchQuery = req?.isAgent ? { agentName: req?.user?.name } : {};

    const quotations = await Quotation.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$agentName",
          quotations: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          agentName: "$_id",
          quotations: 1,
        },
      },
    ]);

    const obj = quotations.reduce((acc, { agentName, quotations }) => {
      acc[agentName] = quotations;
      return acc;
    }, {});

    return res
      .status(200)
      .json({ message: "Quotations fetched successfully", quotations: obj });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const addQuotation = async (req, res) => {
  try {
    const { type = "msr" } = req.query;
    if (type === "smb") {
      const newSMBQuotation = await SMQQuotationModel.create({
        ...req.body,
        agentName: req.user.name,
      });
      return res
        .status(201)
        .json({ message: "SMB Quotation added successfully", newSMBQuotation });
    } else if (type === "qcci") {
      const newQCCIQuotation = await QCCIQuotationModel.create({
        ...req.body,
        agentName: req.user.name,
      });
      return res.status(201).json({
        message: "QCCI Quotation added successfully",
        newQCCIQuotation,
      });
    }
    const newQuotation = await Quotation.create(req.body);
    return res
      .status(201)
      .json({ message: "Quotation added successfully", newQuotation });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getAllQuotations = async (req, res) => {
  try {
    const { page, limit, type = "msr" } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 50;
    const skip = (pageNumber - 1) * limitNumber;

    if (type === "smb") {
      const query = {
        ...(req.isAgent && { agentName: req.user.name }),
        ...(req.query?.agentName && { agentName: req.query?.agentName }),

        ...((req?.query?.fromDate || req?.query?.toDate) && {
          date: {
            ...(req?.query?.fromDate && {
              $gte: new Date(`${req.query.fromDate}T00:00:00.000Z`),
            }),
            ...(req?.query?.toDate && {
              $lte: new Date(`${req.query.toDate}T23:59:59.999Z`),
            }),
          },
        }),

        ...(req?.query?.searchQuery && {
          $or: [
            { companyName: { $regex: req.query.searchQuery, $options: "i" } },
            { phoneNo: { $regex: req.query.searchQuery, $options: "i" } },
            { email: { $regex: req.query.searchQuery, $options: "i" } },
            {
              contactPersonName: {
                $regex: req.query.searchQuery,
                $options: "i",
              },
            },
          ],
        }),
      };

      const total = await SMQQuotationModel.countDocuments(query);
      const quotations = await SMQQuotationModel.find(query)
        .skip(skip)
        .limit(limitNumber)
        .lean()
        .sort({ date: -1 });
      return res.status(200).json({
        message: "SMB Quotations fetched successfully",
        quotations,
        page: pageNumber,
        limit: limitNumber,
        totalDocuments: total,
        totalPages: Math.ceil(total / limitNumber),
      });
    } else if (type === "qcci") {
      const query = {
        ...(req.isAgent && { agentName: req.user.name }),
        ...(req.query?.agentName && { agentName: req.query?.agentName }),

        ...((req?.query?.fromDate || req?.query?.toDate) && {
          date: {
            ...(req?.query?.fromDate && {
              $gte: new Date(`${req.query.fromDate}T00:00:00.000Z`),
            }),
            ...(req?.query?.toDate && {
              $lte: new Date(`${req.query.toDate}T23:59:59.999Z`),
            }),
          },
        }),

        ...(req?.query?.searchQuery && {
          $or: [
            { companyName: { $regex: req.query.searchQuery, $options: "i" } },
            { phoneNo: { $regex: req.query.searchQuery, $options: "i" } },
            {
              contactPersonName: {
                $regex: req.query.searchQuery,
                $options: "i",
              },
            },
          ],
        }),
      };

      const total = await QCCIQuotationModel.countDocuments(query);
      const quotations = await QCCIQuotationModel.find(query)
        .skip(skip)
        .limit(limitNumber)
        .lean()
        .sort({ date: -1 });
      return res.status(200).json({
        message: "QCCI Quotations fetched successfully",
        quotations,
        page: pageNumber,
        limit: limitNumber,
        totalDocuments: total,
        totalPages: Math.ceil(total / limitNumber),
      });
    }

    // console.time("getAllQuotations");
    const query = {
      ...(req.isAgent && { agentName: req.user.name }),
      ...(req.query?.agentName && { agentName: req.query?.agentName }),

      ...((req?.query?.fromDate || req?.query?.toDate) && {
        date: {
          ...(req?.query?.fromDate && {
            $gte: new Date(`${req.query.fromDate}T00:00:00.000Z`),
          }),
          ...(req?.query?.toDate && {
            $lte: new Date(`${req.query.toDate}T23:59:59.999Z`),
          }),
        },
      }),

      ...(req?.query?.searchQuery && {
        $or: [
          { name: { $regex: req.query.searchQuery, $options: "i" } },
          { number: { $regex: req.query.searchQuery, $options: "i" } },
          { companyName: { $regex: req.query.searchQuery, $options: "i" } },
          { company: { $regex: req.query.searchQuery, $options: "i" } },
        ],
      }),

      isManuallyCreated: req?.query?.onlyManual === "true" ? true : false,
    };

    const total = await Quotation.countDocuments(query);

    const quotations = await Quotation.find(query)
      .skip(skip)
      .limit(limitNumber)
      .lean()
      .sort({ date: -1 });

    // console.log(req?.query, quotations?.length);
    // console.timeEnd("getAllQuotations");

    return res.status(200).json({
      message: "Quotations fetched successfully",
      quotations,
      page: pageNumber,
      limit: limitNumber,
      totalDocuments: total,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedQuotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    return res.status(200).json({
      message: "Quotation updated successfully",
      updatedQuotation,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateQuotationNew = async (req, res) => {
  try {
    const { type = "msr", quotationId } = req.query;
    let updatedQuotation;
    if (type === "smb") {
      updatedQuotation = await SMQQuotationModel.findByIdAndUpdate(
        quotationId,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );
    } else if (type === "qcci") {
      updatedQuotation = await QCCIQuotationModel.findByIdAndUpdate(
        quotationId,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );
    } else if (type === "msr") {
      updateQuotation = await Quotation.findByIdAndUpdate(
        quotationId,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );
    }
    return res.status(200).json({
      message: "Quotation updated successfully",
      updatedQuotation,
    });
  } catch (error) {
    console.error(error?.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const bulkTransferQuotations = async (req, res) => {
  try {
    const { transferFrom, transferTo, isManuallyCreated } = req.body;
    if (!transferFrom || !transferTo) {
      return res
        .status(400)
        .json({ message: "Please provide transferFrom and transferTo" });
    }
    let updated = await Quotation.updateMany(
      { agentName: transferFrom, isManuallyCreated: isManuallyCreated },
      { agentName: transferTo },
    );
    return res
      .status(200)
      .json({ message: "Quotations transferred successfully", data: updated });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const quotationNotification = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Please provide name" });
    }
    const quotations = await Quotation.find(
      {
        agentName: name,
        reminder: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      {
        company: 1,
        companyName: 1,
        orderNumber: 1,
        isManuallyCreated: 1,
        agentName: 1,
      },
    );

    res.json({
      message: "Quotations fetched successfully",
      quotations,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getquotationNumber,
  getCountOfQuotations,
  addQuotation,
  getAllQuotations,
  updateQuotation,
  updateQuotationNew,
  bulkTransferQuotations,
  quotationNotification,
};
