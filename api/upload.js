
import { parse } from 'csv-parse/sync';

export const config = {
  api: {
    bodyParser: false,
  },
};

function limparValor(valor) {
  if (!valor) return 0;
  const limpo = valor.replace(/[^0-9,]/g, '').replace(',', '.');
  return parseFloat(limpo) || 0;
}

function parseCSV(fileContent) {
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ';',
    trim: true,
  });

  return records
    .filter((row) => limparValor(row['Preço Total']) > 0)
    .map((row) => ({
      loja: row['Loja'] || 'Desconhecida',
      produto: row['Produto'] || 'Sem nome',
      precoTotal: limparValor(row['Preço Total']),
      lucroTotal: limparValor(row['Lucro Total']),
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

    // Aqui você pode salvar os dados onde quiser
    console.log('Vendas processadas:', vendas.length);

    res.status(200).json({ message: 'Planilha processada com sucesso!', total: vendas.length });
  } catch (error) {
    console.error('Erro ao processar a planilha:', error);
    res.status(500).json({ error: 'Erro interno ao processar a planilha.' });
  }
}
