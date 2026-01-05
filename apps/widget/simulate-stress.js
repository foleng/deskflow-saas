
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000';
const VISITOR_COUNT = process.argv[2] ? parseInt(process.argv[2]) : 10;

console.log(`🚀 Starting STRESS simulation for ${VISITOR_COUNT} visitors...`);

const visitors = [];

const startVisitor = async (id) => {
    const vUuid = 'v_stress_' + Math.random().toString(36).substr(2, 9);
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

        // 2. Connect Socket
        const socket = io(API_URL, {
            auth: { token },
            transports: ['websocket']
        });

        const visitor = { id, vUuid, socket, active: true };
        visitors.push(visitor);

        socket.on('connect', () => {
            console.log(`[Visitor ${id}] ✅ Socket connected`);
            
            // 3. Join Chat
            socket.emit('join_chat', {}, (response) => {
                if (response && response.status === 'ok') {
                    console.log(`[Visitor ${id}] Joined conversation ${response.conversationId} (Agent ID: ${response.agentId})`);
                    
                    visitor.conversationId = response.conversationId;

                    // 4. Send Initial Message
                    // Pass conversationId explicitly to ensure it works immediately
                    sendMessage(visitor, `Hello! I am visitor ${id}`, response.conversationId);

                    // 5. Start Random Message Loop
                    startRandomMessaging(visitor);

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
            visitor.active = false;
        });

    } catch (err) {
        console.error(`[Visitor ${id}] Error:`, err);
    }
};

const sendMessage = (visitor, text) => {
    if (!visitor.active || !visitor.conversationId) {
        console.warn(`[Visitor ${visitor.id}] Cannot send message: active=${visitor.active}, convId=${visitor.conversationId}`);
        return;
    }
    
    visitor.socket.emit('send_msg', {
        conversationId: visitor.conversationId,
        content: text,
        contentType: 'text',
        meta: {}
    }, (response) => {
        if (response && response.status === 'ok') {
            console.log(`[Visitor ${visitor.id}] Sent (ACK): "${text}"`);
        } else {
            console.error(`[Visitor ${visitor.id}] Send Failed:`, response);
        }
    });
};

const startRandomMessaging = (visitor) => {
    const loop = () => {
        if (!visitor.active) return;
        
        // Random delay between 5s and 15s
        const delay = 5000 + Math.random() * 10000;
        
        setTimeout(() => {
            const msg = `Random msg from V${visitor.id} at ${new Date().toLocaleTimeString()}`;
            sendMessage(visitor, msg);
            loop(); // Schedule next message
        }, delay);
    };
    loop();
};

// Start visitors with delay to prevent flooding init endpoint
for (let i = 1; i <= VISITOR_COUNT; i++) {
    setTimeout(() => startVisitor(i), i * 300);
}

// Handle exit
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping simulation...');
    visitors.forEach(v => {
        v.active = false;
        v.socket.disconnect();
    });
    process.exit();
});
