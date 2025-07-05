import { writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const csvString = buffer.toString("utf-8");

    const records = parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      trim: true
    });

    const resumo = {};
    for (const row of records) {
      const loj = row['Loja']?.trim() || 'Desconhecida';
      const preco = parseFloat(
        row['Preço Total']
          .replace(/R\$|\s/g, '')
          .replace(/\.(?=\d{3},)/g, '')
          .replace(',', '.')
      );

      const lucro = parseFloat(
        row['Lucro Total']
          .replace(/R\$|\s/g, '')
          .replace(/\.(?=\d{3},)/g, '')
          .replace(',', '.')
      );

      if (!preco || preco <= 0) continue;

      if (!resumo[loj]) resumo[loj] = { vendas: 0, lucro: 0 };
      resumo[loj].vendas += preco;
      resumo[loj].lucro += lucro;
    }

    writeFileSync("/tmp/dados.json", JSON.stringify(resumo));
    return res.status(200).send("Upload concluído! Lojas: " + Object.keys(resumo).join(", "));
  } catch (err) {
    console.error("Erro na função upload:", err);
    return res.status(500).send("Erro interno: " + err.message);
  }
}