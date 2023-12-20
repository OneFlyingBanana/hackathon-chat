import UserCHatItem from '@/components/UserChatItem';
import React from 'react';
import { useState, useEffect, useMemo } from "react";
import { Web5 } from "@web5/api";
import NewChatModal from '@/components/NewChatModal';
import ProfileModal from '@/components/ProfilModal';
import NewDID from '@/components/NewDID';
import Discussion from '@/components/layouts/Discussion/Discussion';
import { NoChatSelected } from '@/components/NoChatSelected';
import { myMockedDID, myMockedcorrespondantDID } from '@/components/layouts/Discussion/discussion.data.mock';

import { HandShake } from './newhome.data.js';




export default function NewHome({ fetchSendMessage }) {


  // modals
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProfilModal, setShowProfilModal] = useState(false);
  const [showMessages, setShowMessages] = React.useState(false);
  const [showNewDIDModal, setShowNewDIDModal] = React.useState(false);



  // dids
  const [corespondantDIDs, setCorespondantDIDs] = useState([]);
  const [selectedCorespondantDID, setSelectedCorespondantDID] = useState(undefined);
  const [DIDInfoMappers, setDIDInfoMappers] = useState({});


  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);
  const [activeRecipient, setActiveRecipient] = useState(null);

  const [noteValue, setNoteValue] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [recipientDid, setRecipientDid] = useState("");
  const [didCopied, setDidCopied] = useState(false);
  const [showNewChatInput, setShowNewChatInput] = useState(false);

  const [allDings, setAllDings] = useState([]);

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
      const { web5, did } = await Web5.connect();
      setWeb5(web5);
      setMyDid(did);
      if (web5 && did) {
        await configureProtocol(web5, did);
        // await fetchDings(web5, did);
      }
    };
    initWeb5();
  }, []);


  const createProtocolDefinition = () => {
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
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "ding", can: "read" },
            { who: "recipient", of: "ding", can: "read" },
          ],
        },
      },
    };
    return dingerProtocolDefinition;
  };

  const queryForProtocol = async (web5) => {
    return await web5.dwn.protocols.query({
      message: {
        filter: {
          protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
        },
      },
    });
  };

  const installProtocolLocally = async (web5, protocolDefinition) => {
    return await web5.dwn.protocols.configure({
      message: {
        definition: protocolDefinition,
      },
    });
  };

  const configureProtocol = async (web5, did) => {
    const protocolDefinition = await createProtocolDefinition();

    const { protocols: localProtocol, status: localProtocolStatus } =
      await queryForProtocol(web5);
    // console.log({ localProtocol, localProtocolStatus });
    if (localProtocolStatus.code !== 200 || localProtocol.length === 0) {

      const { protocol, status } = await installProtocolLocally(web5, protocolDefinition);
      // console.log("Protocol installed locally", protocol, status);

      const { status: configureRemoteStatus } = await protocol.send(did);
      // console.log("Did the protocol install on the remote DWN?", configureRemoteStatus);
    } else {
      // console.log("Protocol already installed");
    }
  };


  const constructDing = (message, myDid, recipientDid) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const ding = {
      sender: myDid,
      note: message,
      username: localStorage.getItem("username") || "USER NAME",
      recipient: recipientDid,
      timestampWritten: `${new Date().getTime()}`,
    };
    return ding;
  };

  const writeToDwn = async (ding, recipientDid) => {
    const { record } = await web5.dwn.records.write({
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

  const sendRecord = async (record, recipientDid) => {
    return await record.send(recipientDid);
  };

  const sendMessage = async (message, myDid, recipientDid) => {
    // console.log("message sent :",message);
    if (message === "" || message === undefined) return;
    const ding = constructDing(message, myDid, recipientDid);
    const record = await writeToDwn(ding, recipientDid);
    const { status } = await sendRecord(record, recipientDid);
    return status;
  };

  const fetchSentMessages = async (web5, did) => {

    const response = await web5.dwn.records.query({
      message: {
        filter: {
          protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
        },
      },
    });


    if (response.status.code === 200) {
      const sentDings = await Promise.all(
        response.records?.map(async (record) => {
          const data = await record.data.json();
          return data;
        })
      );
      return sentDings;
    } else {
      console.log("error", response.status);
    }
  };


  const fetchReceivedMessages = async (web5, did) => {
    try {
      const response = await web5.dwn.records.query({
        from: did,
        message: {
          filter: {
            protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
            schema: "https://blackgirlbytes.dev/ding",
          },
        },
      });
      console.log(response.records);
      if (response.status.code === 200) {
        const receivedDings = await Promise.all(
          response.records?.map(async (record) => {
            const data = await record.data.json();
            return data;
          })
        );
        return receivedDings;
      }
    } catch (error) {
      console.log("there is an error");
      console.log(error);
    }

  };


  const anticipateHandShakesRequest = (receivedMessages) => receivedMessages.find(message => message.note === HandShake.HANDSHAKE_REQUEST && message.recipient === myDid);
  const anticipateHandShakesResponse = (receivedMessages) => receivedMessages.find(message => message.note === HandShake.HANDSHAKE_RESPONSE && message.recipient === myDid);

  const handleHandShakeRequest = async (handshake, sentMessages) => {
    console.log("handleHandShake");
    if (corespondantDIDs.includes(handshake.sender)) return;
    setCorespondantDIDs([...corespondantDIDs, handshake.sender]);
    setDIDInfoMappers({ ...DIDInfoMappers, [handshake.sender]: { username: handshake.username } })
    if (!sentMessages?.some(message => message.note === HandShake.HANDSHAKE_RESPONSE && message.recipient === handshake.sender))
      await sendMessage(HandShake.HANDSHAKE_RESPONSE, myDid, handshake.sender);

  }

  const handleHandShakeResponse = async (handshake) => {
    console.log("handleHandShakeResponse",DIDInfoMappers);
    console.log("corespondantDIDs",corespondantDIDs);
    if ( corespondantDIDs.length === 0 || !corespondantDIDs.includes(handshake.sender)) setCorespondantDIDs([...corespondantDIDs, handshake.sender]);
    if(!(handshake.sender in DIDInfoMappers)) setDIDInfoMappers({ ...DIDInfoMappers, [handshake.sender]: { username: handshake.username } })
  }


  const handleHandShakes = async (receivedMessages, sentMessages) => {
    const handshakeRequest = anticipateHandShakesRequest(receivedMessages);
    const handshakeResponse = anticipateHandShakesResponse(receivedMessages);
    console.log("handshakeResponse", handshakeResponse);
    if (handshakeRequest) await handleHandShakeRequest(handshakeRequest, sentMessages);
    if (handshakeResponse) await handleHandShakeResponse(handshakeResponse);
  }

  const fetchDings = async (web5, did) => {
    const sentMessages = await fetchSentMessages(web5, myDid);
    const receivedMessages = await fetchReceivedMessages(web5, myDid);
    const allMessages = [...sentMessages, ...receivedMessages].sort(function (a, b) { return parseInt(a.timestampWritten) - parseInt(b.timestampWritten); });
    await handleHandShakes(receivedMessages,sentMessages);
  };






  useEffect(() => {
    if (!web5 || !myDid) return;
    const intervalId = setInterval(async () => {
      await fetchDings(web5, myDid);
    }, 2000);
    return () => clearInterval(intervalId);
  }, [web5, myDid]);


  const handleSubmitNewDID = async (did) => {
    const indexDID = corespondantDIDs.find((element) => element === did);
    if (indexDID === undefined) {

      const status = await sendMessage(HandShake.HANDSHAKE_REQUEST, myDid, did);
      // setCorespondantDIDs([...corespondantDIDs, did])

    }
  };



  const ChatList = useMemo(() => corespondantDIDs?.map(thisDID => {
    return <UserCHatItem key={thisDID} name={DIDInfoMappers[thisDID]?.username} avatar={"https://source.unsplash.com/_7LbC5J-jw4/600x600"} lastMessage={"Pick me at 9:00 Am"} onClick={() => { setShowMessages(false); setSelectedCorespondantDID(thisDID); setShowMessages(true) }} did={thisDID} web5={web5} />
  }), [corespondantDIDs , DIDInfoMappers, web5])





  return (
    <div className="container mx-auto shadow-lg rounded-lg">
      <div className="px-5 py-5 flex justify-between items-center bg-white border-b-2">
        <div className="font-semibold text-2xl">
          <button type="button" onClick={() => setShowMessages(false)}   >
            Accueil
          </button>
        </div>
        <div className="w-1/2">
          <input
            type="text"
            name=""
            id=""
            placeholder="search IRL"
            className="rounded-2xl bg-gray-100 py-3 px-5 w-full"
          />
        </div>
        <button
          onClick={() => setShowNewDIDModal(!showNewDIDModal)}
          className="h-12 w-12 p-2 bg-yellow-500 rounded-full text-white font-semibold flex items-center justify-center"
        >
          New DID
        </button>
        <button
          onClick={() => setShowProfilModal(!showProfilModal)}
          className="h-12 w-12 p-2 bg-yellow-500 rounded-full text-white font-semibold flex items-center justify-center"
        >
          Profil
        </button>
      </div>
      <div className="flex flex-row justify-between bg-white overflow-hidden" style={{ height: '85vh' }}>
        <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
          <div className="border-b-2 py-4 px-2 flex justify-between px-8">
            <button type='button' className="flex border-b-2 py-4 px-2" onClick={() => setShowNewChatModal(!showNewChatModal)}>

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <p className='ml-4'>New chat</p>

            </button>
            <button type='button' className="flex border-b-2 py-4 px-2" onClick={() => navigator.clipboard.writeText(myDid)}>


              <p className='ml-4'>Copie DID</p>

            </button>
          </div>

          {ChatList}
        </div>
        {showMessages && selectedCorespondantDID && (
          <Discussion myDid={myDid} correspondantDID={selectedCorespondantDID} web5={web5} />
          // <Discussion myDid={myDid} correspondantDID={selectedCorespondantDID}  web5={web5}/>
        )}
      </div>
      {showProfilModal && <ProfileModal setShow={(value) => setShowProfilModal(value)} myDid={myDid} />}
      {showNewChatModal && <NewChatModal setShow={setShowNewChatModal} submit={handleSubmitNewDID} />}
      {showNewDIDModal && <NewDID setShow={setShowNewDIDModal} />}

    </div>
  );
}

