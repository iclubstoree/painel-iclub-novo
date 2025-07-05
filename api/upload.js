
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ dest: '/tmp' });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  await runMiddleware(req, res, upload.single('file'));

  const lojas = {
    CASTANHAL: { qtd: 0, vendas: 0, lucro: 0 },
    BELÉM: { qtd: 0, vendas: 0, lucro: 0 },
    MIX: { qtd: 0, vendas: 0, lucro: 0 }
  };

  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: ';' }))
    .on('data', (row) => {
      try {
        const loja = row['Loja'];
        const qtd = parseInt(row['Qtd'] || '0');
        const preco = parseFloat((row['Preço Total'] || '0').replace(/\s/g, '').replace(',', '.'));
        const lucro = parseFloat((row['Lucro Total'] || '0').replace(/\s/g, '').replace(',', '.'));
        if (preco > 0 && lojas[loja]) {
          lojas[loja].qtd += qtd;
          lojas[loja].vendas += preco;
          lojas[loja].lucro += lucro;
        }
      } catch {}
    })
    .on('end', () => {
      for (const loja in lojas) {
        const folder = loja.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        fs.writeFileSync(
          path.join(process.cwd(), folder, 'dados.json'),
          JSON.stringify({
            qtd: lojas[loja].qtd,
            vendas: parseFloat(lojas[loja].vendas.toFixed(2)),
            lucro: parseFloat(lojas[loja].lucro.toFixed(2))
          })
        );
      }
      res.status(200).send('Planilha processada com sucesso!');
    });
}
