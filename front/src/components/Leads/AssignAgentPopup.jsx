import { FaTimes } from "react-icons/fa";
import { useState } from "react";

export default function AssignAgentPopup({ onClose }) {
  const [checkedItems, setCheckedItems] = useState({});

  const agents = [
    { name: "Lina", phone: "24", leads: "10 Leads" },
    { name: "John", phone: "25", leads: "5 Leads" },
    { name: "Doe", phone: "26", leads: "8 Leads" },
  ];

  const handleCheckboxChange = (index) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 top-0 bottom-0 left-0 right-0 z-[50]">
      <div className="bg-white p-6 rounded-lg w-[650px] relative text-black">
        <button className="absolute top-4 right-4 cursor-pointer" onClick={onClose}>
          <FaTimes className="text-xl" />
        </button>
        <h2 className="text-center text-lg font-semibold mb-4">Assign Agent</h2>
        <table className="w-full  mb-4">
          <thead>
            <tr className="bg-gray-100 ">
              <th className="text-left p-3 ">NAME</th>
              <th className="text-left p-3 ">PHONE NUMBER</th>
              <th className="text-left p-3 ">CURRENTLY HAS</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody className="font-light">
            {agents.map((agent, index) => (
              <tr className="" key={index}>
                <td className="p-3">{agent.name}</td>
                <td className="p-3">{agent.phone}</td>
                <td className="p-3">{agent.leads}</td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={!!checkedItems[index]}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            onClick={() => console.log("Assign agent")}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
