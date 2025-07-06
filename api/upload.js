
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import formidable from "formidable";
import fs from "fs";
import csv from "csv-parser";
import { firebaseConfig } from "../../firebaseConfig";

export const config = {
  api: {
    bodyParser: false,
  },
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).send("Erro ao fazer upload.");
      return;
    }

    const file = files.file[0];
    const results = [];

    fs.createReadStream(file.filepath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => {
        if (data["Preço Total"] !== "0") results.push(data);
      })
      .on("end", async () => {
        try {
          const resumo = {};
          results.forEach((row) => {
            const loja = row["Loja"];
            const preco = parseFloat(row["Preço Total"].replace("R$", "").replace(",", ".").trim()) || 0;
            const lucro = parseFloat(row["Lucro Total"].replace("R$", "").replace(",", ".").trim()) || 0;

            if (!resumo[loja]) resumo[loja] = { total: 0, lucro: 0, produtos: 0 };
            resumo[loja].total += preco;
            resumo[loja].lucro += lucro;
            resumo[loja].produtos += 1;
          });

          await set(ref(db, "resumo"), resumo);
          res.status(200).send("Resumo salvo com sucesso.");
        } catch (error) {
          console.error(error);
          res.status(500).send("Erro ao salvar no Firebase.");
        }
      });
  });
}
