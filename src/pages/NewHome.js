import UserCHatItem from '@/components/UserChatItem';
import React from 'react';
import ProfilModal from '@/components/ProfilModal';
import { NoChatSelected } from '@/components/NoChatSelected';
export default function NewHome() {

    const showState = React.useState(false);
    const show = showState[0];
    const setShow = showState[1];
    const [showMessages, setShowMessages] = React.useState(false);

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
                    onClick={() => setShow(!show)}
                    className="h-12 w-12 p-2 bg-yellow-500 rounded-full text-white font-semibold flex items-center justify-center"
                >
                    Profil
                </button>
            </div>
            <div className="flex flex-row justify-between bg-white overflow-hidden" style={{ height: '85vh' }}>
                <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
                    <div className="border-b-2 py-4 px-2">
                        <button type='button' className="flex border-b-2 py-4 px-2" onClick={() => console.log("Button clicked")}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <p className='ml-4'>New chat</p>
                        </button>
                    </div>
                    <UserCHatItem name={'Luis1994'} avatar={"https://source.unsplash.com/_7LbC5J-jw4/600x600"} lastMessage={"Pick me at 9:00 Am"} onClick={() => setShowMessages(true)} />
                    <UserCHatItem name={'Luis1994'} avatar={"https://source.unsplash.com/_7LbC5J-jw4/600x600"} lastMessage={"Pick me at 9:00 Am"} onClick={() => setShowMessages(true)}/>
                    <UserCHatItem name={'Luis1994'} avatar={"https://source.unsplash.com/_7LbC5J-jw4/600x600"} lastMessage={"Pick me at 9:00 Am"} onClick={() => setShowMessages(true)}/>
                    <UserCHatItem name={'Luis1994'} avatar={"https://source.unsplash.com/_7LbC5J-jw4/600x600"} lastMessage={"Pick me at 9:00 Am"} onClick={() => setShowMessages(true)}/>
                    <UserCHatItem name={'Luis1994'} avatar={"https://source.unsplash.com/_7LbC5J-jw4/600x600"} lastMessage={"Pick me at 9:00 Am"} onClick={() => setShowMessages(true)}/>
                </div>
                {showMessages && (
                    <div className="w-full px-5 flex flex-col justify-between">
                        <div className="flex flex-col mt-5">
                            <div className="flex justify-end mb-4">
                                <div
                                    className="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
                                >
                                    Welcome to group everyone !
                                </div>
                                <img
                                    src="https://source.unsplash.com/vpOeXr5wmR4/600x600"
                                    className="object-cover h-8 w-8 rounded-full"
                                    alt=""
                                />
                            </div>
                            <div className="flex justify-start mb-4">
                                <img
                                    src="https://source.unsplash.com/vpOeXr5wmR4/600x600"
                                    className="object-cover h-8 w-8 rounded-full"
                                    alt=""
                                />
                                <div
                                    className="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white"
                                >
                                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
                                    at praesentium, aut ullam delectus odio error sit rem. Architecto
                                    nulla doloribus laborum illo rem enim dolor odio saepe,
                                    consequatur quas?
                                </div>
                            </div>
                            <div className="flex justify-end mb-4">
                                <div>
                                    <div
                                        className="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
                                    >
                                        Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                                        Magnam, repudiandae.
                                    </div>

                                    <div
                                        className="mt-4 mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
                                    >
                                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                        Debitis, reiciendis!
                                    </div>
                                </div>
                                <img
                                    src="https://source.unsplash.com/vpOeXr5wmR4/600x600"
                                    className="object-cover h-8 w-8 rounded-full"
                                    alt=""
                                />
                            </div>
                            <div className="flex justify-start mb-4">
                                <img
                                    src="https://source.unsplash.com/vpOeXr5wmR4/600x600"
                                    className="object-cover h-8 w-8 rounded-full"
                                    alt=""
                                />
                                <div
                                    className="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white"
                                >
                                    happy holiday guys!
                                </div>
                            </div>
                        </div>
                        <div className="py-5">
                            <input
                                className="w-full bg-gray-300 py-5 px-3 rounded-xl"
                                type="text"
                                placeholder="type your message here..."
                            />
                        </div>
                    </div>
                )}
            </div>
            {show && <ProfilModal setShow={setShow} />}
        </div>
    );
}