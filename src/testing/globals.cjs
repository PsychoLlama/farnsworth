const { TextEncoder, TextDecoder } = require('util');
const {
  ReadableStream,
  WritableStream,
  TransformStream,
} = require('stream/web');
const { MessagePort } = require('worker_threads');

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  WritableStream,
  TransformStream,
  MessagePort,
  // File is global in Node 20+ but jsdom may not expose it
  File: global.File ?? require('buffer').File,
});
