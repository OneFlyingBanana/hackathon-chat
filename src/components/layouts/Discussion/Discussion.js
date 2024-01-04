// Importation des hooks nécessaires et des données de discussion mockées
import { useEffect, useState } from "react";
import { discussion } from "./discussion.data.mock";
import { Discuss } from "react-loader-spinner";
import { constructDing, fetchReceivedMessages, fetchSentMessages, sendMessage, writeToDwn } from "@/utils";
import { HandShake } from "@/enums";


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
    const  handleSendMessage = async () => {
        sendMessage(message, myDid, correspondantDID, web5);
    }

    // Fonction pour récupérer tous les messages (envoyés et reçus)
    const fetchDings = async (web5, did) => {
        const sentMessages = await fetchSentMessages(web5);
        const receivedMessages = await fetchReceivedMessages(web5, myDid);
        const allMessages = [...sentMessages,...receivedMessages].sort(function(a,b){return parseInt(a.timestampWritten) - parseInt(b.timestampWritten);});
        console.log("allMessages",allMessages);
        setConversation(allMessages.filter(message=>message.note !== HandShake.HANDSHAKE_REQUEST && message.note !== HandShake.HANDSHAKE_RESPONSE).filter(messsage => messsage.recipient === correspondantDID || messsage.sender === correspondantDID ));

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
            <form onSubmit={e => { e.preventDefault(); handleSendMessage() }} className="py-5">
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