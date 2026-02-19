import React, { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { getHeaders } from "../../utils/helpers";
import { API_URI } from "../../utils/constants";

const PaymentLinkPopup = ({ isOpen, onClose, linkId }) => {
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchPaymentLinks = async () => {
    try {
      const {
        data: { data },
      } = await axios.get(`${API_URI}/payment/link/${linkId}`, getHeaders());
      console.log(data);

      setPaymentLinks(data);
    } catch (error) {
      console.error(error?.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPaymentLinks();
      // const dummyPaymentLinks = [
      //   {
      //     id: "pay_Lnk123456",
      //     amount: 5000,
      //     status: "created",
      //     expire_by: moment().add(7, "days").unix(),
      //     short_url: "https://rzp.io/i/abcd1234",
      //     customer: {
      //       name: "John Doe",
      //       email: "john@example.com",
      //       contact: "+919876543210",
      //     },
      //   },
      //   {
      //     id: "pay_Lnk789012",
      //     amount: 7500,
      //     status: "paid",
      //     expire_by: moment().add(5, "days").unix(),
      //     short_url: "https://rzp.io/i/efgh5678",
      //     customer: {
      //       name: "Jane Smith",
      //       email: "jane@example.com",
      //       contact: "+919876543211",
      //     },
      //   },
      //   {
      //     id: "pay_Lnk345678",
      //     amount: 12000,
      //     status: "created",
      //     expire_by: moment().add(10, "days").unix(),
      //     short_url: "https://rzp.io/i/ijkl9012",
      //     customer: {
      //       name: "David Wilson",
      //       email: "david@example.com",
      //       contact: "+919876543212",
      //     },
      //   },
      // ];
    }
  }, [isOpen]);

  const handleLinkClick = (link) => {
    setSelectedLink(link);
    setDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(selectedLink.short_url);
  };

  const renderPaymentLink = (link) => {
    return (
      <div
        key={link.id}
        onClick={() => handleLinkClick(link)}
        className="bg-white rounded-lg p-4 flex justify-between mb-3 shadow-md border-l-4 border-blue-600 cursor-pointer hover:bg-gray-50"
      >
        <div className="flex-1">
          <p className="font-semibold mb-1">ID: {link.id}</p>
          <p className="mb-1">Customer Name: {link.customer.name}</p>
          <p className="text-gray-500">
            Expires on {moment.unix(link.expire_by).format("DD MMM YYYY")}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center">
          <p className="text-blue-600 font-bold text-lg">₹ {link.amount}</p>
          <span
            className={`text-xs mt-1 ${link.status === "paid" ? "text-green-500" : "text-yellow-500"}`}
          >
            {link.status}
          </span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 top-0 right-0 left-0 bottom-0 z-[50] flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative text-black max-h-[80vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Payment Links
        </h2>

        <div className="container">
          {paymentLinks.length > 0 ? (
            <div className="mb-4">
              {paymentLinks.map((link) => renderPaymentLink(link))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No payment links found.
            </p>
          )}

          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Payment Link Details Modal */}
        {detailModalVisible && selectedLink && (
          <div className="fixed inset-0 bg-black/50 top-0 right-0 left-0 bottom-0 z-[60] flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative text-black">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
                onClick={closeDetailModal}
              >
                &times;
              </button>
              <h2 className="text-2xl font-semibold text-center mb-6">
                Payment Link Details
              </h2>

              <div className="bg-blue-50 rounded-lg p-4 mb-5">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">ID</span>
                  <span className="font-semibold">{selectedLink.id}</span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-semibold ${
                      selectedLink.status === "paid"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {selectedLink.status}
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-semibold">
                    {selectedLink.customer.name}
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Contact</span>
                  <span className="font-semibold">
                    {selectedLink.customer.contact}
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Expiry</span>
                  <span className="font-semibold">
                    {moment.unix(selectedLink.expire_by).format("DD MMM YYYY")}
                  </span>
                </div>

                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold text-blue-600">
                    ₹ {selectedLink.amount}
                  </span>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={handleCopyToClipboard}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition mr-3"
                >
                  Copy Payment URL
                </button>
                <button
                  onClick={closeDetailModal}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentLinkPopup;
