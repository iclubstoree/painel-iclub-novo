import { useState } from 'react';

export default function Home() {
  const [resumo, setResumo] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      setResumo(data.resumo);
      setMensagem('✅ Upload realizado com sucesso!');
    } else {
      setMensagem('❌ Erro ao processar a planilha.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Painel Administrativo - Upload de Vendas</h2>
      <input type="file" accept=".csv" onChange={handleUpload} />
      <p>{mensagem}</p>
      {resumo && (
        <table border="1" cellPadding="8" style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Loja</th>
              <th>Total de Vendas</th>
              <th>Lucro Total</th>
              <th>Produtos Vendidos</th>
            </tr>
          </thead>
          <tbody>
            {resumo.map((linha, idx) => (
              <tr key={idx}>
                <td>{linha.Loja}</td>
                <td>{linha["Total de Vendas"]}</td>
                <td>{linha["Lucro Total"]}</td>
                <td>{linha["Produtos Vendidos"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}