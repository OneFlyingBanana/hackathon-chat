export const constructDing = (message, myDid, recipientDid) => {
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

export const writeToDwn = async (ding, web5, correspondantDID) => {
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

const sendRecord = async (record, recipientDid) => {
    return await record.send(recipientDid);
};

export const sendMessage = async (message, myDid, recipientDid, web5) => {
    // console.log("message sent :",message);
    if (message === "" || message === undefined) return;
    const ding = constructDing(message, myDid, recipientDid);
    const record = await writeToDwn(ding, web5, recipientDid);
    const { status } = await sendRecord(record, recipientDid);
    return status;
};


export const fetchSentMessages = async (web5) => {

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


  export const fetchReceivedMessages = async (web5, did) => {
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