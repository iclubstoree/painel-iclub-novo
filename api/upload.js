import formidable from 'formidable';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { firebaseConfig } from '../../firebaseConfig';

export const config = {
  api: {
    bodyParser: false,
  },
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      if (err) {
        res.status(500).json({ error: 'Erro no upload.' });
        return;
      }

      const file = files.file[0];
      const content = fs.readFileSync(file.filepath, 'utf-8');
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ';'
      });

      const resumo = {};

      for (const linha of records) {
        const loja = linha["Loja"];
        const produto = linha["Produto"];
        const preco = parseFloat(linha["Preço Total"].replace("R$", "").replace(",", ".").replace(" ", ""));
        const lucro = parseFloat(linha["Lucro Total"].replace("R$", "").replace(",", ".").replace(" ", ""));

        if (preco === 0 || !produto || !loja) continue;

        if (!resumo[loja]) {
          resumo[loja] = { totalVendas: 0, totalLucro: 0, quantidade: 0 };
        }

        resumo[loja].totalVendas += preco;
        resumo[loja].totalLucro += lucro;
        resumo[loja].quantidade += 1;
      }

      await set(ref(database, 'resumo'), resumo);

      res.status(200).json({ status: 'Resumo salvo com sucesso.' });
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}