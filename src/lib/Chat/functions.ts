import { fetchRequest } from "$lib/FetchRequest";
import { writable } from 'svelte/store';

export const updateUserData = async (selectedChat: number, timestamp?: Date | null, closed?: Date | null) => {
    let data: any = {
        channel_id: selectedChat
    };

    if (timestamp) data.timestamp = timestamp;
    if (closed) data.closed = closed;

    const { res, json } = await fetchRequest('POST', `chat/message/channel/userdata/update`, data);
};

export const getUserChannelId = async (userId: number) => {
    const { json, res } = await fetchRequest('GET', `user/chat?target_user_ids=${userId}`);

    if (!res.ok || json.length === 0) {
        return;
    }
    return json.id;
};

// Store that holds whether the chat is open or closed
export const chatOpenStore = writable(false);

// Store to hold the chat_id or message_id of the chatter being talked to.
export const chatPartnerStore = writable(0);
