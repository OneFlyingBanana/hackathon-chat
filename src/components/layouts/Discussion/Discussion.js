

export default function Discussion({myDid}){

    
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('----------------------- send')
    // if (!noteValue.trim()) {
    //   setErrorMessage('Please type a message before sending.');
    //   return;
    // }

    // const ding = constructDing();
    // const record = await writeToDwn(ding);
    // const { status } = await sendRecord(record);

    // console.log("Send record status", status);
  
    // await fetchDings(web5, myDid);
    // setNoteValue("");
  };
    return (
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
        <form onSubmit={handleSubmit} className="py-5">
            <input
                className="w-full bg-gray-300 py-5 px-3 rounded-xl"
                type="text"
                placeholder="type your message here..."
                
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