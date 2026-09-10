'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { client } from '@/lib/api/client';

export default function CopilotPage() {
  const [input, setInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['copilot-conversations'],
    queryFn: async () => {
      const res = await client.get('/copilot/conversations/general');
      return res.data.data;
    },
  });

  const send = useMutation({
    mutationFn: async (content: string) => {
      const res = await client.post('/copilot/message', { content });
      return res.data;
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await send.mutateAsync(input);
      setInput('');
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">NETRA Copilot</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {data?.messages?.map((m: any, i: number) => (
            <div key={i} className={`p-3 rounded-lg max-w-lg ${m.role === 'user' ? 'bg-primary text-white ml-auto' : 'bg-surface text-primary'}`}>
              {m.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask NETRA anything..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <button onClick={handleSend} disabled={send.isPending} className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
