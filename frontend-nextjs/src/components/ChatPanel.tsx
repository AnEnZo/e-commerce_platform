import React, { useEffect, useRef, useState } from 'react';

type Contact = {
  id: string;
  name: string;
  type: 'user' | 'shop';
  avatar?: string;
  unread?: number;
};

type Msg = { id: string; from: 'user' | 'agent' | 'me'; text: string; time: number };

export default function ChatPanel({
  chatOpen,
  setChatOpen,
}: {
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messagesByContact, setMessagesByContact] = useState<Record<string, Msg[]>>({});
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // init demo contacts + messages
  useEffect(() => {
    const demoContacts: Contact[] = [
      { id: 'shop-1', name: 'Shop247 - Hỗ trợ', type: 'shop', avatar: '🏬', unread: 2 },
      { id: 'user-1', name: 'An', type: 'user', avatar: '🧑‍💼' },
      { id: 'user-2', name: 'Bình', type: 'user', avatar: '🧑' },
    ];

    const demoMessages: Record<string, Msg[]> = {
      'shop-1': [
        { id: 'm1', from: 'agent', text: 'Chào bạn! Shop247 có thể giúp gì?', time: Date.now() - 1000 * 60 * 60 },
        { id: 'm2', from: 'me', text: 'Mình muốn hỏi về đơn hàng #123', time: Date.now() - 1000 * 60 * 30 },
      ],
      'user-1': [{ id: 'u1', from: 'user', text: 'Bạn có hàng này không?', time: Date.now() - 1000 * 60 * 60 * 24 }],
      'user-2': [],
    };

    setContacts(demoContacts);
    setMessagesByContact(demoMessages);
  }, []);

  // focus input when opened / contact changed
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [chatOpen, selectedContact]);

  // escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && chatOpen) setChatOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatOpen, setChatOpen]);

  // close chat if clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!chatOpen) return;
      if (!panelRef.current) return;
      if (e.target instanceof Node && !panelRef.current.contains(e.target)) {
        setChatOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [chatOpen, setChatOpen]);

  const sendMessageTo = (contactId: string, text?: string) => {
    const trimmed = (text ?? draft).trim();
    if (!trimmed || !contactId) return;
    const id = String(Date.now()) + Math.random().toString(16).slice(2, 8);
    const msg: Msg = { id, from: 'me', text: trimmed, time: Date.now() };
    setMessagesByContact((prev) => {
      const copy = { ...prev };
      copy[contactId] = [...(copy[contactId] || []), msg];
      return copy;
    });
    setDraft('');

    // fake auto-reply
    setTimeout(() => {
      const contact = contacts.find((c) => c.id === contactId);
      const reply: Msg = {
        id: 'r-' + id,
        from: contact?.type === 'shop' ? 'agent' : 'user',
        text: contact?.type === 'shop' ? 'Cảm ơn bạn! Chúng tôi sẽ kiểm tra và phản hồi.' : 'Ok, mình đã nhận được tin nhắn của bạn.',
        time: Date.now(),
      };
      setMessagesByContact((prev) => {
        const copy = { ...prev };
        copy[contactId] = [...(copy[contactId] || []), reply];
        return copy;
      });
    }, 700);
  };

  const filteredContacts = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const selectedMsgs = selectedContact ? messagesByContact[selectedContact] || [] : [];

  return (
    <div
      ref={panelRef}
      className={`fixed bottom-6 right-6 z-50 transition-all ${
        chatOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <div className="w-[720px] h-[560px] flex bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Left: contacts/search */}
        <div className="w-44 bg-gray-50 border-r border-gray-100 flex flex-col h-full">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Tin nhắn</div>
              <button onClick={() => setContacts((c) => [...c])} aria-label="Làm mới">⟳</button>
            </div>
            <div className="mt-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full px-2 py-1 rounded-md border border-gray-200 bg-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-1">
              {filteredContacts.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedContact(c.id);
                      // clear unread for demo
                      setContacts((prev) => prev.map((p) => (p.id === c.id ? { ...p, unread: 0 } : p)));
                    }}
                    className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 ${
                      selectedContact === c.id ? 'bg-white' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border">{c.avatar}</div>
                    <div className="flex-1 text-sm">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {(messagesByContact[c.id]?.slice(-1)[0]?.text) || (c.type === 'shop' ? 'Hỗ trợ từ Shop' : 'Nhắn tin')}
                      </div>
                    </div>
                    {c.unread ? (
                      <div className="text-xs bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">{c.unread}</div>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: conversation */}
        <div className="flex-1 flex flex-col h-full">
          <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">💬</div>
              <div>
                <div className="font-semibold">{selectedContact ? contacts.find((c) => c.id === selectedContact)?.name : 'Chọn cuộc trò chuyện'}</div>
                <div className="text-xs opacity-90">{selectedContact ? (contacts.find((c) => c.id === selectedContact)?.type === 'shop' ? 'Shop hỗ trợ' : 'Người dùng') : 'Chọn bên để bắt đầu'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setChatOpen(false)} aria-label="Đóng" className="text-black hover:opacity-90">✖</button>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto bg-gray-50">
            {selectedContact ? (
              selectedMsgs.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có tin nhắn với {contacts.find((c) => c.id === selectedContact)?.name}. Gửi tin nhắn để bắt đầu.</div>
              ) : (
                <ul className="space-y-3">
                  {selectedMsgs.map((m) => (
                    <li key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${m.from === 'me' ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 border'} px-3 py-2 rounded-lg max-w-[80%] shadow-sm`}>{m.text}</div>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Chọn người hoặc Shop ở cột bên trái để bắt đầu nhắn tin</div>
            )}
          </div>

          <div className="p-3 border-t bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedContact) sendMessageTo(selectedContact);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
                placeholder={selectedContact ? 'Nhập tin nhắn...' : 'Chọn cuộc trò chuyện để nhắn...'}
                disabled={!selectedContact}
                className="min-h-[36px] max-h-24 resize-none px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-300 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (selectedContact) sendMessageTo(selectedContact);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!selectedContact || !draft.trim()}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
