import { parse } from 'csv-parse/sync';

export const config = {
  api: {
    bodyParser: false,
  },
};

import multer from 'multer';
import nextConnect from 'next-connect';
import fs from 'fs';

const upload = multer({ dest: '/tmp' });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Erro: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  },
});

apiRoute.use(upload.single('file'));

apiRoute.post((req, res) => {
  const content = fs.readFileSync(req.file.path, 'utf-8');
  const records = parse(content, {
    columns: true,
    delimiter: ';',
    skip_empty_lines: true
  });

  const dadosFiltrados = records
    .filter(r => r["Preço Total"] && r["Preço Total"] !== "0,00")
    .map(r => ({
      loja: r["Loja"],
      lucro: parseFloat(r["Lucro Total"].replace('.', '').replace(',', '.')),
      preco: parseFloat(r["Preço Total"].replace('.', '').replace(',', '.'))
    }));

  const resumoPorLoja = {};

  for (const item of dadosFiltrados) {
    if (!resumoPorLoja[item.loja]) {
      resumoPorLoja[item.loja] = { vendas: 0, lucro: 0, produtos: 0 };
    }
    resumoPorLoja[item.loja].vendas += item.preco;
    resumoPorLoja[item.loja].lucro += item.lucro;
    resumoPorLoja[item.loja].produtos += 1;
  }

  const resultado = Object.entries(resumoPorLoja).map(([loja, dados]) => ({
    Loja: loja,
    "Total de Vendas": `R$ ${dados.vendas.toFixed(2).replace('.', ',')}`,
    "Lucro Total": `R$ ${dados.lucro.toFixed(2).replace('.', ',')}`,
    "Produtos Vendidos": dados.produtos
  }));

  res.status(200).json({ success: true, resumo: resultado });
});

export default apiRoute;