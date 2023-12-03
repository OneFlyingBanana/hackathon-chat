import {
  Web5
} from "@web5/api";
import {
  useState,
  useEffect
} from "react";
import {
  NoChatSelected
} from "@/components/NoChatSelected";
import {
  Sidebar
} from "@/components/Sidebar";
import {
  Chat
} from "@/components/Chat";
import React from "react";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";

import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBBtn,
  MDBTypography,
  MDBTextArea,
  MDBCardHeader,
} from "mdb-react-ui-kit";

export default function Home() {

  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);
  const [activeRecipient, setActiveRecipient] = useState(null);

  const [receivedDings, setReceivedDings] = useState([]);
  const [sentDings, setSentDings] = useState([]);

  const [noteValue, setNoteValue] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [recipientDid, setRecipientDid] = useState("");

  const [didCopied, setDidCopied] = useState(false);
  const [showNewChatInput, setShowNewChatInput] = useState(false);

  const allDings = [...receivedDings, ...sentDings];

  const sortedDings = allDings.sort(
    (a, b) => new Date(a.timestampWritten) - new Date(b.timestampWritten)
  );

  const groupedDings = allDings.reduce((acc, ding) => {
    const recipient = ding.sender === myDid ? ding.recipient : ding.sender;
    if (!acc[recipient]) acc[recipient] = [];
    acc[recipient].push(ding);
    return acc;
  }, {});

  useEffect(() => {
    const initWeb5 = async () => {
      const {
        web5,
        did
      } = await Web5.connect();
      setWeb5(web5);
      setMyDid(did);

      if (web5 && did) {
        await configureProtocol(web5);
        await fetchDings(web5, did);
      }
    };
    initWeb5();
  }, []);

  useEffect(() => {
    if (!web5 || !myDid) return;
    const intervalId = setInterval(async () => {
      await fetchDings(web5, myDid);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [web5, myDid]);

  const configureProtocol = async (web5) => {
    const dingerProtocolDefinition = {
      protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
      published: true,
      types: {
        ding: {
          schema: "https://blackgirlbytes.dev/ding",
          dataFormats: ["application/json"],
        },
      },
      structure: {
        ding: {
          $actions: [{
              who: "anyone",
              can: "write"
            },
            {
              who: "author",
              of: "ding",
              can: "read"
            },
            {
              who: "recipient",
              of: "ding",
              can: "read"
            },
          ],
        },
      },
    };

    const {
      protocols,
      status: protocolStatus
    } =
    await web5.dwn.protocols.query({
      message: {
        filter: {
          protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
        },
      },
    });

    if (protocolStatus.code !== 200 || protocols.length === 0) {
      const {
        protocolStatus
      } = await web5.dwn.protocols.configure({
        message: {
          definition: dingerProtocolDefinition,
        },
      });
      console.log("Configure protocol status", protocolStatus);
    }
  };

  const constructDing = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const ding = {
      sender: myDid,
      note: noteValue,
      recipient: recipientDid,
      timestampWritten: `${currentDate} ${currentTime}`,
    };
    return ding;
  };

  const writeToDwn = async (ding) => {
    const {
      record
    } = await web5.dwn.records.write({
      data: ding,
      message: {
        protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
        protocolPath: "ding",
        schema: "https://blackgirlbytes.dev/ding",
        recipient: recipientDid,
      },
    });
    return record;
  };

  const sendRecord = async (record) => {
    return await record.send(recipientDid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!noteValue.trim()) {
      setErrorMessage('Please type a message before sending.');
      return;
    }

    const ding = constructDing();
    const record = await writeToDwn(ding);
    const {
      status
    } = await sendRecord(record);

    console.log("Send record status", status);

    await fetchDings(web5, myDid);
  };

  const handleCopyDid = async () => {
    if (myDid) {
      try {
        await navigator.clipboard.writeText(myDid);
        setDidCopied(true);

        setTimeout(() => {
          setDidCopied(false);
        }, 3000);
      } catch (err) {
        console.log("Failed to copy DID: " + err);
      }
    }
  };

  const fetchDings = async (web5, did) => {
    const {
      records,
      status: recordStatus
    } = await web5.dwn.records.query({
      message: {
        filter: {
          protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
          protocolPath: "ding",
        },
        dateSort: "createdAscending",
      },
    });

    try {
      const results = await Promise.all(
        records.map(async (record) => record.data.json())
      );

      if (recordStatus.code == 200) {
        const received = results.filter((result) => result ? .recipient === did);
        const sent = results.filter((result) => result ? .sender === did);
        setReceivedDings(received);
        setSentDings(sent);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartNewChat = () => {
    setActiveRecipient(null);
    setShowNewChatInput(true);
  };

  const handleSetActiveRecipient = (recipient) => {
    setRecipientDid(recipient);
    setActiveRecipient(recipient);
    setShowNewChatInput(false);
  };

  const handleConfirmNewChat = () => {
    setActiveRecipient(recipientDid);
    setActiveRecipient(recipientDid);
    setShowNewChatInput(false);
    if (!groupedDings[recipientDid]) {
      groupedDings[recipientDid] = [];
    }
  };

  return ( <
    MDBContainer fluid className = "py-5"
    style = {
      {
        backgroundColor: "#eee"
      }
    } >
    <
    MDBRow >
    <
    MDBCol md = "6"
    lg = "5"
    xl = "4"
    className = "mb-4 mb-md-0" >
    <
    h5 className = "font-weight-bold mb-3 text-center text-lg-start" >
    Member <
    /h5>

    <
    MDBCard >
    <
    MDBCardBody >
    <
    MDBTypography listUnStyled className = "mb-0" >
    <
    li className = "p-2 border-bottom"
    style = {
      {
        backgroundColor: "#eee"
      }
    } >
    <
    a href = "#!"
    className = "d-flex justify-content-between" >
    <
    div className = "d-flex flex-row" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-center me-3 shadow-1-strong"
    width = "60" /
    >
    <
    div className = "pt-1" >
    <
    p className = "fw-bold mb-0" > John Doe < /p> <
    p className = "small text-muted" >
    Hello, Are you there ?
    <
    /p> < /
    div > <
    /div> <
    div className = "pt-1" >
    <
    p className = "small text-muted mb-1" > Just now < /p> <
    span className = "badge bg-danger float-end" > 1 < /span> < /
    div > <
    /a> < /
    li > <
    li className = "p-2 border-bottom" >
    <
    a href = "#!"
    className = "d-flex justify-content-between" >
    <
    div className = "d-flex flex-row" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-1.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-center me-3 shadow-1-strong"
    width = "60" /
    >
    <
    div className = "pt-1" >
    <
    p className = "fw-bold mb-0" > Danny Smith < /p> <
    p className = "small text-muted" >
    Lorem ipsum dolor sit. <
    /p> < /
    div > <
    /div> <
    div className = "pt-1" >
    <
    p className = "small text-muted mb-1" > 5 mins ago < /p> < /
    div > <
    /a> < /
    li > <
    li className = "p-2 border-bottom" >
    <
    a href = "#!"
    className = "d-flex justify-content-between" >
    <
    div className = "d-flex flex-row" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-2.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-center me-3 shadow-1-strong"
    width = "60" /
    >
    <
    div className = "pt-1" >
    <
    p className = "fw-bold mb-0" > Alex Steward < /p> <
    p className = "small text-muted" >
    Lorem ipsum dolor sit. <
    /p> < /
    div > <
    /div> <
    div className = "pt-1" >
    <
    p className = "small text-muted mb-1" > Yesterday < /p> < /
    div > <
    /a> < /
    li > <
    li className = "p-2 border-bottom" >
    <
    a href = "#!"
    className = "d-flex justify-content-between" >
    <
    div className = "d-flex flex-row" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-3.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-center me-3 shadow-1-strong"
    width = "60" /
    >
    <
    div className = "pt-1" >
    <
    p className = "fw-bold mb-0" > Ashley Olsen < /p> <
    p className = "small text-muted" >
    Lorem ipsum dolor sit. <
    /p> < /
    div > <
    /div> <
    div className = "pt-1" >
    <
    p className = "small text-muted mb-1" > Yesterday < /p> < /
    div > <
    /a> < /
    li > <
    li className = "p-2 border-bottom" >
    <
    a href = "#!"
    className = "d-flex justify-content-between" >
    <
    div className = "d-flex flex-row" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-4.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-center me-3 shadow-1-strong"
    width = "60" /
    >
    <
    div className = "pt-1" >
    <
    p className = "fw-bold mb-0" > Kate Moss < /p> <
    p className = "small text-muted" >
    Lorem ipsum dolor sit. <
    /p> < /
    div > <
    /div> <
    div className = "pt-1" >
    <
    p className = "small text-muted mb-1" > Yesterday < /p> < /
    div > <
    /a> < /
    li > <
    li className = "p-2 border-bottom" >
    <
    a href = "#!"
    className = "d-flex justify-content-between" >
    <
    div className = "d-flex flex-row" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-center me-3 shadow-1-strong"
    width = "60" /
    >
    <
    div className = "pt-1" >
    <
    p className = "fw-bold mb-0" > Lara Croft < /p> <
    p className = "small text-muted" >
    Lorem ipsum dolor sit. <
    /p> < /
    div > <
    /div> <
    div className = "pt-1" >
    <
    p className = "small text-muted mb-1" > Yesterday < /p> < /
    div > <
    /a> < /
    li > <
    li className = "p-2" >
    <
    a href = "#!"
    className = "d-flex justify-content-between" >
    <
    div className = "d-flex flex-row" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-center me-3 shadow-1-strong"
    width = "60" /
    >
    <
    div className = "pt-1" >
    <
    p className = "fw-bold mb-0" > Brad Pitt < /p> <
    p className = "small text-muted" >
    Lorem ipsum dolor sit. <
    /p> < /
    div > <
    /div> <
    div className = "pt-1" >
    <
    p className = "small text-muted mb-1" > 5 mins ago < /p> <
    span className = "text-muted float-end" >
    <
    MDBIcon fas icon = "check" / >
    <
    /span> < /
    div > <
    /a> < /
    li > <
    /MDBTypography> < /
    MDBCardBody > <
    /MDBCard> < /
    MDBCol >

    <
    MDBCol md = "6"
    lg = "7"
    xl = "8" >
    <
    MDBTypography listUnStyled >
    <
    li className = "d-flex justify-content-between mb-4" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-start me-3 shadow-1-strong"
    width = "60" /
    >
    <
    MDBCard >
    <
    MDBCardHeader className = "d-flex justify-content-between p-3" >
    <
    p className = "fw-bold mb-0" > Brad Pitt < /p> <
    p className = "text-muted small mb-0" >
    <
    MDBIcon far icon = "clock" / > 12 mins ago <
    /p> < /
    MDBCardHeader > <
    MDBCardBody >
    <
    p className = "mb-0" >
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. <
    /p> < /
    MDBCardBody > <
    /MDBCard> < /
    li > <
    li class = "d-flex justify-content-between mb-4" >
    <
    MDBCard className = "w-100" >
    <
    MDBCardHeader className = "d-flex justify-content-between p-3" >
    <
    p class = "fw-bold mb-0" > Lara Croft < /p> <
    p class = "text-muted small mb-0" >
    <
    MDBIcon far icon = "clock" / > 13 mins ago <
    /p> < /
    MDBCardHeader > <
    MDBCardBody >
    <
    p className = "mb-0" >
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. <
    /p> < /
    MDBCardBody > <
    /MDBCard> <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-start ms-3 shadow-1-strong"
    width = "60" /
    >
    <
    /li> <
    li className = "d-flex justify-content-between mb-4" >
    <
    img src = "https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp"
    alt = "avatar"
    className = "rounded-circle d-flex align-self-start me-3 shadow-1-strong"
    width = "60" /
    >
    <
    MDBCard >
    <
    MDBCardHeader className = "d-flex justify-content-between p-3" >
    <
    p className = "fw-bold mb-0" > Brad Pitt < /p> <
    p className = "text-muted small mb-0" >
    <
    MDBIcon far icon = "clock" / > 10 mins ago <
    /p> < /
    MDBCardHeader > <
    MDBCardBody >
    <
    p className = "mb-0" >
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. <
    /p> < /
    MDBCardBody > <
    /MDBCard> < /
    li > <
    li className = "bg-white mb-3" >
    <
    MDBTextArea label = "Message"
    id = "textAreaExample"
    rows = {
      4
    }
    /> < /
    li > <
    MDBBtn color = "info"
    rounded className = "float-end" >
    Send <
    /MDBBtn> < /
    MDBTypography > <
    /MDBCol> < /
    MDBRow > <
    /MDBContainer>

  );
}