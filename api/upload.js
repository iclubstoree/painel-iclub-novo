import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import formidable from "formidable";
import fs from "fs";
import csvParser from "csv-parser";

export const config = {
  api: {
    bodyParser: false,
  },
};

const firebaseConfig = {
  apiKey: "SUA_CHAVE",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  databaseURL: "https://SEU_DOMINIO.firebaseio.com",
  projectId: "SEU_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send("Erro ao processar arquivo");

    const filePath = files.file.filepath;
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ";" }))
      .on("data", (data) => {
        const loja = data["Loja"]?.trim();
        const produto = data["Produto"]?.trim();
        const preco = parseFloat(data["Preço Total"].replace("R$", "").replace(",", ".").replace(/\s/g, ""));
        const lucro = parseFloat(data["Lucro Total"].replace("R$", "").replace(",", ".").replace(/\s/g, ""));
        if (loja && produto && preco > 0) {
          results.push({ loja, produto, preco, lucro });
        }
      })
      .on("end", async () => {
        const resumo = {};

        for (const item of results) {
          if (!resumo[item.loja]) resumo[item.loja] = { vendas: 0, lucro: 0, produtos: 0 };
          resumo[item.loja].vendas += item.preco;
          resumo[item.loja].lucro += item.lucro;
          resumo[item.loja].produtos += 1;
        }

        await set(ref(db, "vendas"), resumo);
        res.status(200).send("Upload e gravação no Firebase concluídos.");
      });
  });
}
