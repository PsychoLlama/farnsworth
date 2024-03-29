import { encode, decode } from '@msgpack/msgpack';
import Logger from '../../utils/logger';
import AppEvents, { AppEvent } from '../app-events';

Object.assign(globalThis, { encode, decode });

const MIME_TYPE = 'application/msgpack';

const logger = new Logger('DataChannelMessenger');

/**
 * A high-level interface over WebRTC data channels. It speaks MessagePack and
 * supports higher-level protocols, such as request/response and has error
 * handling (TODO).
 *
 * Except for WebRTC signaling, all application messages are sent through data
 * channels.
 *
 * Terminology:
 *
 *   Message - An application-defined message sent between clients
 *   Envelope - Packaging around a Message to determine how to handle it
 *   Packet - A binary serialized envelope
 *
 * @see https://msgpack.org/
 */
export default class DataChannelMessenger {
  private channel: RTCDataChannel;
  private remoteId: string;
  private appEvents: AppEvents;
  private messageQueue: Array<ArrayBuffer> = [];
  private closedLocally = false;

  constructor({ pc, remoteId }: Config) {
    this.remoteId = remoteId;
    this.channel = pc.createDataChannel('app', {
      protocol: MIME_TYPE,
      negotiated: true,
      id: 0,
    });

    // Prefer messages in `ArrayBuffer` instead of `Blob`.
    this.channel.binaryType = 'arraybuffer';
    this.channel.onmessage = this.processMessage;

    this.channel.onopen = this.signalConnectionOpen;
    this.channel.onclose = this.signalConnectionClosed;
    this.appEvents = new AppEvents({ remoteId });
  }

  /**
   * Permanently closes the data channel. Does not issue a 'close' event
   * because the caller is already aware.
   */
  close() {
    this.closedLocally = true;
    this.channel.close();
  }

  /** Send an arbitrary event object to the other client. */
  sendEvent(event: Message) {
    logger.debug(`Sending event (${event.type}):`, event);

    const envelope: Envelope = {
      type: MessageClass.Notification,
      data: event,
    };

    const packet = encode(envelope);

    this.queueOutboundPacket(packet);
  }

  // Buffers messages in a queue until the socket opens. Note: if the socket
  // closes, all messages are lost. There is currently no way to transfer
  // messages to a new data channel.
  private queueOutboundPacket(packet: Uint8Array) {
    if (this.channel.readyState === 'open') {
      this.channel.send(packet);
    } else {
      logger.debug(
        `Queuing packet while socket opens (readyState=${this.channel.readyState}).`,
      );

      this.messageQueue.push(packet);
    }
  }

  private drainMessageQueue = () => {
    if (this.messageQueue.length) {
      logger.debug('Channel is open. Draining message queue.');
    }

    const messages = this.messageQueue.splice(0);
    messages.forEach((packet) => this.channel.send(packet));
  };

  private processMessage = async ({
    data,
  }: MessageEvent<ArrayBuffer | string>) => {
    if (typeof data === 'string') {
      // All messages should be binary, encoded via MsgPack.
      return logger.error(`Inbound message was a string: "${data}"`);
    }

    const envelope = this.parseIntoEnvelope(data);
    if (!envelope) return;

    logger.debug(`Received message (${envelope.data.type}):`, envelope.data);
    await this.appEvents.handleEvent(envelope.data as AppEvent);
  };

  private parseIntoEnvelope = (data: ArrayBuffer): null | Envelope => {
    try {
      // Validate the packet.
      const envelope: unknown = decode(data);

      // Validate the envelope.
      if (
        !envelope ||
        typeof envelope !== 'object' ||
        !MessageClass.hasOwnProperty(Object(envelope).type)
      ) {
        logger.error('Received malformed envelope:', envelope);
        return null;
      }

      const payload: unknown = Object(envelope).data;

      // Validate the message.
      if (
        !payload ||
        typeof payload !== 'object' ||
        typeof Object(payload).type !== 'string'
      ) {
        logger.error('Received malformed payload:', envelope);
        return null;
      }

      return envelope as Envelope;
    } catch (error) {
      logger.error('Could not parse message:', error);
      return null;
    }
  };

  signalConnectionOpen = async () => {
    const { default: sdk } = await import('../../utils/sdk');
    sdk.connections.markConnected(this.remoteId);
    this.drainMessageQueue();
  };

  signalConnectionClosed = async () => {
    if (this.closedLocally) return;

    const { default: sdk } = await import('../../utils/sdk');
    sdk.connections.close(this.remoteId);
  };
}

interface Config {
  pc: RTCPeerConnection;
  remoteId: string;
}

/**
 * Inbound messages may have different 'message modes' which determine how the
 * message is processed.
 */
enum MessageClass {
  /** Fire and forget. No response necessary. */
  Notification = 0,

  // ... reserved for the future ...
}

// All messages, regardless of type, should follow this basic structure. This
// helps logging and obserability.
export interface Message {
  type: string;
  [key: string]: unknown;
}

interface Envelope {
  type: MessageClass;
  data: Message;
}
