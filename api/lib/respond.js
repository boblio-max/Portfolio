import { json as _json } from './respond.js';

export function json(res, code, body) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = code;
  res.end(JSON.stringify(body));
}

export function err(res, code, message) {
  json(res, code, { error: message });
}
