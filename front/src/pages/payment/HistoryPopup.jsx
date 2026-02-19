import axios from "axios";
import moment from "moment";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import React, { useState, useEffect } from "react";
import { useAgentContext } from "../../context/AgentContext";
import { useAuth } from "../../context/AuthContext";

const PaymentLinkHistory = ({ isOpen, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const { agentList } = useAgentContext();
  const { isAgent } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const fetchPayments = async () => {
        try {
          const response = await axios.get(
            `${API_URI}/payment/link`,
            getHeaders(),
          );
          setPayments(response.data.data);
        } catch (error) {
          console.error("Error fetching payment links:", error);
          setPayments([]);
        }
      };

      fetchPayments();
    }
  }, [isOpen]);

  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    setDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(selectedPayment.short_url);
  };

  const renderPaymentLink = (payment) => {
    // console.log("PAYMENT", payment);
    return (
      <div
        key={payment?.id}
        onClick={() => handlePaymentClick(payment)}
        className="bg-white rounded-lg p-4 flex justify-between mb-3 shadow-md border-l-4 border-blue-600 cursor-pointer hover:bg-gray-50"
      >
        <div className="flex-1">
          <p className="font-semibold mb-1">ID: {payment?.id}</p>
          <p className="mb-1">Customer Name: {payment?.customer?.name}</p>
          <p className="text-gray-500">
            Expires on {moment.unix(payment.expire_by).format("DD MMM YYYY")}
          </p>
          {!isAgent && payment?.agentId && (
            <p className="text-gray-400 text-sm italic">
              Created By{" "}
              {agentList.find((v) => v?._id == payment?.agentId)?.name}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-center items-center">
          <p className="text-blue-600 font-bold text-lg">₹ {payment?.amount}</p>
          <span
            className={`text-xs mt-1 ${payment?.status === "paid" ? "text-green-500" : "text-yellow-500"}`}
          >
            {payment?.status}
          </span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;
  console.log(payments, agentList);
  return (
    <div className="fixed inset-0 bg-black/50 top-0 right-0 left-0 bottom-0 z-[50] flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative text-black h-[80vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Payment Link History
        </h2>

        <div className="container">
          {payments.length > 0 ? (
            <div className="mb-4">
              {payments.map((payment) => renderPaymentLink(payment))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No Payment Received found.
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

        {/* Payment Details Modal */}
        {detailModalVisible && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 top-0 right-0 left-0 bottom-0 z-[60] flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative text-black">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
                onClick={closeDetailModal}
              >
                &times;
              </button>
              <h2 className="text-2xl font-semibold text-center mb-6">
                Payment Details
              </h2>

              <div className="bg-blue-50 rounded-lg p-4 mb-5">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">ID</span>
                  <span className="font-semibold">{selectedPayment.id}</span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-semibold ${
                      selectedPayment.status === "paid"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {selectedPayment.status}
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Expiry</span>
                  <span className="font-semibold">
                    {moment
                      .unix(selectedPayment.expire_by)
                      .format("DD MMM YYYY")}
                  </span>
                </div>

                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold text-blue-600">
                    ₹ {selectedPayment.amount}
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

export default PaymentLinkHistory;
