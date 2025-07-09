import React, { useEffect, useState } from 'react';
import 'amazon-connect-streams';

const CCP_URL = 'https://ccaas-coe-sandbox.my.connect.aws/ccp-v2';

interface MessageItem {
  id: string;
  original: string;
  translated: string;
}

interface ChatMessage {
  id: string;
  content: string;
  participantRole: string;
}

// Simulated translation function — just passes the original text
const fakeTranslate = async (text: string) => {
  console.log('[fakeTranslate] Skipping API. Using raw text:', text);
  return text; // no translation
};

const TranslationWidget: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [reply, setReply] = useState('');
  const [activeContact, setActiveContact] = useState<any>(null);

  useEffect(() => {
    console.log('[useEffect] Initializing CCP...');
    window.connect.core.initCCP(document.getElementById('ccpContainer')!, {
      ccpUrl: CCP_URL,
      loginPopup: true,
      region: 'us-east-1',
      softphone: { allowFramedSoftphone: true },
    });

    window.connect.contact((contact: any) => {
      console.log('[connect.contact] New contact detected:', contact.getType());

      if (contact.getType() === 'chat') {
        setActiveContact(contact);

        contact.onMessage(async (msg: ChatMessage) => {
          console.log('[onMessage] Message received from customer:', msg);

          if (msg.participantRole === 'CUSTOMER') {
            const sameText = await fakeTranslate(msg.content); // just returns same message
            setMessages((prev) => [
              ...prev,
              { id: msg.id, original: msg.content, translated: sameText },
            ]);
          }
        });
      }
    });
  }, []);

  const sendReply = async () => {
    if (!reply.trim()) {
      console.warn('[sendReply] Empty reply. Skipping.');
      return;
    }

    if (!activeContact) {
      console.warn('[sendReply] No active contact. Cannot send message.');
      return;
    }

    console.log('[sendReply] Sending reply to customer:', reply);

    try {
      await activeContact.sendMessage({
        content: reply,
        contentType: 'text/plain',
      });
      console.log('[sendReply] Message sent successfully:', reply);
    } catch (err) {
      console.error('[sendReply] Failed to send message:', err);
    }

    setReply('');
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '10px' }}>
      <div id="ccpContainer" style={{ height: '400px', marginBottom: '20px' }} />
      <h3>Live Chat (Pass-through Mode)</h3>

      <div
        style={{
          maxHeight: '250px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: '12px' }}>
            <div><strong>Customer:</strong> {m.original}</div>
            <div><strong>Translated (Raw):</strong> {m.translated}</div>
          </div>
        ))}
      </div>

      <textarea
        rows={2}
        style={{ width: '100%', marginTop: '10px' }}
        placeholder="Type your reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />

      <button onClick={sendReply} style={{ marginTop: '6px' }}>
        Send
      </button>
    </div>
  );
};

export default TranslationWidget;
