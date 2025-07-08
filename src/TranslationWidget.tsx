import React, { useEffect, useState } from 'react';
import 'amazon-connect-streams';

const API_URL = 'https://flv38gpj2c.execute-api.us-east-1.amazonaws.com/test/translate';
const CCP_URL = 'https://ccaas-coe-sandbox.my.connect.aws'; 

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

const callTranslate = async (text: string) => {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  const data = await resp.json();
  return data.translatedText;
};

const TranslationWidget: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [reply, setReply] = useState('');
  const [activeContact, setActiveContact] = useState<any>(null);

  useEffect(() => {
    window.connect.core.initCCP(document.getElementById('ccpContainer')!, {
      ccpUrl: CCP_URL,
      loginPopup: true,
      region: 'us-east-1',
      softphone: { allowFramedSoftphone: true },
    });

    window.connect.contact((contact: any) => {
      if (contact.getType() === 'chat') {
        setActiveContact(contact);

        contact.onMessage(async (msg: ChatMessage) => {
          if (msg.participantRole === 'CUSTOMER') {
            const translated = await callTranslate(msg.content);
            setMessages((prev) => [
              ...prev,
              { id: msg.id, original: msg.content, translated },
            ]);
          }
        });
      }
    });
  }, []);

  const sendReply = async () => {
    if (!reply.trim() || !activeContact) return;

    const translated = await callTranslate(reply);
    activeContact.sendMessage({
      content: translated,
      contentType: 'text/plain',
    });

    setReply('');
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '10px' }}>
      <div id="ccpContainer" style={{ height: '400px', marginBottom: '20px' }} />
      <h3>Translation Chat</h3>
      <div
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '8px',
        }}
      >
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: '10px' }}>
            <div><strong>Customer:</strong> {m.original}</div>
            <div><strong>Translated:</strong> {m.translated}</div>
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
        Send (translated)
      </button>
    </div>
  );
};

export default TranslationWidget;
