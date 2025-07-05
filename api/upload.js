import { writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const chunks = [];
  req.on("data", chunk => chunks.push(chunk));
  req.on("end", () => {
    const buffer = Buffer.concat(chunks);
    const csv = buffer.toString("utf-8");
    const records = parse(csv, { columns: true, skip_empty_lines: true });

    const resumo = {};
    records.forEach(({ Loja, Produto, "Preço Total": preco, "Lucro Total": lucro }) => {
      const valor = parseFloat(preco.replace(",", "."));
      const ganho = parseFloat(lucro.replace(",", "."));
      if (!valor || valor === 0) return;

      if (!resumo[Loja]) resumo[Loja] = { vendas: 0, lucro: 0 };
      resumo[Loja].vendas += valor;
      resumo[Loja].lucro += ganho;
    });

    writeFileSync("/tmp/dados.json", JSON.stringify(resumo));
    res.status(200).send("Upload concluído com sucesso");
  });
}