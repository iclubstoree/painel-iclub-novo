
// Configuração Firebase (substituir com suas credenciais reais)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  databaseURL: "https://SEU_PROJETO.firebaseio.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

// Inicialização Firebase
firebase.initializeApp(firebaseConfig);

// Exemplo: ler dados
firebase.database().ref("/dados").once("value").then(snapshot => {
  document.getElementById("output").innerText = JSON.stringify(snapshot.val(), null, 2);
}).catch(error => {
  document.getElementById("output").innerText = "Erro ao carregar dados: " + error.message;
});
