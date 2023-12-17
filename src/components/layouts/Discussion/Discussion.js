// Importation des hooks nécessaires et des données de discussion mockées
import { useEffect, useState } from "react";
import { discussion } from "./discussion.data.mock";
import { Discuss } from "react-loader-spinner";


// Composant pour afficher les messages du correspondant
export const MessageCorrespondant = ({ message }) => {
    return (<div className="flex justify-start mb-4">
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

// Composant pour afficher mes messages
export const MyMessage = ({ message }) => {
    return (<div className="flex justify-end mb-4">
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


// Composant principal pour la discussion
export default function Discussion({ web5, myDid, correspondantDID }) {

    const [message, setMessage] = useState(""); // État pour le message actuel
    const [conversation, setConversation] = useState([]); // État pour la conversation actuelle

    // Fonction pour construire un "ding" (message)
    const constructDing = () => {
        // const currentDate = new Date().toLocaleDateString();
        // const currentTime = new Date().toLocaleTimeString();
        const ding = {
            sender: myDid,
            note: message,
            recipient: correspondantDID,
            timestampWritten: `${new Date().getTime()}`,
        };
        return ding;
    };

    // Fonction pour écrire un "ding" dans DWN
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

    // Fonction pour envoyer un enregistrement
    const sendRecord = async (record) => {
        return await record.send(correspondantDID);
    };

    // Fonction pour envoyer un message
    const sendMessage = async () => {
        // console.log("message sent :",message);
        if (message === "" || message === undefined) return;
        const ding = constructDing();
        const record = await writeToDwn(ding);
        const { status } = await sendRecord(record);
        setMessage("");
        console.log("status", status);
    };

    // Fonction pour récupérer les messages envoyés
    const fetchSentMessages = async (web5, did) => {
        // Faire une requête pour obtenir les enregistrements qui correspondent au protocole spécifié
        const response = await web5.dwn.records.query({
            message: {
                filter: {
                    protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
                },
            },
        });

        // Si la requête est réussie (code de statut 200)
        if (response.status.code === 200) {
            // Parcourir chaque enregistrement, convertir les données en JSON et les stocker dans sentDings
            const sentDings = await Promise.all(
                response.records?.map(async (record) => {
                    const data = await record.data.json();
                    return data;
                })
            );
            // Renvoyer les messages envoyés
            return sentDings;
        } else {
            // Si la requête échoue, afficher le statut de l'erreur
            console.log("error", response.status);
        }
    };

    // Fonction pour récupérer les messages reçus
    const fetchReceivedMessages = async (web5, did) => {
        console.log("fetchReceivedMessages");
        try {
            // Faire une requête pour obtenir les enregistrements qui correspondent au protocole et au schéma spécifiés
            const response = await web5.dwn.records.query({
                from: did,
                message: {
                    filter: {
                        protocol: "https://blackgirlbytes.dev/dinger-chat-protocol",
                        schema: "https://blackgirlbytes.dev/ding",
                    },
                },
            });
            // Si la requête est réussie, convertir les données en JSON et les stocker dans receivedDings
            // (cette partie est commentée pour le moment)
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
            // Si une erreur se produit, l'afficher dans la console
            console.log("there is an error");
            console.log(error);
        }

    };

    // Fonction pour récupérer tous les messages (envoyés et reçus)
    const fetchDings = async (web5, did) => {
        const sentMessages = await fetchSentMessages(web5, myDid);
        const receivedMessages = await fetchReceivedMessages(web5, myDid);
        const allMessages = [...sentMessages,...receivedMessages].sort(function(a,b){return parseInt(a.timestampWritten) - parseInt(b.timestampWritten);});
        console.log("allMessages",allMessages);
        setConversation(allMessages.filter(messsage => messsage.recipient === correspondantDID || messsage.sender === correspondantDID ));

    };

    // Utiliser l'effet pour récupérer les messages toutes les 2 secondes
    useEffect(() => {
        if (!web5 || !myDid) return;
        const intervalId = setInterval(async () => {
            await fetchDings(web5, myDid);
        }, 2000);

        // Nettoyer l'intervalle lors du démontage du composant
        return () => clearInterval(intervalId);
    }, [web5, myDid]);


    // Rendu du composant
    return (
        <div className="w-full px-5 flex flex-col justify-between ">
            <div className="flex flex-col mt-5 overflow-auto">
                {/* Afficher les messages de la conversation */}
                {conversation.length > 0 ?
                    // Si la conversation contient des messages, les parcourir et les afficher
                    conversation.map(message => {
                        // Si le message a été envoyé par moi, utiliser le composant MyMessage
                        if (message.sender === myDid) return <MyMessage message={message.note} />
                        // Sinon, utiliser le composant MessageCorrespondant
                        else return <MessageCorrespondant message={message.note} />
                    }) :
                    // Si la conversation ne contient pas de messages, afficher un spinner de chargement
                    <div className="m-auto flex items-center"> <Discuss
                        visible={true}
                        height="150"
                        width="150"
                        ariaLabel="comment-loading"
                        wrapperStyle={{}}
                        wrapperClass="comment-wrapper"
                        colors={["#63b3ed", "#63b3ed"]}
                    /></div>}

            </div>
            {/* Formulaire pour envoyer un message */}
            <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="py-5">
                {/* Champ de texte pour écrire le message */}
                <input
                    className="w-full bg-gray-300 py-5 px-3 rounded-xl"
                    type="text"
                    value={message}
                    placeholder="type your message here..."
                    onChange={(e) => setMessage(e.target.value)}

                />
                {/* Bouton pour envoyer le message */}
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