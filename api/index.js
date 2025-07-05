
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const app = express();
const upload = multer({ dest: '/tmp' });

app.post('/api/upload', upload.single('file'), (req, res) => {
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
          path.join(__dirname, '..', folder, 'dados.json'),
          JSON.stringify({
            qtd: lojas[loja].qtd,
            vendas: parseFloat(lojas[loja].vendas.toFixed(2)),
            lucro: parseFloat(lojas[loja].lucro.toFixed(2))
          })
        );
      }
      res.send('Planilha processada com sucesso!');
    });
});

module.exports = app;
