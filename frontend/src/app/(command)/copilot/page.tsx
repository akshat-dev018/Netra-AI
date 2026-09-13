'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { copilotApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Bot,
  Send,
  User,
  ShieldAlert,
  Route,
  Hospital,
  Zap,
  RefreshCw,
  Activity,
  CheckCircle2,
  Radio,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function CopilotPage() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Greetings Controller. I am **NETRA Freight Copilot**, your autonomous intelligence assistant. I continuously monitor national highway sensors, active driver telematics, and trauma hospital readiness across the Golden Quadrilateral.\n\nHow can I assist your logistics command tower today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await copilotApi.sendMessage({ content: text });
      return res.data.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.reply || data.content || 'Intelligence query processed.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Error communicating with NETRA Gemini Copilot engine. Please verify the Gemini API key configuration.';
      toast.error(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ **Copilot Error**: ${errorMessage}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    const queryText = input;
    setInput('');
    sendMutation.mutate(queryText);
  };

  const promptChips = [
    { label: 'Summarize high-risk corridors', prompt: 'Summarize current high-risk freight corridors and active disruptions.' },
    { label: 'Check NH-44 Bottlenecks', prompt: 'What is the current risk and throughput on NH-44 Delhi–Agra freight corridor?' },
    { label: 'Nearest Trauma Facilities', prompt: 'List nearest Level 1 Trauma Hospitals with active ICU capacity near NCR.' },
    { label: 'Reroute Delayed Shipments', prompt: 'Suggest alternate incident-avoidance routes for delayed shipments.' },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between glass-card p-4 rounded">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-card border border-subtle flex items-center justify-center text-primary shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-main font-sans flex items-center gap-2">
              <span>NETRA Freight Copilot</span>
              <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-cyan-500/20 border border-subtle text-primary font-mono font-semibold uppercase">
                AUTONOMOUS DISPATCH
              </span>
            </h1>
            <p className="text-[11px] text-muted">Autonomous freight reasoning & emergency response assistant</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                content: 'Chat session reset. How can I assist your logistics operations?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="px-3 py-1.5 rounded glass-card text-muted hover:text-main text-xs flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Session</span>
        </button>
      </div>

      {/* Main Grid: Left Chat Area (8 cols), Right Glass Panel Copilot Context (4 cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        {/* Left Side: Chat Container (8 cols) */}
        <div className="lg:col-span-8 glass-card p-4 sm:p-5 rounded flex flex-col justify-between overflow-hidden ">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m) => {
              const isBot = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-2xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                      isBot
                        ? 'bg-cyan-500/20 border border-subtle text-primary shadow-sm'
                        : 'bg-white/10 text-main'
                    }`}
                  >
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`p-4 rounded text-xs leading-relaxed ${
                        isBot
                          ? 'glass-panel text-main shadow-md'
                          : 'btn-primary font-medium text-on-primary'
                      }`}
                    >
                      <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap">
                        {m.content}
                      </div>
                    </div>
                    <div className={`text-[10px] text-muted font-mono ${isBot ? 'text-left' : 'text-right'}`}>
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
            {sendMutation.isPending && (
              <div className="flex items-center gap-2 text-xs text-primary font-mono p-2">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Synthesizing multimodal telematics reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Chips & Input Box */}
          <div className="pt-3 border-t border-subtle space-y-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(chip.prompt);
                  }}
                  className="px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-subtle text-[11px] text-main hover:text-primary shrink-0 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask NETRA Copilot anything (e.g. corridor risk, emergency hospitals, reroutes)..."
                className="glass-input flex-1 px-4 py-3 rounded text-xs text-main placeholder:text-muted focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMutation.isPending}
                className="px-5 py-3 rounded btn-primary text-main font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Glass Panel: Copilot Live Context (4 cols) */}
        <div className="lg:col-span-4 glass-panel-right p-5 rounded flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-subtle flex items-center justify-center text-primary">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-main uppercase tracking-wider">
                    Copilot Context Hub
                  </h2>
                  <p className="text-[10px] text-muted font-mono">LIVE SENSOR TELEMETRY</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Context Cards */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded bg-white/[0.02] border border-subtle space-y-1.5">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                  Active Monitored Arteries
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['NH-44', 'NH-48', 'NH-19', 'NH-27', 'E-Way'].map((corridor) => (
                    <span
                      key={corridor}
                      className="px-2 py-0.5 rounded bg-white/10 text-main font-mono text-[10px]"
                    >
                      {corridor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded bg-white/[0.02] border border-subtle space-y-2">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                  Telemetry Stream Live Feeds
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-main">Live GPS Drivers</span>
                    <span className="font-mono text-primary">1,420 Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-main">Active Disruptions</span>
                    <span className="font-mono text-warning">7 Reported</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-main">Trauma Level 1 Hubs</span>
                    <span className="font-mono text-success">100% Available</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded bg-cyan-500/[0.06] border border-cyan-500/20 space-y-1.5">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                  <Bot className="w-3 h-3" /> Autonomous Dispatch Trigger
                </span>
                <p className="text-[11px] text-main leading-relaxed">
                  Copilot can automatically draft detour manifests and push notifications to driver in-cab devices.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-subtle flex items-center justify-between text-[11px] text-muted">
            <span>Model: NETRA Logistics LLM</span>
            <span className="text-success font-mono">Status: Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
