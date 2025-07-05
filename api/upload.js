export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const chunks = [];
  req.on("data", chunk => chunks.push(chunk));
  req.on("end", () => {
    const buffer = Buffer.concat(chunks);
    console.log("Arquivo recebido com", buffer.length, "bytes");
    res.status(200).send("Upload concluído com sucesso");
  });
}