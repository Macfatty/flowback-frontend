import { writable } from 'svelte/store';
import { type Message1 } from './interfaces';
import { env } from '$env/dynamic/public';
import { previewStore } from './functions';
export const messageStore = writable<Message1 | null>(null);

const createSocket = (userId: number) => {
	const token = localStorage.getItem('token');
	// If logged out, don't create socket
	if (!token) return;

	const link = `${env.PUBLIC_WEBSOCKET_API}/chat/ws?token=${token}`;
	const socket = new WebSocket(link);

	socket.onopen = () => {
		console.log('[open] Connection established');
	};

	socket.onmessage = (event) => {
		const parsedMessage = JSON.parse(event.data);
		if (parsedMessage?.user?.id !== userId) {
			messageStore.set(parsedMessage);
		}

		previewStore.update((previews) => {
			console.log(previews, parsedMessage, "STUFF");
			
			if (!previews.find((p) => p.channel_id === parsedMessage.channel_id)) {

				return [...previews, {
					channel_id: parsedMessage.channel_id,
					channel_title: parsedMessage.channel_origin_name === "user" ? parsedMessage.user.username : parsedMessage.channel_title,
					id: parsedMessage.channel_id,
					timestamp: parsedMessage.timestamp,
					recent_message: {
						channel_id: parsedMessage.channel_id,
						channel_origin_name: parsedMessage.channel_origin_name,
						channel_title: parsedMessage.channel_title,
						message: parsedMessage.message,
						timestamp: parsedMessage.timestamp,
						notified: true
					},
					participants: parsedMessage.participants
				}];

			}
			else return previews
		}
		)

	};

	socket.onclose = (event) => {
		if (event.wasClean) {
			console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			console.warn('[close] Connection died');
		}
	};

	socket.onerror = (error) => {
		console.error(`[error] ${error}`);
	};

	return socket;
};

const sendMessage = async (
	socket: WebSocket,
	channel_id: number,
	message: string,
	topic_id: number,
	attachments_id: number | null = null,
	parent_id: number | null = null
) => {
	console.log('at the place');

	if (socket.readyState !== WebSocket.OPEN || !message.trim()) return false;

	try {
		await socket.send(
			JSON.stringify({
				channel_id,
				message,
				// topic_id,
				// attachments_id,
				// parent_id,
				method: 'message_create'
			})
		);
		return true;
	} catch {
		return false;
	}
};

export default { createSocket, subscribe: messageStore.subscribe, sendMessage };