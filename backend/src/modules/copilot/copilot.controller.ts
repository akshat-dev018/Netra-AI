import type { Request, Response } from 'express';
import type { QueryFilter } from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import { Driver, type DriverDoc } from '../drivers/driver.model.js';
import { Corridor, type CorridorDoc } from '../corridors/corridor.model.js';
import { EmergencyAlert, type EmergencyAlertDoc } from '../emergency-alerts/emergencyAlert.model.js';
import { Shipment, type ShipmentDoc } from '../shipments/shipment.model.js';
import { CopilotConversation } from './copilotConversation.model.js';
import { trustedOp } from '../../utils/trustedQuery.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

function redactSecrets(text: string) {
  return text
    .replace(/key=[^&\s'"]+/gi, 'key=[redacted]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/AIza[0-9A-Za-z_-]+/g, '[redacted]')
    .replace(/AQ\.[0-9A-Za-z_-]+/g, '[redacted]');
}

async function groundContext() {
  const [driversSilent, topRisk, openAlerts, delayedShipments] = await Promise.all([
    Driver.find({
      isDeleted: false,
      lastPingAt: trustedOp({
        $lt: new Date(Date.now() - env.LOCATION_STALE_THRESHOLD_MINUTES * 60 * 1000),
      } satisfies QueryFilter<DriverDoc>),
    })
      .select('_id status lastPingAt')
      .limit(10)
      .lean(),
    Corridor.find({ isDeleted: false } satisfies QueryFilter<CorridorDoc>)
      .sort({ riskScore: -1 })
      .limit(5)
      .select('name highwayRef riskScore')
      .lean(),
    EmergencyAlert.find({
      isDeleted: false,
      status: trustedOp({ $ne: 'resolved' }),
    } satisfies QueryFilter<EmergencyAlertDoc>)
      .select('type severity status')
      .limit(5)
      .lean(),
    Shipment.find({
      isDeleted: false,
      status: trustedOp({ $in: ['delayed', 'in_transit'] }),
    } satisfies QueryFilter<ShipmentDoc>)
      .select('reference origin destination status riskScore priority')
      .limit(8)
      .lean(),
  ]);
  return { driversSilent, topRisk, openAlerts, delayedShipments };
}

export async function message(req: Request, res: Response) {
  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(503, 'COPILOT_UNAVAILABLE', 'Gemini Copilot API key is not configured');
  }

  const content = String(req.body.content ?? '').slice(0, 4000);
  if (!content.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Message content is required');
  }

  let convo = req.body.conversationId
    ? await CopilotConversation.findOne({ _id: req.body.conversationId, userId: req.user!.id })
    : await CopilotConversation.create({ userId: req.user!.id, messages: [], contextSnapshotIds: [] });
  if (!convo) {
    convo = await CopilotConversation.create({ userId: req.user!.id, messages: [], contextSnapshotIds: [] });
  }
  convo.messages.push({ role: 'user', content, createdAt: new Date() });

  const ctx = await groundContext();
  const history = convo.messages
    .slice(-12)
    .map((m) => `${m.role === 'assistant' ? 'Copilot' : 'Operator'}: ${m.content}`)
    .join('\n');

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `[Platform live snapshot]\n${JSON.stringify(ctx)}\n\n[Recent thread]\n${history}\n\n[Operator question]\n${content}`,
      config: {
        systemInstruction:
          'You are NETRA Copilot for an Indian national freight and emergency control tower. Answer from the platform snapshot when it is relevant. Do not invent live GPS coordinates. Be concise and operational. Format key findings with clean bullet points and markdown.',
      },
    });
    const reply = (result.text ?? '').trim();
    if (!reply) {
      throw new AppError(502, 'COPILOT_PROVIDER_ERROR', 'Gemini returned an empty response');
    }

    convo.messages.push({ role: 'assistant', content: reply, createdAt: new Date() });
    await convo.save();

    res.json({ success: true, data: { conversationId: convo._id, reply } });
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    const raw = err instanceof Error ? err.message : 'Failed to generate Copilot response';
    throw new AppError(502, 'COPILOT_PROVIDER_ERROR', `Gemini API error: ${redactSecrets(raw)}`);
  }
}

export async function getConversation(req: Request, res: Response) {
  const convo = await CopilotConversation.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!convo) {
    throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  }
  res.json({ success: true, data: convo });
}
