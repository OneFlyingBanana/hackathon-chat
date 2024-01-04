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

import { fetchReceivedMessages, fetchSentMessages, sendMessage } from '@/utils/messenger.util.js';
import { configureProtocol } from '@/utils/setup-chat-protocol.util.js';
import { HandShake } from '@/enums';

export default function Home() {

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
  






  const anticipateHandShakesRequest = (receivedMessages) => receivedMessages.find(message => message.note === HandShake.HANDSHAKE_REQUEST && message.recipient === myDid);
  const anticipateHandShakesResponse = (receivedMessages) => receivedMessages.find(message => message.note === HandShake.HANDSHAKE_RESPONSE && message.recipient === myDid);

  const handleHandShakeRequest = async (handshake, sentMessages) => {
    console.log("handleHandShake");
    if (corespondantDIDs.includes(handshake.sender)) return;
    setCorespondantDIDs([...corespondantDIDs, handshake.sender]);
    setDIDInfoMappers({ ...DIDInfoMappers, [handshake.sender]: { username: handshake.username } })
    if (!sentMessages?.some(message => message.note === HandShake.HANDSHAKE_RESPONSE && message.recipient === handshake.sender))
      await sendMessage(HandShake.HANDSHAKE_RESPONSE, myDid, handshake.sender, web5);

  }

  const handleHandShakeResponse = async (handshake) => {
    console.log("handleHandShakeResponse", DIDInfoMappers);
    console.log("corespondantDIDs", corespondantDIDs);
    if (corespondantDIDs.length === 0 || !corespondantDIDs.includes(handshake.sender)) setCorespondantDIDs([...corespondantDIDs, handshake.sender]);
    if (!(handshake.sender in DIDInfoMappers)) setDIDInfoMappers({ ...DIDInfoMappers, [handshake.sender]: { username: handshake.username } })
  }


  const handleHandShakes = async (receivedMessages, sentMessages) => {
    const handshakeRequest = anticipateHandShakesRequest(receivedMessages);
    const handshakeResponse = anticipateHandShakesResponse(receivedMessages);
    console.log("handshakeResponse", handshakeResponse);
    if (handshakeRequest) await handleHandShakeRequest(handshakeRequest, sentMessages);
    if (handshakeResponse) await handleHandShakeResponse(handshakeResponse);
  }

  const fetchDings = async (web5, did) => {
    const sentMessages = await fetchSentMessages(web5);
    const receivedMessages = await fetchReceivedMessages(web5, myDid);
    const allMessages = [...sentMessages, ...receivedMessages].sort(function (a, b) { return parseInt(a.timestampWritten) - parseInt(b.timestampWritten); });
    await handleHandShakes(receivedMessages, sentMessages);
  };

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

      const status = await sendMessage(HandShake.HANDSHAKE_REQUEST, myDid, did, web5);
      if (corespondantDIDs.find((element) => element === did) === undefined)
        setCorespondantDIDs([...corespondantDIDs, did])

    }
  };



  const ChatList = useMemo(() => corespondantDIDs?.map(thisDID => {
    return <UserCHatItem key={thisDID} name={DIDInfoMappers[thisDID]?.username} avatar={"https://source.unsplash.com/_7LbC5J-jw4/600x600"} lastMessage={"Pick me at 9:00 Am"} onClick={() => { setShowMessages(false); setSelectedCorespondantDID(thisDID); setShowMessages(true) }} did={thisDID} web5={web5} />
  }), [corespondantDIDs, DIDInfoMappers, web5])





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
                <path strokeLinecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

