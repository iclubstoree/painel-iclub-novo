export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString();

    console.log("Dados recebidos:", data);
    res.status(200).send("Upload concluído com sucesso");
  } catch (error) {
    console.error("Erro ao processar upload:", error);
    res.status(500).send("Erro no servidor");
  }
}