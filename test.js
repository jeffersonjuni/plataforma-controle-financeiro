
async function test() {
  // Criar usuário
  let res = await fetch("http://localhost:3000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "olivia",
      email: "olivia@email.com",
      password: "oliv2525*",
    }),
  });
  let data = await res.json();
  console.log("Usuário criado:", data);

  // Criar conta
  res = await fetch("http://localhost:3000/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: data.id,
      name: "Conta Corrente",
      type: "CORRENTE",
      balance: 7500,
    }),
  });
  data = await res.json();
  console.log("Conta criada:", data);

  // Criar transação
  res = await fetch("http://localhost:3000/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountId: data.id,
      description: "Compra Amazon",
      amount: 377,
      type: "SAIDA",
    }),
  });
  data = await res.json();
  console.log("Transação criada:", data);
}

test();
