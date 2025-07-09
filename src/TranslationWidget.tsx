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
    console.log('[callTranslate] Called with text:', text);

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    console.log('[callTranslate] Response status:', resp.status);

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const data = await resp.json();
    console.log('[callTranslate] API returned:', data);

    return data.translatedText;
  } catch (error) {
    console.error('[callTranslate] Error:', error);
    return '[Translation Failed]';
  }
};

const TranslationWidget: React.FC = () => {
  const [activeContact, setActiveContact] = useState<any>(null);

  useEffect(() => {
    console.log('[useEffect] Initializing CCP...');
    window.connect.core.initCCP(document.getElementById('ccpContainer')!, {
      ccpUrl: CCP_URL,
      loginPopup: true,
    });

    window.connect.contact((contact: any) => {
      console.log('[connect.contact] New contact detected:', contact.getType());

      if (contact.getType() === 'chat') {
        setActiveContact(contact);

        contact.onMessage(async (msg: ChatMessage) => {
          console.log('[onMessage] Message received:', msg);

          if (msg.participantRole === 'CUSTOMER') {
            const translated = await callTranslate(msg.content);
            setMessages((prev) => [
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

    console.log('[sendReply] Sending reply:', reply);

    const translated = await callTranslate(reply);

    try {
      await activeContact.sendMessage({
        content: translated,
        contentType: 'text/plain',
      });
      console.log('[sendReply] Message sent successfully:', translated);
    } catch (err) {
      console.error('[sendReply] Failed to send message:', err);
    }

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
