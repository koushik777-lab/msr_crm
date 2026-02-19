import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
} from "@mui/material";
import { IoCopy } from "react-icons/io5";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import { ThreeCircles } from "react-loader-spinner";
import { useAgentContext } from "../../context/AgentContext";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function WhatsappChat({ renderFn }) {
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [allContact, setAllcontacts] = useState([]);
  const [chats, setChats] = useState([]);
  const { agentList } = useAgentContext();
  const chatBoxRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const { isAgent } = useAuth();

  async function fetchContacts() {
    setLoading(true);
    try {
      const {
        data: { data },
      } = await axios.get(`${API_URI}/whatsappContacts`, getHeaders());
      setAllcontacts(data);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChats() {
    setChatLoading(true);
    try {
      const {
        data: { data },
      } = await axios.get(
        `${API_URI}/whatsappChats/${selectedContact._id}`,
        getHeaders(),
      );
      setChats(data.reverse());
      setAllcontacts((prev) =>
        prev.map((v) =>
          v?._id == selectedContact?._id ? { ...v, unreadChat: 0 } : { ...v },
        ),
      );
    } catch (error) {
      // console.log(error?.message);
    } finally {
      setChatLoading(false);
    }
  }

  // // console.log(selectedContact, allContact);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchChats();
    }
  }, [selectedContact]);

  useEffect(() => {
    if (chats.length > 0) {
      scrollToBottom();
    }
  }, [chats]);

  // Format date for message timestamps
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date for date headers
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  const copyLastTenDigits = (number) => {
    const last10 = number.slice(-10);
    navigator.clipboard.writeText(last10);
  };

  const handleCheckboxChange = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  };

  async function handleAssignAgent(e) {
    try {
      // setSelectedAgent(e.target.value);
      // console.log(e.target.value, selectedContacts);
      if (selectedContacts?.length == 0) {
        return toast.error("Select Atleast 1 Contact");
      }

      const { data } = await axios.post(
        `${API_URI}/Whatsapp/assignAgent`,
        {
          contacts: selectedContacts,
          agentId: e.target.value,
        },
        getHeaders(),
      );

      // console.log(data);
      toast.success("Chats Assigned Successfully");
      renderFn();
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "SERVER IS ON COFFEE BREAK !!!",
      );
    }
  }

  const filteredContacts = allContact.filter((contact) => {
    return (
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // console.log("ALL CONTACTS", allContact, chats);
  return (
    <Box
      sx={{
        display: "flex",
        height: "75svh",
        gap: 2,
        flex: "1 1 70%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Contacts List */}
      <Paper
        elevation={3}
        sx={{
          width: 320,
          minWidth: 280,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: "0 0 auto",
        }}
      >
        <Typography
          variant="h6"
          sx={{ p: 2, backgroundColor: "#075e54", color: "white" }}
        >
          Chats
        </Typography>
        <Box sx={{ p: 2, gap: 2, display: "flex", flexDirection: "column" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by name or number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {!isAgent && (
            <FormControl fullWidth size="small">
              <InputLabel>Assign Other Agent</InputLabel>
              <Select
                value={selectedAgent}
                onChange={(e) => handleAssignAgent(e)}
                label="Assigned Agent"
                clearable="true"
              >
                {/* <MenuItem value="">
                <em>None</em>
              </MenuItem> */}
                {agentList.map((agent) => (
                  <MenuItem key={agent._id} value={agent._id}>
                    {agent.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        {loading ? (
          <div className="mt-10 w-full  flex items-center justify-center">
            <ThreeCircles
              visible={true}
              height="100"
              width="100"
              color="#075E54"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        ) : filteredContacts?.length == 0 ? (
          <div className="mt-10 text-gray-400">No Contact Found</div>
        ) : (
          <List sx={{ overflow: "auto", flex: 1 }}>
            {filteredContacts?.length > 0 &&
              filteredContacts.map((contact) => (
                <div key={contact._id} className=" ">
                  <ListItemButton
                    selected={selectedContact?._id === contact._id}
                    className=""
                    onClick={() => setSelectedContact(contact)}
                  >
                    <Checkbox
                      checked={selectedContacts.includes(contact._id)}
                      onChange={() => handleCheckboxChange(contact._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ListItemAvatar onClick={() => setSelectedContact(contact)}>
                      <Avatar sx={{ bgcolor: "#128C7E" }}>
                        {contact?.name && contact?.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      onClick={() => setSelectedContact(contact)}
                      primary={contact?.name && contact?.name}
                      secondary={contact.number}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(contact.updatedAt)}
                    </Typography>
                    {contact?.unreadChat > 0 && (
                      <Typography
                        variant="caption"
                        color="white"
                        display={"block"}
                        className="absolute right-4 bottom-1 bg-red-500 rounded-full w-5 h-5 text-center flex items-center font-bold "
                      >
                        {contact?.unreadChat}
                      </Typography>
                    )}
                    {""}
                  </ListItemButton>
                  {!isAgent && (
                    <ListItemButton
                      onClick={() => setSelectedContact(contact)}
                      selected={selectedContact?._id === contact._id}
                    >
                      <Typography
                        variant="caption"
                        className=" px-4 italic text-gray-500"
                      >
                        Assigned to {contact?.assignedTo}
                      </Typography>
                    </ListItemButton>
                  )}
                  <Divider />
                </div>
              ))}
          </List>
        )}
      </Paper>

      {/* Chat Area */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {selectedContact ? (
          <>
            <Box
              sx={{
                p: 2,
                backgroundColor: "#075e54",
                color: "white",
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ bgcolor: "#128C7E" }}>
                  {selectedContact?.name && selectedContact?.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="subtitle1">
                      {selectedContact.number}
                    </Typography>
                    <Tooltip title="Copy phone number">
                      <IconButton
                        size="small"
                        sx={{ color: "white", p: 0.5 }}
                        onClick={() =>
                          copyLastTenDigits(selectedContact.number)
                        }
                      >
                        <IoCopy size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" display={"block"}>
                    {selectedContact?.name ?? selectedContact?.name}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              ref={chatBoxRef}
              sx={{
                flex: 1,
                backgroundColor: "#E4DDD6",
                p: 2,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                minHeight: 0,
              }}
            >
              {chatLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <ThreeCircles
                    visible={true}
                    height="100"
                    width="100"
                    color="#075E54"
                    ariaLabel="three-circles-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  />
                </div>
              ) : (
                Object.entries(groupMessagesByDate(chats)).map(
                  ([date, dateMessages]) => (
                    <React.Fragment key={date}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          my: 2,
                        }}
                      >
                        <Paper
                          sx={{
                            px: 2,
                            py: 0.5,
                            backgroundColor: "#E1F3FB",
                            borderRadius: 5,
                          }}
                        >
                          <Typography variant="caption">
                            {formatDate(date)}
                          </Typography>
                        </Paper>
                      </Box>
                      {dateMessages.map((chat) => (
                        <Box
                          key={chat._id}
                          sx={{
                            alignSelf:
                              chat.direction === "send"
                                ? "flex-end"
                                : "flex-start",
                            maxWidth: "70%",
                          }}
                        >
                          <Paper
                            sx={{
                              p: 1.5,
                              backgroundColor:
                                chat.direction === "send" ? "#DCF8C6" : "white",
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body1">
                              {chat.message.body}
                            </Typography>
                            {!isAgent && (
                              <Typography
                                variant="caption"
                                className=" px-4 italic text-gray-500"
                              >
                                Chat{" "}
                                {chat?.direction == "send" ? "from" : "for"}{" "}
                                {chat?.agentName}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                textAlign: "right",
                                mt: 0.5,
                              }}
                            >
                              {formatTime(chat.createdAt)}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </React.Fragment>
                  ),
                )
              )}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "grey.300",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a chat to start messaging
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
