
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseCSV(fileContent) {
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records
    .filter((row) => {
      const precoTotal = parseFloat(row['Preço Total'].replace('R$', '').replace(',', '.')) || 0;
      return precoTotal > 0;
    })
    .map((row) => ({
      loja: row['Loja'] || 'Desconhecida',
      produto: row['Produto'] || 'Sem nome',
      precoTotal: parseFloat(row['Preço Total'].replace('R$', '').replace(',', '.')) || 0,
      lucroTotal: parseFloat(row['Lucro Total'].replace('R$', '').replace(',', '.')) || 0,
    }));
}

export default async function handler(req, res) {
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const fileContent = buffer.toString('utf-8');
    const vendas = parseCSV(fileContent);

    // Aqui você pode salvar as vendas no Firebase, banco, etc.
    console.log('Vendas processadas:', vendas.length);

    res.status(200).json({ message: 'Planilha processada com sucesso!', total: vendas.length });
  } catch (error) {
    console.error('Erro ao processar planilha:', error);
    res.status(500).json({ error: 'Erro interno no servidor ao processar a planilha.' });
  }
}
