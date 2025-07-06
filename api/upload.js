import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from 'formidable';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { firebaseConfig } from '../../firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send("Método não permitido");
    return;
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      res.status(500).send("Erro ao processar upload");
      return;
    }

    try {
      const filePath = files.file[0].filepath;
      const content = await fs.readFile(filePath, 'utf-8');

      // Aqui seria feita a leitura da planilha CSV com tratamento

      res.status(200).send("Upload concluído com sucesso");
    } catch (e) {
      res.status(500).send("Erro interno no servidor");
    }
  });
}
