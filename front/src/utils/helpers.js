import toast from "react-hot-toast";

export function getHeaders(params = {}, configure = {}) {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: params,
    ...configure,
  };
}

export function camelToNormal(camelCaseString) {
  return camelCaseString.replace(/([a-z])([A-Z])/g, "$1 $2"); // Add space before capital letters
  //   .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
}

export const getSuccessToast = (message) => {
  return toast.success(message);
};
export const getErrToast = (message) => {
  return toast.error(message);
};

export const marketingChannels = [
  "OTHERS",
  "GOOGLE MANUAL",
  "FB ADS",
  "FB MANUAL",
  "INSTAGRAM",
  "MCA",
  // "GST",
  "INDIAMART",
  "JUST DIAL",
  "REF",
  "RENEWAL DATA",
  "SURVELLIANCE",
  "GOOGLE ADS",
  "WHATSAPP MKT",
  "EMAIL MKT",
  "Company",
  "GST",
  "CONSULTANT",
];

var timer;
export const DEBOUNCE = (func, delay = 2000) => {
  return (...props) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...props);
    }, delay);
  };
};
