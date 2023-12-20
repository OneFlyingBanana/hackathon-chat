export const constructDingUtil = (myDid,message,correspondantDID) => {
    const ding = {
        sender: myDid,
        note: message,
        recipient: correspondantDID,
        timestampWritten: `${new Date().getTime()}`,
    };
    return ding;
};