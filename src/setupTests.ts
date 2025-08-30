/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder needed by jsdom
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}