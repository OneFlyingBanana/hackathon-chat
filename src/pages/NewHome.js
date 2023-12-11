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
export default function NewHome({ fetchSendMessage }) {

  // const showState = React.useState(false);
  // const show = showState[0];
  // const setShow = showState[1];

  // modals
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProfilModal, setShowProfilModal] = useState(false);
  const [showMessages, setShowMessages] = React.useState(false);
  const [showNewDIDModal, setShowNewDIDModal] = React.useState(false);



  // dids
  const [corespondantDIDs, setCorespondantDIDs] = useState([myMockedcorrespondantDID]);
  const [selectedCorespondantDID, setSelectedCorespondantDID] = useState(undefined);


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

  // useEffect(() => {
  //   if (!web5 || !myDid) return;
  //   const intervalId = setInterval(async () => {
  //     await fetchDings(web5, myDid);
  //   }, 2000);

  //   return () => clearInterval(intervalId);
  // }, [web5, myDid]);

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
    console.log({ localProtocol, localProtocolStatus });
    if (localProtocolStatus.code !== 200 || localProtocol.length === 0) {

      const { protocol, status } = await installProtocolLocally(web5, protocolDefinition);
      // console.log("Protocol installed locally", protocol, status);

      const { status: configureRemoteStatus } = await protocol.send(did);
      // console.log("Did the protocol install on the remote DWN?", configureRemoteStatus);
    } else {
      // console.log("Protocol already installed");
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

  const sendRecord = async (record) => {
    return await record.send(recipientDid);
  };

  const handleSubmitNewDID = (did) => {
    const indexDID = corespondantDIDs.find((element) => element === did);
    if (indexDID === undefined)
      setCorespondantDIDs([...corespondantDIDs, did])
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('----------------------- send')
    if (!noteValue.trim()) {
      setErrorMessage('Please type a message before sending.');
      return;
    }

    const ding = constructDing();
    const record = await writeToDwn(ding);
    const { status } = await sendRecord(record);

    console.log("Send record status", status);

    await fetchDings(web5, myDid);
    setNoteValue("");
  };

  const handleCopyDid = async () => {
    if (myDid) {
      try {
        await navigator.clipboard.writeText(myDid);
        setDidCopied(true);
        console.log("DID copied to clipboard");

        setTimeout(() => {
          setDidCopied(false);
        }, 3000);
      } catch (err) {
        console.log("Failed to copy DID: " + err);
      }
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


  const ChatList = useMemo(() => corespondantDIDs?.map(thisDID => {
    return <UserCHatItem key={thisDID} name={'Luis1994'} avatar={"https://source.unsplash.com/_7LbC5J-jw4/600x600"} lastMessage={"Pick me at 9:00 Am"} onClick={() => { setSelectedCorespondantDID(thisDID); setShowMessages(true) }} did={thisDID} web5={web5} />
  }), [corespondantDIDs, web5])


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

