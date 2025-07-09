import React, { useEffect, useState } from 'react';
import 'amazon-connect-streams';

const API_URL = 'https://flv38gpj2c.execute-api.us-east-1.amazonaws.com/test/translate';
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

const callTranslate = async (text: string) => {
  try {
    console.log('[callTranslate] Translating text:', text);

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    console.log('[callTranslate] Response status:', resp.status);

    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

    const data = await resp.json();
    console.log('[callTranslate] Translated text:', data.translatedText);
    return data.translatedText;
  } catch (error) {
    console.error('[callTranslate] Error translating message:', error);
    return '[Translation failed]';
  }
};

const TranslationWidget: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
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
      console.log('[contact] New contact detected:', contact.getType());

      if (contact.getType() === 'chat') {
        setActiveContact(contact);

        contact.onMessage(async (msg: ChatMessage) => {
          console.log('[onMessage] New message received:', msg);

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

  return (
    <div style={{ fontFamily: 'Arial', padding: '10px' }}>
      {/* Embedded CCP panel */}
      <div id="ccpContainer" style={{ height: '400px', marginBottom: '20px' }} />

      <h3>Translation Chat</h3>

      {/* Message Viewer */}
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
            <div><strong>Translated:</strong> {m.translated}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationWidget;
