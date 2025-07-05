import { readFileSync } from 'fs';

export default function handler(req, res) {
  try {
    const json = readFileSync("/tmp/dados.json", "utf-8");
    res.status(200).json(JSON.parse(json));
  } catch {
    res.status(200).json({});
  }
}