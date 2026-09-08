import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import { Driver } from '../drivers/driver.model.js';
import { Corridor } from '../corridors/corridor.model.js';
import { EmergencyAlert } from '../emergency-alerts/emergencyAlert.model.js';
import { CopilotConversation } from './copilotConversation.model.js';
import { trustedOp } from '../../utils/trustedQuery.js';

async function groundContext() {
  const [driversSilent, topRisk, openAlerts] = await Promise.all([
    Driver.find({
      isDeleted: false,
      lastPingAt: trustedOp({
        $lt: new Date(Date.now() - env.LOCATION_STALE_THRESHOLD_MINUTES * 60 * 1000),
      }),
    })
      .select('_id status lastPingAt')
      .limit(10),
    Corridor.find({ isDeleted: false }).sort({ riskScore: -1 }).limit(5).select('name highwayRef riskScore'),
    EmergencyAlert.find({ isDeleted: false, status: trustedOp({ $ne: 'resolved' }) })
      .select('type severity status')
      .limit(5),
  ]);
  return { driversSilent, topRisk, openAlerts };
}

export async function message(req: Request, res: Response) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AppError(503, 'COPILOT_UNAVAILABLE', 'Copilot is not configured');
  }
  const content = String(req.body.content ?? '').slice(0, 4000);
  let convo = req.body.conversationId
    ? await CopilotConversation.findOne({ _id: req.body.conversationId, userId: req.user!.id })
    : await CopilotConversation.create({ userId: req.user!.id, messages: [], contextSnapshotIds: [] });
  if (!convo) convo = await CopilotConversation.create({ userId: req.user!.id, messages: [], contextSnapshotIds: [] });
  convo.messages.push({ role: 'user', content, createdAt: new Date() });
  const ctx = await groundContext();
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system:
        'You are NETRA Copilot. Answer only from the provided platform snapshot. Never invent live GPS. Do not execute writes.',
      messages: [
        {
          role: 'user',
          content: `Snapshot: ${JSON.stringify(ctx)}\n\nQuestion: ${content}`,
        },
      ],
    }),
  });
  if (!anthropicRes.ok) {
    throw new AppError(503, 'COPILOT_UNAVAILABLE', 'Copilot provider error');
  }
  const json = (await anthropicRes.json()) as { content?: { text?: string }[] };
  const reply = json.content?.[0]?.text ?? 'No response';
  convo.messages.push({ role: 'assistant', content: reply, createdAt: new Date() });
  await convo.save();
  res.json({ success: true, data: { conversationId: convo._id, reply } });
}

export async function getConversation(req: Request, res: Response) {
  const convo = await CopilotConversation.findOne({ _id: req.params.id, userId: req.user!.id });
  res.json({ success: true, data: convo });
}
