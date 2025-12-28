import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000';
const VISITOR_COUNT = process.argv[2] ? parseInt(process.argv[2]) : 3;

console.log(`🚀 Starting simulation for ${VISITOR_COUNT} visitors...`);

const startVisitor = async (id) => {
    const vUuid = 'v_sim_' + Math.random().toString(36).substr(2, 9);
    console.log(`[Visitor ${id}] Initializing with UUID: ${vUuid}`);

    try {
        // 1. Init Visitor
        const res = await fetch(`${API_URL}/api/visitor/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ v_uuid: vUuid })
        });
        const data = await res.json();

        if (!data.success) {
            console.error(`[Visitor ${id}] Init failed:`, data);
            return;
        }

        const token = data.token;
        // console.log(`[Visitor ${id}] Got token`);

        // 2. Connect Socket
        const socket = io(API_URL, {
            auth: { token },
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log(`[Visitor ${id}] ✅ Socket connected`);
            
            // 3. Join Chat
            socket.emit('join_chat', {}, (response) => {
                if (response && response.status === 'ok') {
                    console.log(`[Visitor ${id}] Joined conversation ${response.conversationId}`);
                    
                    // 4. Send Initial Message
                    const msg = `Hello from Visitor ${id}! (Simulated)`;
                    socket.emit('send_msg', {
                        content: { type: 'text', data: msg }
                    });
                    console.log(`[Visitor ${id}] Sent: "${msg}"`);

                    // 5. Send another message after delay
                    setTimeout(() => {
                        const followUp = `Is anyone there? (Visitor ${id})`;
                        socket.emit('send_msg', {
                            content: { type: 'text', data: followUp }
                        });
                        console.log(`[Visitor ${id}] Sent: "${followUp}"`);
                    }, 2000 + Math.random() * 3000);

                } else {
                    console.error(`[Visitor ${id}] Join chat failed`, response);
                }
            });
        });

        socket.on('receive_msg', (msg) => {
            if (msg.sender.role === 'agent') {
                console.log(`[Visitor ${id}] 📩 Received from Agent: "${msg.content.data}"`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Visitor ${id}] ❌ Disconnected`);
        });

    } catch (err) {
        console.error(`[Visitor ${id}] Error:`, err);
    }
};

// Start visitors with slight delay between them
for (let i = 1; i <= VISITOR_COUNT; i++) {
    setTimeout(() => startVisitor(i), i * 500);
}
