const mongoose = require("mongoose");

const LicenseRegistrationFeeSchema = new mongoose.Schema({
  service: {
    type: String,
    default: "",
  },
  feeType: {
    type: String,
    default: "Govt./Others",
  },
  fees: {
    type: String,
    default: "",
  },
  professionalFees: {
    type: String,
    default: "",
  },
  total: {
    type: String,
    default: "",
  },
  showThreeFields: {
    type: Boolean,
    default: false,
  },
  serviceDocs: {
    type: String,
    default: "",
  },
});

const Qschema = new mongoose.Schema(
  {
    agentName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      // required: true,
    },
    orderNumber: {
      type: String,
      // required: true,
    },
    personDetails: {
      name: {
        type: String,
        // required: true,
      },
      phoneNumber: {
        type: String,
        // required: true,
      },
    },
    date: {
      type: Date,
      default: "",
    },
    reminder: {
      type: Date,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    // services: {
    //   type: String,
    //   default: "",
    // },
    natureOfBusiness: {
      type: String,
      default: "",
    },
    namePrefix: {
      type: String,
      default: "Mr",
    },
    employeeNumber: {
      type: String,
      default: "",
    },
    locationNumber: {
      type: String,
      default: "",
    },
    number: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    currencyType: {
      type: String,
      default: "INR",
    },
    licenseRegistrationFees: [LicenseRegistrationFeeSchema],
    feeStructureCompliances: [LicenseRegistrationFeeSchema],
    discount: {
      type: String,
      default: "",
    },
    isGST: {
      type: Boolean,
      default: true,
    },
    accountDetails: {
      withGST: {
        type: String,
        default: "",
      },
      withoutGST: {
        type: String,
        default: "",
      },
    },
    note: {
      type: String,
      default: "",
    },
    documentsRequired: [
      {
        type: String,
        default: "",
      },
    ],
    quotedBy: {
      type: String,
      default: "",
    },
    acceptedBy: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
    },
    feedback: {
      type: String,
    },
    location: {
      type: String,
    },
    isForClient: {
      type: Boolean,
      // default: false,
    },
    leadFrom: {
      type: String,
    },
    isoSample: {
      type: String,
    },
    isManuallyCreated: {
      type: Boolean,
      default: false,
    },

    entityType: {
      type: String,
    },
  },
  { timestamps: true },
);

const Quotation = mongoose.model("Quotations", Qschema);
module.exports = Quotation;
