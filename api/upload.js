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
      delimiter: ',',
      trim: true
    });

    const resumo = {};
    for (const row of records) {
      const loja = row['Loja']?.trim();
      const precoStr = row['Preço Total']?.replace(/\./g, '').replace(',', '.').trim();
      const lucroStr = row['Lucro Total']?.replace(/\./g, '').replace(',', '.').trim();

      const preco = parseFloat(precoStr);
      const lucro = parseFloat(lucroStr);

      if (!preco || preco <= 0 || !loja) continue;

      if (!resumo[loja]) resumo[loja] = { vendas: 0, lucro: 0 };
      resumo[loja].vendas += preco;
      resumo[loja].lucro += isNaN(lucro) ? 0 : lucro;
    }

    return res.status(200).json({ mensagem: "Upload concluído!", lojas: Object.keys(resumo), resumo });
  } catch (err) {
    console.error("Erro na função upload:", err);
    return res.status(500).send("Erro interno: " + err.message);
  }
}