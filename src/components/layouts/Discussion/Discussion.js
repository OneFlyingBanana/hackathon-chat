import { useEffect, useState } from "react";
import { discussion } from "./discussion.data.mock";
import { Discuss } from "react-loader-spinner";



export const MessageCorrespondant = ({message}) => {
    return (   <div className="flex justify-start mb-4">
    <img
        src="https://source.unsplash.com/vpOeXr5wmR4/600x600"
        className="object-cover h-8 w-8 rounded-full"
        alt=""
    />
    <div
        className="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white"
    >
        {message}
    </div>
</div>);
}


export const MyMessage = ({message}) => {
    return (  <div className="flex justify-end mb-4">
    <div
        className="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
    >
       {message}
    </div>
    <img
        src="https://source.unsplash.com/vpOeXr5wmR4/600x600"
        className="object-cover h-8 w-8 rounded-full"
        alt=""
    />
</div>);
}



export default function Discussion({ web5, myDid, correspondantDID }) {

    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState([]);
    const constructDing = () => {
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        const ding = {
            sender: myDid,
            note: message,
            recipient: correspondantDID,
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
                recipient: correspondantDID,
            },
        });
        return record;
    };

    const sendRecord = async (record) => {
        return await record.send(correspondantDID);
    };

    const sendMessage = async () => {
        // console.log("message sent :",message);
        if(message ==="" || message === undefined) return;
        const ding = constructDing();
        const record = await writeToDwn(ding);
        const { status } = await sendRecord(record);
        setMessage("");
        console.log("status", status);
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
        console.log("fetchReceivedMessages");
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
            // console.log(response.records);
            // if (response.status.code === 200) {
            //     const receivedDings = await Promise.all(
            //         response.records?.map(async (record) => {
            //             const data = await record.data.json();
            //             return data;
            //         })
            //     );
            //     return receivedDings;
            // }
        } catch (error) {
            console.log("there is an error");
            console.log(error);
        }
       
    };

    const fetchDings = async (web5, did) => {
        const sentMessages = await fetchSentMessages(web5, myDid);
        // const receivedMessages = await fetchReceivedMessages(web5, myDid);
        // const allMessages = [...(sentMessages || []), ...(receivedMessages || [])];
        console.log("ALL MESSAGE :", sentMessages);
        setConversation([...sentMessages.filter(messsage=>messsage.recipient === correspondantDID)]);
        // setAllDings(allMessages);
    };

    useEffect(() => {
        if (!web5 || !myDid) return;
        const intervalId = setInterval(async () => {
          await fetchDings(web5, myDid);
        }, 2000);
    
        return () => clearInterval(intervalId);
      }, [web5, myDid]);


    return (
        <div className="w-full px-5 flex flex-col justify-between ">
            <div className="flex flex-col mt-5 overflow-auto">
                {conversation.length > 0 ? conversation.map(message=>{
                        if(message.sender === myDid) return <MyMessage message={message.note} />
                        else return <MessageCorrespondant message={message.note} />
                }) : <div className="m-auto flex items-center"> <Discuss
                visible={true}
                height="150"
                width="150"
                ariaLabel="comment-loading"
                wrapperStyle={{}}
                wrapperClass="comment-wrapper"
                colors={["#63b3ed","#63b3ed"]}
              /></div>}
             
            </div>
            <form onSubmit={e=>{e.preventDefault(); sendMessage()}} className="py-5">
                <input
                    className="w-full bg-gray-300 py-5 px-3 rounded-xl"
                    type="text"
                    value={message}
                    placeholder="type your message here..."
                    onChange={(e) => setMessage(e.target.value)}

                />
                <button
                    type='submit'
                    className="bg-blue-400 py-3 px-5 rounded-full text-white mt-3 float-right"
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
}